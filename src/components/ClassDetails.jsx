// This component shows class metadata, and offers some actions to the user like uploading a new class image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

function formatUnits(units) {
  return `${units} ${Number(units) === 1 ? "unit" : "units"}`;
}

const ClassDetails = ({
  course,
  userId,
  handleClassImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <section className="img__section">
      <img src={course.photo} alt={course.name} />

      <div className="actions">
        {userId && (
          <img
            alt="review"
            className="review"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
          />
        )}
        <label
          onChange={(event) => handleClassImage(event.target)}
          htmlFor="upload-image"
          className="add"
        >
          <input
            name=""
            type="file"
            id="upload-image"
            className="file-input hidden w-full h-full"
          />

          <img className="add-image" src="/add.svg" alt="Add image" />
        </label>
      </div>

      <div className="details__container">
        <div className="details">
          <h2>{course.name}</h2>

          <div className="class__rating">
            <ul>{renderStars(course.avgRating)}</ul>

            <span>({course.numRatings})</span>
          </div>

          <p>
            {course.category} | {course.semester}
          </p>
          <p>{formatUnits(course.units)}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default ClassDetails;
