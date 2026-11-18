// Import a helper that generates sample class and review data.
import { generateFakeClassesAndReviews } from "@/src/lib/fakeClasses.js";

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
} from "firebase/firestore";

// Import the shared Firestore database instance.
import { db } from "@/src/lib/firebase/clientApp";

// Export an async function that updates a class's image URL.
export async function updateClassImageReference(classId, publicImageUrl) {
  // Create a reference to the specific class document by ID.
  const classRef = doc(collection(db, "classes"), classId);

  // If the document reference exists, update its photo field.
  if (classRef) {
    await updateDoc(classRef, { photo: publicImageUrl });
  }
}

// Define an async helper that updates class ratings and creates a new review.
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  // Read the current class document within the transaction.
  const course = await transaction.get(docRef);

  // Get the class's current data.
  const data = course.data();

  // Calculate the new total number of ratings, defaulting to 1 if none exist.
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;

  // Calculate the new sum of all ratings, starting from zero if necessary.
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);

  // Calculate the new average rating.
  const newAverage = newSumRating / newNumRatings;

  // Update the class document with the new rating statistics.
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

// Export an async function that adds a review to a class.
export async function addReviewToClass(db, classId, review) {
  // Throw an error if no class ID was provided.
  if (!classId) {
    throw new Error("No class ID has been provided.");
  }

  // Throw an error if no valid review was provided.
  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  try {
    // Create a reference to the class document.
    const docRef = doc(collection(db, "classes"), classId);

    // Create a reference for a new review document in the class's ratings collection.
    const newRatingDocument = doc(collection(db, `classes/${classId}/ratings`));

    // Run a transaction that updates rating totals and adds the review atomically.
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review)
    );
  } catch (error) {
    // Log and rethrow any error that occurs while adding the review.
    console.error("There was an error adding the rating to the class", error);
    throw error;
  }
}

// Define a helper that adds filters and sorting to a Firestore query.
function applyQueryFilters(q, { category, semester, units, sort }) {
  // Filter by category if one is provided.
  if (category) {
    q = query(q, where("category", "==", category));
  }

  // Filter by semester if one is provided.
  if (semester) {
    q = query(q, where("semester", "==", semester));
  }

  // Filter by units if a number of units is provided.
  if (units) {
    q = query(q, where("units", "==", Number(units)));
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

// Export an async function that fetches classes once, with optional filters.
export async function getClasses(db = db, filters = {}) {
  // Start with a query for all class documents.
  let q = query(collection(db, "classes"));

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

// Export a function that listens for live updates to the class list.
export function getClassesSnapshot(cb, filters = {}) {
  // Validate that the callback is a function.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Start with a query for all class documents.
  let q = query(collection(db, "classes"));

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

    // Pass the latest class list to the callback.
    cb(results);
  });
}

export async function getClassById(db, classId) {
  if (!classId) {
    console.log("Error: Invalid ID received: ", classId);
    return;
  }
  const docRef = doc(db, "classes", classId);
  const docSnap = await getDoc(docRef);
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Export a function that listens for live updates to one class.
export function getClassSnapshotById(classId, cb) {
  // Validate that a class ID was provided.
  if (!classId) {
    console.log("Error: Invalid ID received: ", classId);
    return;
  }

  // Validate that the callback is a function.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create a reference to the specified class document.
  const docRef = doc(db, "classes", classId);

  // Subscribe to real-time updates for that document.
  return onSnapshot(docRef, (docSnap) => {
    // Pass the class data to the callback with its timestamp converted.
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}

// Export an async function that fetches all reviews for a class.
export async function getReviewsByClassId(db, classId) {
  // Validate the class ID.
  if (!classId) {
    console.log("Error: Invalid classId received: ", classId);
    return;
  }

  // Create a query for the class's reviews, sorted newest first.
  const q = query(
    collection(db, "classes", classId, "ratings"),
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

// Export a function that listens for live updates to a class's reviews.
export function getReviewsSnapshotByClassId(classId, cb) {
  // Validate the class ID.
  if (!classId) {
    console.log("Error: Invalid classId received: ", classId);
    return;
  }

  // Create a query for the class's reviews, sorted newest first.
  const q = query(
    collection(db, "classes", classId, "ratings"),
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

// Export an async function that adds sample classes and reviews to Firestore.
export async function addFakeClassesAndReviews() {
  // Generate the sample class and review data.
  const data = await generateFakeClassesAndReviews();

  // Loop through each generated class and its reviews.
  for (const { classData, ratingsData } of data) {
    try {
      // Add the class document and get its generated ID.
      const docRef = await addDoc(collection(db, "classes"), classData);

      // Loop through the reviews associated with that class.
      for (const ratingData of ratingsData) {
        // Add each review to the class's ratings collection.
        await addDoc(
          collection(db, "classes", docRef.id, "ratings"),
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
