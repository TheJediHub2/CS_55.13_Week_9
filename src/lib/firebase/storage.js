// Import Firebase Storage functions for uploading files and getting their public URLs.
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Import the initialized Firebase Storage instance.
import { storage } from "@/src/lib/firebase/clientApp";

// Import a Firestore helper that updates the restaurant document with an image URL.
import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

// Define an async function that uploads a restaurant image and saves its URL.
export async function updateRestaurantImage(restaurantId, image) {
  try {
    // Throw an error if no restaurant ID was provided.
    if (!restaurantId) {
      throw new Error("No restaurant ID has been provided.");
    }

    // Throw an error if the image is missing or does not have a filename.
    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }

    // Upload the image to Firebase Storage and get its public download URL.
    const publicImageUrl = await uploadImage(restaurantId, image);

    // Save the image URL in the restaurant's Firestore document.
    await updateRestaurantImageReference(restaurantId, publicImageUrl);

    // Return the public URL of the uploaded image.
    return publicImageUrl;
  } catch (error) {
    // Log any error that occurs during validation, upload, or database update.
    console.error("Error processing request:", error);
  }
}

// Define a helper function to upload an image to Firebase Storage.
async function uploadImage(restaurantId, image) {
  // Build the storage path using the restaurant ID and original image filename.
  const filePath = `images/${restaurantId}/${image.name}`;

  // Create a reference to the location where the image will be stored.
  const newImageRef = ref(storage, filePath);

  // Upload the image file to Firebase Storage.
  await uploadBytesResumable(newImageRef, image);

  // Get and return the publicly accessible download URL for the uploaded image.
  return await getDownloadURL(newImageRef);
}