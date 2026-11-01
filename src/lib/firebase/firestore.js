// Import a helper that generates sample restaurant and review data.
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import Firestore functions for querying, reading, writing, and listening to database data.
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

// Import the shared Firestore database instance.
import { db } from "@/src/lib/firebase/clientApp";

// Export an async function that updates a restaurant's image URL.
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // Create a reference to the specific restaurant document by ID.
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);

  // If the document reference exists, update its photo field.
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Define an async helper that updates restaurant ratings and creates a new review.
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  // Read the current restaurant document within the transaction.
  const restaurant = await transaction.get(docRef);

  // Get the restaurant's current data.
  const data = restaurant.data();

  // Calculate the new total number of ratings, defaulting to 1 if none exist.
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;

  // Calculate the new sum of all ratings, starting from zero if necessary.
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);

  // Calculate the new average rating.
  const newAverage = newSumRating / newNumRatings;

  // Update the restaurant document with the new rating statistics.
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
    // New field to authenticate and verify the last user who left a review
    lastReviewUserId: review.userId,
  });

  // Create the new review document with a current timestamp.
  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

// Export an async function that adds a review to a restaurant.
export async function addReviewToRestaurant(db, restaurantId, review) {
  // Throw an error if no restaurant ID was provided.
  if (!restaurantId) {
    throw new Error("No restaurant ID has been provided.");
  }

  // Throw an error if no valid review was provided.
  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  try {
    // Create a reference to the restaurant document.
    const docRef = doc(collection(db, "restaurants"), restaurantId);

    // Create a reference for a new review document in the restaurant's ratings collection.
    const newRatingDocument = doc(
      collection(db, `restaurants/${restaurantId}/ratings`),
    );

    // Run a transaction that updates rating totals and adds the review atomically.
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review),
    );
  } catch (error) {
    // Log and rethrow any error that occurs while adding the review.
    console.error(
      "There was an error adding the rating to the restaurant",
      error,
    );
    throw error;
  }
}

// Define a helper that adds filters and sorting to a Firestore query.
function applyQueryFilters(q, { category, city, price, sort }) {
  // Filter by category if one is provided.
  if (category) {
    q = query(q, where("category", "==", category));
  }

  // Filter by city if one is provided.
  if (city) {
    q = query(q, where("city", "==", city));
  }

  // Filter by price level if one is provided.
  if (price) {
    q = query(q, where("price", "==", price.length));
  }

  // Sort by average rating by default or when "Rating" is selected.
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    // Sort by number of reviews when "Review" is selected.
    q = query(q, orderBy("numRatings", "desc"));
  }

  // Return the configured query.
  return q;
}

// Export an async function that fetches restaurants once, with optional filters.
export async function getRestaurants(db = db, filters = {}) {
  // Start with a query for all restaurant documents.
  let q = query(collection(db, "restaurants"));

  // Apply any requested filters and sorting.
  q = applyQueryFilters(q, filters);

  // Execute the query and retrieve the matching documents.
  const results = await getDocs(q);

  // Convert each Firestore document into a plain JavaScript object.
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Convert the Firestore timestamp to a JavaScript Date object.
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Export a function that listens for live updates to the restaurant list.
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Validate that the callback is a function.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Start with a query for all restaurant documents.
  let q = query(collection(db, "restaurants"));

  // Apply any requested filters and sorting.
  q = applyQueryFilters(q, filters);

  // Subscribe to real-time updates from Firestore.
  return onSnapshot(q, (querySnapshot) => {
    // Convert each updated document into a plain JavaScript object.
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Convert the Firestore timestamp to a JavaScript Date object.
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Pass the latest restaurant list to the callback.
    cb(results);
  });
}

export async function getRestaurantById(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  const docRef = doc(db, "restaurants", restaurantId);
  const docSnap = await getDoc(docRef);
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Export a function that listens for live updates to one restaurant.
export function getRestaurantSnapshotById(restaurantId, cb) {
  // Validate that a restaurant ID was provided.
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }

  // Validate that the callback is a function.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create a reference to the specified restaurant document.
  const docRef = doc(db, "restaurants", restaurantId);

  // Subscribe to real-time updates for that document.
  return onSnapshot(docRef, (docSnap) => {
    // Pass the restaurant data to the callback with its timestamp converted.
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}

// Export an async function that fetches all reviews for a restaurant.
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Validate the restaurant ID.
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create a query for the restaurant's reviews, sorted newest first.
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Execute the query and retrieve the review documents.
  const results = await getDocs(q);

  // Convert each review document into a plain JavaScript object.
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Export a function that listens for live updates to a restaurant's reviews.
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Validate the restaurant ID.
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create a query for the restaurant's reviews, sorted newest first.
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Subscribe to real-time review updates.
  return onSnapshot(q, (querySnapshot) => {
    // Convert each review document into a plain JavaScript object.
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Pass the latest review list to the callback.
    cb(results);
  });
}

// Export an async function that adds sample restaurants and reviews to Firestore.
export async function addFakeRestaurantsAndReviews() {
  // Generate the sample restaurant and review data.
  const data = await generateFakeRestaurantsAndReviews();

  // Loop through each generated restaurant and its reviews.
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add the restaurant document and get its generated ID.
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Loop through the reviews associated with that restaurant.
      for (const ratingData of ratingsData) {
        // Add each review to the restaurant's ratings collection.
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // Log any errors that occur while inserting the sample data.
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}