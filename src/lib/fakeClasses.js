import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { classes, classReviews, semester } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

export async function generateFakeClassesAndReviews() {
  const classesToAdd = 5;
  const data = [];

  for (let i = 0; i < classesToAdd; i++) {
    const classTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this class
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(classTimestamp.toDate())
      );

      const ratingData = {
        rating:
          classReviews[randomNumberBetween(0, classReviews.length - 1)].rating,
        text: classReviews[randomNumberBetween(0, classReviews.length - 1)]
          .text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    const course = classes[randomNumberBetween(0, classes.length - 1)];

    const classData = {
      category: course.category,
      name: course.name,
      avgRating,
      semester: semester[randomNumberBetween(0, semester.length - 1)],
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      units: course.units,
      photo: "/class-placeholder.svg",
      timestamp: classTimestamp,
    };

    data.push({
      classData,
      ratingsData,
    });
  }
  return data;
}
