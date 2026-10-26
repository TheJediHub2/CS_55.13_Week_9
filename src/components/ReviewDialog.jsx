// Mark this component as a Client Component so it can use browser features and React state/effects.
"use client";

// This component handles the review dialog and uses a Next.js feature known as Server Actions to handle the form submission.

// Import React hooks for effects and element references.
import { useEffect, useLayoutEffect, useRef } from "react";

// Import the rating selection component.
import RatingPicker from "@/src/components/RatingPicker.jsx";

// Import the server action that processes the submitted review form.
import { handleReviewFormSubmission } from "@/src/app/actions.js";

// Define the review dialog component and accept its props.
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  // Create a reference to the native HTML dialog element.
  const dialog = useRef();

  // Open or close the dialog whenever its open state changes.
  useLayoutEffect(() => {
    if (isOpen) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [isOpen, dialog]);

  // Define a click handler for the dialog backdrop.
  const handleClick = (e) => {
    // Close the dialog if the user clicks outside its inner content.
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  // Render the review dialog and its form.
  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleReviewFormSubmission}
        onSubmit={() => {
          handleClose();
        }}
      >
        <header>
          <h3>Add your review</h3>
        </header>
        <article>
          {/* Render the interactive star rating picker. */}
          <RatingPicker />

          <p>
            {/* Capture the user's written review text. */}
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          {/* Include the restaurant ID in the form submission without displaying it. */}
          <input type="hidden" name="restaurantId" value={id} />

          {/* Include the user ID in the form submission without displaying it. */}
          <input type="hidden" name="userId" value={userId} />
        </article>
        <footer>
          <menu>
            {/* Reset the form and close the dialog when Cancel is clicked. */}
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>

            {/* Submit the review form to the server action. */}
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

// Export the component as the default export.
export default ReviewDialog;