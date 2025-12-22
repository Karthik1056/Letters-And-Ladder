import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Question {
  id: number;
  masked_word: string;     // e.g., "el_ph_nt"
  missing_chars: string[]; // e.g., ["e", "a"]
  options: string[][];     // e.g., [["e", "a"], ["u", "E"]]
  original_sentence: string;
  target_word: string;
}

interface GameMissingLettersProps {
  data: {
    questions: Question[];
  };
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameMissingLetters({ data, onCorrect, onIncorrect }: GameMissingLettersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string[] | null>(null);

  const questions = data.questions || [];
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return <Text>Loading...</Text>;

  // Helper to compare two arrays (e.g. ["e","a"] === ["e","a"])
  const areArraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
  };

  const handleAnswer = (option: string[]) => {
    setSelectedOption(option);
    
    const isCorrect = areArraysEqual(option, currentQuestion.missing_chars);

    if (isCorrect) {
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
        } else {
          onCorrect();
        }
      }, 1000);
    } else {
      onIncorrect();
    }
  };

  // Helper to determine button color
  const getButtonStyle = (option: string[]) => {
    if (selectedOption === option) {
      return areArraysEqual(option, currentQuestion.missing_chars)
        ? styles.correctButton
        : styles.wrongButton;
    }
    return styles.defaultButton;
  };

  // Render the word with blanks or filled letters
  const renderWord = () => {
    let charIndex = 0;
    // We split by '_' to find positions, but we need to reconstruct visually
    // A simpler approach for visual logic:
    const parts = currentQuestion.masked_word.split('_');
    
    return (
      <View style={styles.wordContainer}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <Text style={styles.wordText}>{part}</Text>
            {index < parts.length - 1 && (
              <View style={styles.blankSpace}>
                <Text style={[
                  styles.filledLetter, 
                  selectedOption ? { color: '#2563eb' } : { color: '#94a3b8' }
                ]}>
                  {/* If user selected an option, show that letter. Otherwise show '?' or empty */}
                  {selectedOption ? selectedOption[index] : "_"}
                </Text>
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Question {currentIndex + 1} of {questions.length}
      </Text>

      {/* Context Sentence */}
      <View style={styles.sentenceCard}>
        <Text style={styles.sentenceText}>
          {currentQuestion.original_sentence.replace(currentQuestion.target_word, "______")}
        </Text>
      </View>

      {/* The Big Word with Blanks */}
      <View style={styles.bigWordArea}>
        {renderWord()}
      </View>

      <Text style={styles.instruction}>Select the missing letters:</Text>

      {/* Options Grid */}
      <View style={styles.optionsGrid}>
        {currentQuestion.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.optionButton, getButtonStyle(option)]}
            onPress={() => handleAnswer(option)}
            disabled={selectedOption !== null}
          >
            <Text style={styles.optionText}>{option.join(" - ")}</Text>
          </TouchableOpacity>
        ))}
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
    marginBottom: 16,
    fontWeight: "600",
  },
  sentenceCard: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
  },
  sentenceText: {
    fontSize: 18,
    color: "#475569",
    fontStyle: 'italic',
    textAlign: "center",
  },
  bigWordArea: {
    marginBottom: 40,
    alignItems: 'center',
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 2,
  },
  blankSpace: {
    borderBottomWidth: 3,
    borderBottomColor: '#cbd5e1',
    marginHorizontal: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  filledLetter: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: -4, // Adjust alignment with baseline
  },
  instruction: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  optionButton: {
    width: '45%', // 2 columns
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  defaultButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  correctButton: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  wrongButton: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },
});