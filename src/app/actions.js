"use server";

import { addReviewToClass } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

// This is a Server Action
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
// Replace the function below
export async function handleReviewFormSubmission(data) {
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();
  const db = getFirestore(firebaseServerApp);

  await addReviewToClass(db, data.get("classId"), {
    text: data.get("text"),
    rating: data.get("rating"),

    // This came from a hidden form field.
    // userId: data.get("userId"),
    userId: currentUser.uid,
  });
}
