// Import Google AI model and plugin for use with Genkit.
// import { gemini20Flash, googleAI } from "@genkit-ai/googleai";

// Import Genkit, a framework for building AI-powered features.
import { genkit } from "genkit";
import { googleAI, gemini } from '@genkit-ai/googleai';

// Import the Firestore helper that retrieves reviews for a restaurant.
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js";

// Import the server-side Firebase app helper for authenticated users.
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";

// Import Firestore's function to create a database instance from a Firebase app.
import { getFirestore } from "firebase/firestore";

// Export an async React server component that summarizes restaurant reviews.
export async function GeminiSummary({ restaurantId }) {
  // Get an authenticated Firebase server app for the current user.
  const { firebaseServerApp } = await getAuthenticatedAppForUser();

  // Fetch all reviews for the specified restaurant from Firestore.
  const reviews = await getReviewsByRestaurantId(
    getFirestore(firebaseServerApp),
    restaurantId
  );

  // Define the character used to separate individual reviews in the prompt.
  const reviewSeparator = "@";

  // Build the prompt containing all review text, separated by the separator character.
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 


    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    // Throw an error if the Gemini API key environment variable is missing.
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // [https://genkit.dev/docs/get-started/](https://genkit.dev/docs/get-started/)
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance with the Google AI plugin and default Gemini model.
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini('gemini-3.8-flash'), // or actual stable model 
    });

    // Send the prompt to Gemini and extract the generated summary text.
    const { text } = await ai.generate(prompt);

    // Return the AI-generated summary in a styled React component.
    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    // Log any error that occurs while generating the summary.
    console.error(e);

    // Return a user-friendly error message.
    return <p>Error summarizing reviews.</p>;
  }
}

// Export a loading placeholder component shown while reviews are being summarized.
export function GeminiSummarySkeleton() {
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}