// // GameData.ts

// // --- Types ---
// export type GameType = 'fill' | 'match' | 'speak';

// export interface FillInTheBlankQuestion {
//   id: string;
//   sentence: (string | null)[]; // null represents the blank
//   correctWord: string;
//   options: string[];
// }

// export interface MatchPair {
//   id: string;
//   text: string;
//   matchId: string; // The id of the item it matches with in the other column
// }

// export interface SpeechQuestion {
//   id: string;
//   sentence: string;
// }

// // --- DATA BASED ON YOUR LESSON ---

// // Game 1: Fill in the Blanks
// export const fibData: FillInTheBlankQuestion[] = [
//   {
//     id: 'f1',
//     sentence: ['Kids were at a ', null, ' fair.'],
//     correctWord: 'village',
//     options: ['city', 'village', 'forest'],
//   },
//   {
//     id: 'f2',
//     sentence: ['The cat is ', null, ' its kitten.'],
//     correctWord: 'licking',
//     options: ['licking', 'hitting', 'watching'],
//   },
//   {
//     id: 'f3',
//     sentence: ['Worker bees build the ', null, '.'],
//     correctWord: 'hive',
//     options: ['nest', 'cave', 'hive'],
//   },
//   {
//     id: 'f4',
//     sentence: ['The Queen bee only lays ', null, '.'],
//     correctWord: 'eggs',
//     options: ['honey', 'eggs', 'wax'],
//   },
// ];

// // Game 2: Match the Following
// // Column A
// export const matchColA: MatchPair[] = [
//   { id: 'a1', text: 'Tiger', matchId: 'b1' },
//   { id: 'a2', text: 'Ants', matchId: 'b2' },
//   { id: 'a3', text: 'Honey', matchId: 'b3' },
//   { id: 'a4', text: 'Monkey', matchId: 'b4' },
// ];
// // Column B (shuffled logically here, but you can shuffle in UI if needed)
// export const matchColB: MatchPair[] = [
//   { id: 'b1', text: 'Lived alone', matchId: 'a1' },
//   { id: 'b3', text: 'From nectar', matchId: 'a3' },
//   { id: 'b2', text: 'Work together', matchId: 'a2' },
//   { id: 'b4', text: 'On the tree', matchId: 'a4' },
// ];

// // Game 3: Speech Practice
// export const speechData: SpeechQuestion[] = [
//   { id: 's1', sentence: 'Animals live together, like people.' },
//   { id: 's2', sentence: 'The baby monkey is holding on tightly.' },
//   { id: 's3', sentence: 'We make wax to build our hive.' },
// ];

// // mcq match the Following ,fill,true or false,sentance ordaring puzzell,text to Speech, charecture dialog mathcing 
// GameData.ts

// ---------- GAME TYPES ----------
export type GameType =
  | "fill"
  | "match"
  | "speak"
  | "mcq"
  | "truefalse"
  | "order"
  | "dialogue"
  | "puzzle";

// ---------- TYPES ----------
export interface FillInTheBlankQuestion {
  id: string;
  sentence: (string | null)[];
  correctWord: string;
  options: string[];
}

export interface MatchPair {
  id: string;
  text: string;
  matchId: string;
}

export interface SpeechQuestion {
  id: string;
  sentence: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  answer: boolean;
}

export interface SentenceOrder {
  id: string;
  correctOrder: string[];
  shuffled: string[];
}

export interface DialogueQuiz {
  id: string;
  dialogue: string;
  options: string[];
  correctCharacter: string;
}


export interface PuzzleQuestion {
  id: string;
  question: string;
  correctSequence: string[];
  options: string[];
}

export interface CharacterDialogue {
  id: string;
  character: string;
  dialogue: string;
}

// ---------- DATA ----------

// Fill in the blanks
export const fibData: FillInTheBlankQuestion[] = [
  {
    id: "f1",
    sentence: ["Chimpu was a ", null, " little monkey."],
    correctWord: "clever",
    options: ["clever", "lazy", "angry"],
  },
  {
    id: "f2",
    sentence: ["Jumbo found a man's ", null, "."],
    correctWord: "coat",
    options: ["stick", "coat", "hat"],
  },
  {
    id: "f3",
    sentence: ["Perky shouted that a ", null, " is coming."],
    correctWord: "hunter",
    options: ["lion", "hunter", "bear"],
  },
];

// Match the following
export const matchColA: MatchPair[] = [
  { id: "a1", text: "Chimpu", matchId: "b1" },
  { id: "a2", text: "Jumbo", matchId: "b2" },
  { id: "a3", text: "Perky", matchId: "b3" },
];

export const matchColB: MatchPair[] = [
  { id: "b1", text: "Clever Monkey", matchId: "a1" },
  { id: "b2", text: "Elephant", matchId: "a2" },
  { id: "b3", text: "Parrot", matchId: "a3" },
];

// Speech
export const speechData: SpeechQuestion[] = [
  { id: "s1", sentence: "Chimpu was a clever little monkey." },
  { id: "s2", sentence: "Perky shouted loudly to warn everyone." },
];

// MCQ
export const mcqData: MCQQuestion[] = [
  {
    id: "m1",
    question: "Who gave the coat to Chimpu?",
    options: ["Perky", "Jumbo", "Tiggy"],
    correctAnswer: "Jumbo",
  },
];

// True / False
export const trueFalseData: TrueFalseQuestion[] = [
  { id: "t1", statement: "Tiggy helped the monkey.", answer: false },
];

// Sentence Order
export const sentenceOrderData: SentenceOrder[] = [
  {
    id: "o1",
    correctOrder: [
      "Perky saw danger",
      "Chimpu made a plan",
      "Tiggy ran away",
    ],
    shuffled: [
      "Chimpu made a plan",
      "Tiggy ran away",
      "Perky saw danger",
    ],
  },
];

// Dialogue
export const dialogueData: CharacterDialogue[] = [
  {
    id: "d1",
    character: "Jumbo",
    dialogue: "I found a man's coat in the forest.",
  },
  {
    id: "d2",
    character: "Perky",
    dialogue: "A hunter is coming! A hunter is coming!",
  },

  {
    id: "d3",
    character: "Tiggy",
    dialogue: "Look! A hunter! Run!",
  },];

// Puzzle
export const puzzleData: PuzzleQuestion[] = [
  {
    id: "p1",
    question: "Who helped save the monkey? (Tap in order)",
    correctSequence: ["Perky", "Chimpu", "Jumbo"],
    options: ["Perky", "Chimpu", "Jumbo", "Tiggy"],
  },
];

