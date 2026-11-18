import ClassReview from "@/src/components/Class.jsx";
import { Suspense } from "react";
import { getClassById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";

export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const course = await getClassById(getFirestore(firebaseServerApp), params.id);

  return (
    <main className="main__class">
      <ClassReview
        id={params.id}
        initialClass={course}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary classId={params.id} />
        </Suspense>
      </ClassReview>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={course.numRatings} />}
      >
        <ReviewsList classId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}
