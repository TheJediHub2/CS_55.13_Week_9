// Ensure this module is only used in a server-side environment.
// This avoids accidentally exposing sensitive logic to client code.
import "server-only";

// Import the server-side cookie API and Firebase app initialization helpers.
import { cookies } from "next/headers";
import { initializeServerApp } from "firebase/app";
import { firebaseConfig } from "@/src/lib/firebase/config.js";

// Import the Firebase Auth helper used to access the authenticated user state.
import { getAuth } from "firebase/auth";

// Create a Firebase app instance that is authenticated with the current user's session cookie.
export async function getAuthenticatedAppForUser() {
  // Read the session cookie that stores the user's ID token from the client-side auth flow.
  const authIdToken = (await cookies()).get("__session")?.value;

  // Initialize a Firebase server app with the .env.local config and the current auth token.
  const firebaseServerApp = initializeServerApp(firebaseConfig, {
    // Attach the user's auth ID token so Firebase can restore the correct session.
    authIdToken,
  });

  // Get the Firebase Auth instance associated with the server app.
  const auth = getAuth(firebaseServerApp);
  // Wait for Firebase Auth to finish restoring the current user state.
  await auth.authStateReady();

  // Return the server app and the currently authenticated user.
  return { firebaseServerApp, currentUser: auth.currentUser };
}
