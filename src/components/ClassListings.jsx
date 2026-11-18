"use client";

// This component handles the class listings page
// It receives data from src/app/page.js, such as the initial classes and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getClassesSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

function formatUnits(units) {
  return `${units} ${Number(units) === 1 ? "unit" : "units"}`;
}

const ClassItem = ({ course }) => (
  <li key={course.id}>
    <Link href={`/class/${course.id}`}>
      <ActiveClass course={course} />
    </Link>
  </li>
);

const ActiveClass = ({ course }) => (
  <div>
    <ImageCover photo={course.photo} name={course.name} />
    <ClassCardDetails course={course} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const ClassCardDetails = ({ course }) => (
  <div className="class__details">
    <h2>{course.name}</h2>
    <ClassRating course={course} />
    <ClassMetadata course={course} />
  </div>
);

const ClassRating = ({ course }) => (
  <div className="class__rating">
    <ul>{renderStars(course.avgRating)}</ul>
    <span>({course.numRatings})</span>
  </div>
);

const ClassMetadata = ({ course }) => (
  <div className="class__meta">
    <p>
      {course.category} | {course.semester}
    </p>
    <p>{formatUnits(course.units)}</p>
  </div>
);

export default function ClassListings({ initialClasses, searchParams }) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    semester: searchParams.semester || "",
    category: searchParams.category || "",
    units: searchParams.units || "",
    sort: searchParams.sort || "",
  };

  const [classes, setClasses] = useState(initialClasses);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getClassesSnapshot((data) => {
      setClasses(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="classes">
        {classes.map((course) => (
          <ClassItem key={course.id} course={course} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
