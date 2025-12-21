// // 1. --- Define the data structures for the games ---
// // This ensures our application knows what to expect from the API.

// export interface Question {
//   id: number;
//   question: string;
//   options: string[];
//   /** The index of the correct answer in the options array. */
//   correctAnswer: number;
//   explanation: string;
// }

// export interface WordMatch {
//   word: string;
//   meaning: string;
// }

// export interface FillInTheBlank {
//   /** A sentence with "___" as the blank. */
//   sentence: string;
//   /** The word that fills the blank. */
//   answer: string;
// }

// /**
//  * The complete JSON structure for the generated games.
//  */
// export interface GameData {
//   questions: Question[];
//   wordMatching: WordMatch[];
//   fillInTheBlanks: FillInTheBlank[];
// }

// // 2. --- Define the JSON Schema for the Gemini API ---
// // This schema tells the model *exactly* what JSON format to return.
// // It matches the GameData interface.

// const gameDataSchema = {
//   type: "OBJECT",
//   properties: {
//     questions: {
//       type: "ARRAY",
//       items: {
//         type: "OBJECT",
//         properties: {
//           id: { type: "NUMBER" },
//           question: { type: "STRING" },
//           options: { type: "ARRAY", items: { type: "STRING" } },
//           correctAnswer: { type: "NUMBER" },
//           explanation: { type: "STRING" },
//         },
//         required: ["id", "question", "options", "correctAnswer", "explanation"],
//       },
//     },
//     wordMatching: {
//       type: "ARRAY",
//       items: {
//         type: "OBJECT",
//         properties: {
//           word: { type: "STRING" },
//           meaning: { type: "STRING" },
//         },
//         required: ["word", "meaning"],
//       },
//     },
//     fillInTheBlanks: {
//       type: "ARRAY",
//       items: {
//         type: "OBJECT",
//         properties: {
//           sentence: { type: "STRING" },
//           answer: { type: "STRING" },
//         },
//         required: ["sentence", "answer"],
//       },
//     },
//   },
//   required: ["questions", "wordMatching", "fillInTheBlanks"],
// };

// // 3. --- Game Service ---
// // This class contains the logic to call the Gemini API.

// export class GeminiGameService {
//   private static readonly API_KEY = process.env['EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY'];
//   private static readonly API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.API_KEY}`;
//   private static readonly MAX_RETRIES = 3;

//   /**
//    * Helper function to pause execution for retries.
//    * @param ms - Milliseconds to wait.
//    */
//   private static delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   /**
//    * Generates educational games based on provided chapter text.
//    * @param chapterText - The source text for generating games.
//    * @returns A Promise resolving to the structured GameData.
//    */
//   static async generateGames(chapterText: string): Promise<GameData> {
//     // Construct the prompt as requested by the user.
//     const prompt = `Based on this chapter text, generate educational games in JSON format:

// "${chapterText}"

// Generate exactly this JSON structure:
// {
//   "questions": [
//     {
//       "id": 1,
//       "question": "Question based on the text",
//       "options": ["Option A", "Option B", "Option C", "Option D"],
//       "correctAnswer": 0,
//       "explanation": "Brief explanation"
//     }
//   ],
//   "wordMatching": [
//     {
//       "word": "word from text",
//       "meaning": "simple meaning"
//     }
//   ],
//   "fillInTheBlanks": [
//     {
//       "sentence": "Complete sentence with ___ blank",
//       "answer": "missing word"
//     }
//   ]
// }

// Create 5 questions, 8 word matches, and 5 fill-in-the-blanks. Use only content from the provided text.`;

//     // Construct the API payload
//     const payload = {
//       contents: [{ parts: [{ text: prompt }] }],
//       generationConfig: {
//         responseMimeType: "application/json",
//         responseSchema: gameDataSchema,
//       },
//     };

//     // --- API Call with Retry Logic ---
//     let attempt = 0;
//     while (attempt < this.MAX_RETRIES) {
//       try {
//         const response = await fetch(this.API_URL, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });

//         if (!response.ok) {
//           throw new Error(`API Error: ${response.status} ${response.statusText}`);
//         }

//         const result = await response.json();

//         const candidate = result.candidates?.[0];
//         if (!candidate?.content?.parts?.[0]?.text) {
//           throw new Error("Invalid API response structure.");
//         }

//         // The API returns the JSON as a string, so we must parse it.
//         const jsonText = candidate.content.parts[0].text;
//         const gameData: GameData = JSON.parse(jsonText);
//         console.log('Game Jason',gameData)

//         // Success! Return the parsed data.
//         return gameData;
        
