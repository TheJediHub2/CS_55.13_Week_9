// Mark this file as a Next.js Client Component.
"use client";

// This component shows one individual class
// It receives data from src/app/class/[id]/page.jsx

// Import React and hooks for managing component state, side effects, and suspense boundaries.
import { React, useState, useEffect, Suspense } from "react";

// Import Next.js's dynamic import helper for loading components lazily.
import dynamic from "next/dynamic";

// Import the Firestore function that listens for live updates to one class.
import { getClassSnapshotById } from "@/src/lib/firebase/firestore.js";

// Import the hook or helper that retrieves the currently authenticated user.
import { useUser } from "@/src/lib/getUser";

// Import the component that displays the class's details.
import ClassDetails from "@/src/components/ClassDetails.jsx";

// Import the function that uploads a new class image and updates its reference.
import { updateClassImage } from "@/src/lib/firebase/storage.js";

// Dynamically import the review dialog component so it loads only when needed.
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// Define and export the class review component with its incoming props.
export default function ClassReview({
  id,
  initialClass,
  initialUserId,
  children,
}) {
  // Create state that holds the current class details, initialized with the provided class data.
  const [classDetails, setClassDetails] = useState(initialClass);

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

  // Define an async function that handles a newly selected class image.
  async function handleClassImage(target) {
    // Get the first selected file from the file input, or null if no file was selected.
    const image = target.files ? target.files[0] : null;

    // Stop if no image file was selected.
    if (!image) {
      return;
    }

    // Upload the selected image and get its public URL.
    const imageURL = await updateClassImage(id, image);

    // Update the class details state with the new image URL.
    setClassDetails({ ...classDetails, photo: imageURL });
  }

  // Define a function that closes the review dialog and resets the review form.
  const handleClose = () => {
    // Set the dialog's open state to false.
    setIsOpen(false);

    // Reset the review rating and text to their initial values.
    setReview({ rating: 0, text: "" });
  };

  // Run this effect when the class ID changes.
  useEffect(() => {
    // Subscribe to live updates for this class and return the unsubscribe function.
    return getClassSnapshotById(id, (data) => {
      // Update the class details whenever new data arrives.
      setClassDetails(data);
    });
  }, [id]);

  // Return the class details and, when applicable, the review dialog.
  return (
    <>
      {/* Render the class details and pass down its data and handlers. */}
      <ClassDetails
        course={classDetails}
        userId={userId}
        handleClassImage={handleClassImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {/* Render any child content passed into this component. */}
        {children}
      </ClassDetails>

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
