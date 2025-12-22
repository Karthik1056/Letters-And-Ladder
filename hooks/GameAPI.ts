// src/services/GameAPI.ts

const BACKEND_URL = process.env.EXPO_PUBLIC_MODEL_URL; // REPLACE WITH YOUR IP

export type GameType = "mcq" | "fill" | "jumbled" | "truefalse" | "match" | "miss" | "speach"  ;

// --- API CALLS ---
export const fetchGameData = async (type: GameType, lines: string[], language: string) => {
  let endpoint = "";
  
  switch (type) {
    case "mcq": endpoint = "/generate_mcq"; break;
    case "fill": endpoint = "/generate_quiz_fill"; break; // Ensure this exists in your backend
    case "jumbled": endpoint = "/generate_jumbled"; break;
    case "truefalse": endpoint = "/generate_tf"; break;
    case "match": endpoint = "/generate_match"; break;
    case "miss": endpoint = "/generate_missing_letters"; break;
    default: return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simplified_lines: lines, language }),
    });
    const data = await response.json();
    return data.questions || data.pairs || []; // Adjust based on your backend response structure
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return null;
  }
};

// --- ADAPTERS (Convert Backend JSON to UI Props) ---

// 1. Adapter for Fill In The Blanks
export const adaptFillBlank = (backendData: any) => {
  // Backend sends: "The ____ is blue."
  // UI needs: ["The ", null, " is blue."]
  
  const sentenceParts = backendData.fill_blank.split("______");
  const sentenceArray = [sentenceParts[0], null, sentenceParts[1] || ""];
  
  // We need to generate fake options if backend doesn't provide them
  // Or assuming backend provides { options: [...] }
  // If backend only gives answer, we might need a backup strategy for options
  const options = backendData.options || [backendData.answer, "Wrong1", "Wrong2", "Wrong3"].sort(() => Math.random() - 0.5);

  return {
    sentence: sentenceArray,
    options: options,
    correctWord: backendData.answer
  };
};

// 2. Adapter for MCQ
export const adaptMCQ = (backendData: any) => {
  return {
    question: backendData.question,
    options: backendData.options,
    answer: backendData.correct_answer // Ensure backend key matches
  };
};

// 3. Adapter for Jumbled
export const adaptJumbled = (backendData: any) => {
  return {
    jumbled: backendData.jumbled_words,
    original: backendData.original_sentence.split(" ")
  };
};