//       } catch (error) {
//         console.error(`Attempt ${attempt + 1} failed:`, error);
//         attempt++;
//         if (attempt >= this.MAX_RETRIES) {
//           throw new Error("Failed to generate games after multiple attempts.");
//         }
//         // Exponential backoff: 1s, 2s, 4s...
//         const delayMs = Math.pow(2, attempt) * 1000;
//         await this.delay(delayMs);
//       }
//     }

//     // This line should be unreachable, but satisfies TypeScript's requirement
//     // for all code paths to return a value.
//     throw new Error("Failed to generate games.");
//   }
// }


// Import the Firebase AI SDK
import {
  getAI,
  getGenerativeModel,
  GenerationConfig,
  Schema,
} from '@react-native-firebase/ai';

// 1. --- Define the data structures for the games (UNCHANGED) ---
// This ensures our application knows what to expect from the API.

export interface Question {
  id: number;
  question: string;
  options: string[];
  /** The index of the correct answer in the options array. */
  correctAnswer: number;
  explanation: string;
}

export interface WordMatch {
  word: string;
  meaning: string;
}

export interface FillInTheBlank {
  /** A sentence with "___" as the blank. */
  sentence: string;
  /** The word that fills the blank. */
  answer: string;
}

/**
 * The complete JSON structure for the generated games.
 */
export interface GameData {
  questions: Question[];
  wordMatching: WordMatch[];
  fillInTheBlanks: FillInTheBlank[];
}

// 2. --- Define the JSON Schema for the Firebase AI SDK ---
// This tells the model *exactly* what JSON format to return.
// It is now built using the SDK's `Schema` helper.
const gameDataSchema = Schema.object({
  properties: {
    questions: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.number(),
          question: Schema.string(),
          options: Schema.array({ items: Schema.string() }),
          correctAnswer: Schema.number(),
          explanation: Schema.string(),
        },
        required: ["id", "question", "options", "correctAnswer", "explanation"],
      }),
    }),
    wordMatching: Schema.array({
      items: Schema.object({
        properties: {
          word: Schema.string(),
          meaning: Schema.string(),
        },
        required: ["word", "meaning"],
      }),
    }),
    fillInTheBlanks: Schema.array({
      items: Schema.object({
        properties: {
          sentence: Schema.string(),
          answer: Schema.string(),
        },
        required: ["sentence", "answer"],
      }),
    }),
  },
  required: ["questions", "wordMatching", "fillInTheBlanks"],
});

// 3. --- Game Service (Modified for Firebase AI) ---
// This class now uses the secure @react-native-firebase/ai package.

export class GeminiGameService {
  // --- No API_KEY or API_URL needed! ---

  /**
   * Generates educational games based on provided chapter text using Firebase AI Logic.
   * @param chapterText - The source text for generating games.
   * @returns A Promise resolving to the structured GameData.
   */
  static async generateGames(chapterText: string): Promise<GameData> {
    // Construct the prompt as requested by the user. (UNCHANGED)
    const prompt = `Based on this chapter text, generate educational games in JSON format:

"${chapterText}"

Generate exactly this JSON structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question based on the text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation"
    }
  ],
  "wordMatching": [
    {
      "word": "word from text",
      "meaning": "simple meaning"
    }
  ],
  "fillInTheBlanks": [
    {
      "sentence": "Complete sentence with ___ blank",
      "answer": "missing word"
    }
  ]
}

Create 5 questions, 8 word matches, and 5 fill-in-the-blanks. Use only content from the provided text.`;

    // Define the generation config for the Firebase SDK
    const generationConfig: GenerationConfig = {
      responseMimeType: 'application/json',
      responseSchema: gameDataSchema,
    };

    // --- API Call with Firebase SDK ---
    try {
      // 1. Get the Firebase AI service
      // Assumes Firebase is initialized elsewhere in your app (e.g., in index.js or App.js)
      const ai = getAI();

      // 2. Get the model with the JSON config
      const model = getGenerativeModel(ai, {
        model: 'gemini-1.5-flash', // Standard model name for Firebase AI
        generationConfig: generationConfig,
      });

      // 3. Call the model
      const result = await model.generateContent(prompt);
      const response = result.response;

      // 4. Parse the response
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure from Firebase.');
      }

      // The API returns the JSON as a string, so we must parse it.
      const jsonText = candidate.content.parts[0].text;
      const gameData: GameData = JSON.parse(jsonText);
      console.log('Game Jason', gameData);

      // Success! Return the parsed data.
      return gameData;
    } catch (error) {
      // Log the error. The Firebase SDK handles retries for transient errors.
      // This catch block will handle persistent errors (e.g., auth, billing, invalid prompt).
      console.error('Failed to generate games via Firebase AI:', error);

      // Re-throw the error so the calling function knows it failed.
      throw new Error('Failed to generate games after Firebase SDK attempt.');
    }
  }
}