// Import the class listing component.
import ClassListings from "@/src/components/ClassListings.jsx";
// Import the class fetch helper.
import { getClasses } from "@/src/lib/firebase/firestore.js";
// Import the server-side Firebase helper.
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import the Firestore helper.
import { getFirestore } from "firebase/firestore";

// Force Next.js to render this route dynamically.
export const dynamic = "force-dynamic";

// Define the home page component.
export default async function Home(props) {
  // Read the incoming query parameters.
  const searchParams = await props.searchParams;
  // Create an authenticated server-side Firebase app.
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Fetch classes using the active filters.
  // Show the page shell when the project rules have not been deployed yet.
  let classes = [];
  try {
    classes = await getClasses(
      // Get the Firestore database instance.
      getFirestore(firebaseServerApp),
      // Pass the current query parameters.
      searchParams
    );
  } catch (error) {
    console.error("Could not load classes:", error);
  }
  // Return the page layout.
  return (
    // Render the main page container.
    <main className="main__home">
      {/* Render the class listings component. */}
      <ClassListings initialClasses={classes} searchParams={searchParams} />
    </main>
  );
}
