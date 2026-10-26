// Mark this file as a client component because it uses browser APIs and React hooks.
"use client";
// Import React and the effect hook for subscribing to auth changes.
import React, { useEffect } from "react";
// Import the Next.js link component for page navigation.
import Link from "next/link";
// Import the auth helpers for Google sign-in, sign-out, and token change tracking.
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
// Import the helper for creating sample restaurant data in Firestore.
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
// Import cookie helpers for storing the current user session token.
import { setCookie, deleteCookie } from "cookies-next";

// Define a hook that keeps the cookie in sync with the current Firebase user session.
function useUserSession(initialUser) {
  // Subscribe to token changes and update the session cookie whenever the user changes.
  useEffect(() => {
    return onIdTokenChanged(async (user) => {
      // If a user is signed in, save the ID token to a cookie.
      if (user) {
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        // If there is no user, clear the session cookie.
        await deleteCookie("__session");
      }
      // Skip reloading the page if the same user is still active.
      if (initialUser?.uid === user?.uid) {
        return;
      }
      // Reload the app so the server-rendered layout reflects the new auth state.
      window.location.reload();
    });
  }, [initialUser]);

  // Return the current user object from the parent props.
  return initialUser;
}

// Define the main header component for the app shell.
export default function Header({ initialUser }) {
  // Get the current user from the custom session hook.
  const user = useUserSession(initialUser);

  // Handle a sign-out action triggered by the menu button.
  const handleSignOut = (event) => {
    event.preventDefault();
    signOut();
  };

  // Handle a sign-in action triggered by the login link.
  const handleSignIn = (event) => {
    event.preventDefault();
    signInWithGoogle();
  };

  // Render the header layout.
  return (
    <>
      {/* Render the main header element that contains the brand and user menu. */}
      <header>
        {/* Link back to the home page and show the Friendly Eats logo. */}
        <Link href="/" className="logo">
          <img src="/friendly-eats.svg" alt="FriendlyEats" />
          Friendly Eats
        </Link>
        {/* Show a signed-in profile panel or a prompt to sign in. */}
        {user ? (
          <>
            <div className="profile">
              <p>
                <img
                  className="profileImage"
                  src={user.photoURL || "/profile.svg"}
                  alt={user.email}
                />
                {user.displayName}
              </p>

              <div className="menu">
                ...
                <ul>
                  <li>{user.displayName}</li>

                  <li>
                    <a href="#" onClick={addFakeRestaurantsAndReviews}>
                      Add sample restaurants
                    </a>
                  </li>

                  <li>
                    <a href="#" onClick={handleSignOut}>
                      Sign Out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="profile">
            <a href="#" onClick={handleSignIn}>
              <img src="/profile.svg" alt="A placeholder user image" />
              Sign In with Google
            </a>
          </div>
        )}
      </header>
    </>
  );
}
