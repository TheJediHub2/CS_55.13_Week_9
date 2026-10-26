// Mark this file as a Next.js Client Component.
"use client";


// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx


// Import React and hooks for managing component state, side effects, and suspense boundaries.
import { React, useState, useEffect, Suspense } from "react";

// Import Next.js's dynamic import helper for loading components lazily.
import dynamic from "next/dynamic";

// Import the Firestore function that listens for live updates to one restaurant.
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";

// Import the hook or helper that retrieves the currently authenticated user.
import { useUser } from "@/src/lib/getUser";

// Import the component that displays the restaurant's details.
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";

// Import the function that uploads a new restaurant image and updates its reference.
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";


// Dynamically import the review dialog component so it loads only when needed.
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));


// Define and export the Restaurant component with its incoming props.
export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  // Create state that holds the current restaurant details, initialized with the provided restaurant data.
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);

  // Create state that tracks whether the review dialog is open.
  const [isOpen, setIsOpen] = useState(false);


  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog

  // Get the signed-in user's ID, or fall back to the initial user ID if no user is signed in.
  const userId = useUser()?.uid || initialUserId;

  // Create state that holds the review's rating and text.
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });


  // Define a function that updates a field in the review state.
  const onChange = (value, name) => {
    // Copy the current review and update the specified field with the new value.
    setReview({ ...review, [name]: value });
  };


  // Define an async function that handles a newly selected restaurant image.
  async function handleRestaurantImage(target) {
    // Get the first selected file from the file input, or null if no file was selected.
    const image = target.files ? target.files[0] : null;

    // Stop if no image file was selected.
    if (!image) {
      return;
    }


    // Upload the selected image and get its public URL.
    const imageURL = await updateRestaurantImage(id, image);

    // Update the restaurant details state with the new image URL.
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }


  // Define a function that closes the review dialog and resets the review form.
  const handleClose = () => {
    // Set the dialog's open state to false.
    setIsOpen(false);

    // Reset the review rating and text to their initial values.
    setReview({ rating: 0, text: "" });
  };


  // Run this effect when the restaurant ID changes.
  useEffect(() => {
    // Subscribe to live updates for this restaurant and return the unsubscribe function.
    return getRestaurantSnapshotById(id, (data) => {
      // Update the restaurant details whenever new data arrives.
      setRestaurantDetails(data);
    });
  }, [id]);


  // Return the restaurant details and, when applicable, the review dialog.
  return (
    <>
      {/* Render the restaurant details and pass down its data and handlers. */}
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {/* Render any child content passed into this component. */}
        {children}
      </RestaurantDetails>

      {/* Render the review dialog only if a user ID is available. */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          {/* Lazily render the review dialog with its required props. */}
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}