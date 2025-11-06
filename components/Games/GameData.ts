// GameData.ts

// --- Types ---
export type GameType = 'fill' | 'match' | 'speak';

export interface FillInTheBlankQuestion {
  id: string;
  sentence: (string | null)[]; // null represents the blank
  correctWord: string;
  options: string[];
}

export interface MatchPair {
  id: string;
  text: string;
  matchId: string; // The id of the item it matches with in the other column
}

export interface SpeechQuestion {
  id: string;
  sentence: string;
}

// --- DATA BASED ON YOUR LESSON ---

// Game 1: Fill in the Blanks
export const fibData: FillInTheBlankQuestion[] = [
  {
    id: 'f1',
    sentence: ['Kids were at a ', null, ' fair.'],
    correctWord: 'village',
    options: ['city', 'village', 'forest'],
  },
  {
    id: 'f2',
    sentence: ['The cat is ', null, ' its kitten.'],
    correctWord: 'licking',
    options: ['licking', 'hitting', 'watching'],
  },
  {
    id: 'f3',
    sentence: ['Worker bees build the ', null, '.'],
    correctWord: 'hive',
    options: ['nest', 'cave', 'hive'],
  },
  {
    id: 'f4',
    sentence: ['The Queen bee only lays ', null, '.'],
    correctWord: 'eggs',
    options: ['honey', 'eggs', 'wax'],
  },
];

// Game 2: Match the Following
// Column A
export const matchColA: MatchPair[] = [
  { id: 'a1', text: 'Tiger', matchId: 'b1' },
  { id: 'a2', text: 'Ants', matchId: 'b2' },
  { id: 'a3', text: 'Honey', matchId: 'b3' },
  { id: 'a4', text: 'Monkey', matchId: 'b4' },
];
// Column B (shuffled logically here, but you can shuffle in UI if needed)
export const matchColB: MatchPair[] = [
  { id: 'b1', text: 'Lived alone', matchId: 'a1' },
  { id: 'b3', text: 'From nectar', matchId: 'a3' },
  { id: 'b2', text: 'Work together', matchId: 'a2' },
  { id: 'b4', text: 'On the tree', matchId: 'a4' },
];

// Game 3: Speech Practice
export const speechData: SpeechQuestion[] = [
  { id: 's1', sentence: 'Animals live together, like people.' },
  { id: 's2', sentence: 'The baby monkey is holding on tightly.' },
  { id: 's3', sentence: 'We make wax to build our hive.' },
];