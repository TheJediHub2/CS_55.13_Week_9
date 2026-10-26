// Import the restaurant listing component.
import RestaurantListings from "@/src/components/RestaurantListings.jsx";
// Import the restaurant fetch helper.
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
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
  // Fetch restaurants using the active filters.
  const restaurants = await getRestaurants(
    // Get the Firestore database instance.
    getFirestore(firebaseServerApp),
    // Pass the current query parameters.
    searchParams
  );
  // Return the page layout.
  return (
    // Render the main page container.
    <main className="main__home">
      {/* Render the restaurant listings component. */}
      <RestaurantListings
        initialRestaurants={restaurants}
        searchParams={searchParams}
      />
    </main>
  );
}
