import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Enable animations for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface WordItem {
  id: string;
  text: string;
}

interface GameSentenceOrderProps {
  data: {
    questions: {
      id: number;
      correct_order: string[];
      jumbled_words: string[];
      original_sentence: string;
    }[];
  };
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameSentenceOrder({ data, onCorrect, onIncorrect }: GameSentenceOrderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordPool, setWordPool] = useState<WordItem[]>([]);
  const [userSelection, setUserSelection] = useState<WordItem[]>([]);
  
  const questions = data.questions || [];
  const currentQuestion = questions[currentIndex];

  // Initialize Question
  useEffect(() => {
    if (currentQuestion) {
      // Create unique objects for words to handle duplicates
      const mappedWords = currentQuestion.jumbled_words.map((word, index) => ({
        id: `${index}-${word}`,
        text: word,
      }));
      setWordPool(mappedWords);
      setUserSelection([]);
    }
  }, [currentIndex, currentQuestion]);

  // Logic: Move word from Pool -> Answer
  const handleSelectWord = (word: WordItem) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWordPool((prev) => prev.filter((w) => w.id !== word.id));
    setUserSelection((prev) => [...prev, word]);
  };

  // Logic: Move word from Answer -> Pool
  const handleRemoveWord = (word: WordItem) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setUserSelection((prev) => prev.filter((w) => w.id !== word.id));
    setWordPool((prev) => [...prev, word]);
    // Reset incorrect status if user removes a word to retry
    // (This is implicitly handled if the parent clears status on interaction, 
    // but usually the parent waits for "Try Again" click)
  };

  // Check Answer when User Selection is full
  useEffect(() => {
    if (!currentQuestion) return;

    if (userSelection.length === currentQuestion.correct_order.length && userSelection.length > 0) {
      const userSentence = userSelection.map((w) => w.text).join(" ");
      const correctSentence = currentQuestion.correct_order.join(" ");

      if (userSentence === correctSentence) {
        // Correct!
        if (currentIndex < questions.length - 1) {
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
          }, 1000);
        } else {
          onCorrect();
        }
      } else {
        // Wrong!
        onIncorrect();
      }
    }
  }, [userSelection]);

  if (!currentQuestion) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Sentence {currentIndex + 1} of {questions.length}
      </Text>

      <Text style={styles.instruction}>Arrange the words in correct order:</Text>

      {/* Answer Area */}
      <View style={styles.answerZone}>
        {userSelection.length === 0 && (
          <Text style={styles.placeholderText}>Tap words to build the sentence...</Text>
        )}
        <View style={styles.wordsContainer}>
          {userSelection.map((word) => (
            <TouchableOpacity
              key={word.id}
              style={[styles.wordChip, styles.selectedChip]}
              onPress={() => handleRemoveWord(word)}
            >
              <Text style={styles.selectedWordText}>{word.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Word Pool Area */}
      <View style={styles.poolZone}>
        <View style={styles.wordsContainer}>
          {wordPool.map((word) => (
            <TouchableOpacity
              key={word.id}
              style={[styles.wordChip, styles.poolChip]}
              onPress={() => handleSelectWord(word)}
            >
              <Text style={styles.poolWordText}>{word.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  counter: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 8,
    fontWeight: "600",
  },
  instruction: {
    fontSize: 18,
    color: "#334155",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  answerZone: {
    width: "100%",
    minHeight: 150,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#cbd5e1",
    fontSize: 16,
    textAlign: "center",
    position: "absolute",
    width: "100%",
    alignSelf: "center",
  },
  divider: {
    height: 1,
    width: "80%",
    backgroundColor: "#e2e8f0",
    marginVertical: 25,
  },
  poolZone: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  wordChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    margin: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  poolChip: {
    backgroundColor: "#eff6ff", // Light Blue
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  selectedChip: {
    backgroundColor: "#3b82f6", // Solid Blue
  },
  poolWordText: {
    color: "#1e40af",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedWordText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});