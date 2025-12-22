// src/services/GameAPI.ts

const BACKEND_URL = process.env.EXPO_PUBLIC_MODEL_URL; // REPLACE WITH YOUR IP

export type GameType = "mcq" | "fill" | "jumbled" | "truefalse" | "match" | "missing" | "speech";

// --- API CALLS ---
// src/services/GameAPI.ts

export const fetchGameData = async (type: GameType, lines: string[], language: string) => {
  let endpoint = "";

  switch (type) {
    case "mcq": endpoint = "/generate_mcq"; break;
    case "fill": endpoint = "/generate_quiz_fill"; break;
    case "match": endpoint = "/generate_match"; break;
    case "jumbled": endpoint = "/generate_jumbled"; break;
    case "truefalse": endpoint = "/generate_tf"; break;
    case "missing": endpoint = "/generate_missing_letters"; break;
    case "speech": endpoint = "/generate_speech"; break;
    default: return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simplified_lines: lines, language }),
    });
    const data = await response.json();

    // --- FIX: Wrap list-based games in a single object ---

    // 1. MATCH
    if (type === "match") {
      if (data.pairs && data.pairs.length > 0) {
        return [{ pairs: data.pairs }];
      }
      return [];
    }

    // 2. TRUE/FALSE, JUMBLED, MISSING, MCQ
    // These components handle their own "Next Question" logic, 
    // so we must pass the WHOLE list as one game item.
    if (["truefalse", "jumbled", "missing", "mcq"].includes(type)) {
      if (data.questions && data.questions.length > 0) {
        return [{ questions: data.questions }];
      }
      return [];
    }

    if (type === "speech") {
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    return [{
      id: Date.now(),
      original_sentence: randomLine
    }];
  }
    return data.questions || [];

  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return null;
  }
};

// --- ADAPTERS (Convert Backend JSON to UI Props) ---

// 1. Adapter for Fill In The Blanks
// src/services/GameAPI.ts

export const adaptFillBlank = (backendData: any) => {
  // Split by underscores (e.g. "The sun gives ______ energy")
  const sentenceParts = backendData.fill_blank.split(/_+/);

  return {
    // Result: ["The sun gives ", null, " energy"]
    sentence: [sentenceParts[0], null, sentenceParts[1] || ""],
    correctWord: backendData.answer
  };
};

export const adaptSpeech = (data: any) => {
  return {
    sentence: data.original_sentence || "Hello World"
  };
};


export const adaptMCQ = (data: any) => {
  return {
    questions: data.questions || [] // Pass the whole array
  };
};

export const adaptMatch = (backendData: any) => {
  const pairs = backendData.pairs || [];

  const leftItems = pairs.map((p: any) => ({
    id: p.id,
    text: p.left,
  }));

  const rightItems = pairs.map((p: any) => ({
    id: p.id,
    text: p.right,
  }));

  for (let i = rightItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
  }

  return {
    left: leftItems,
    right: rightItems,
  };
};


export const adaptTrueFalse = (data: any) => {
  return {
    questions: data.questions || []
  };
};

// hooks/GameAPI.ts

export const adaptJumbled = (data: any) => {
  return {
    questions: data.questions || []
  };
};

// hooks/GameAPI.ts

export const adaptMissingLetters = (data: any) => {
  return {
    questions: data.questions || []
  };
};