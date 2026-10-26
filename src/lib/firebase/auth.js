// Import the Firebase auth provider and listener functions from the Firebase SDK.
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

// Import the shared auth singleton from the Firebase client setup.
import { auth } from "@/src/lib/firebase/clientApp";

// Export a wrapper around Firebase's auth state observer.
export function onAuthStateChanged(cb) {
  // Pass the shared auth instance and callback to Firebase.
  return _onAuthStateChanged(auth, cb);
}

// Export a wrapper around Firebase's ID token observer.
export function onIdTokenChanged(cb) {
  // Pass the shared auth instance and callback to Firebase.
  return _onIdTokenChanged(auth, cb);
}

// Sign the user in with their Google account using a popup.
export async function signInWithGoogle() {
  // Create the Google provider object that triggers the OAuth flow.
  const provider = new GoogleAuthProvider();

  try {
    // Launch the Google sign-in popup and wait for it to complete.
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any sign-in failures so the console shows what went wrong.
    console.error("Error signing in with Google", error);
  }
}

// Sign the currently authenticated user out of Firebase.
export async function signOut() {
  try {
    // Call the Firebase sign-out method on the shared auth instance.
    return auth.signOut();
  } catch (error) {
    // Log any sign-out errors to help with debugging.
    console.error("Error signing out with Google", error);
  }
}