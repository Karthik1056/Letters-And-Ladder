import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Question {
  id: number;
  // Make these optional so we can check which one exists
  statement?: string;       
  question?: string;
  original_sentence?: string;
  correct_answer: string;
  options: string[];
}

interface GameTrueFalseProps {
  data: {
    questions: Question[];
  };
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameTrueFalse({ data, onCorrect, onIncorrect }: GameTrueFalseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const questions = data.questions || [];
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return <Text>Loading Question...</Text>;

  // --- FIX: Check multiple keys for the text ---
  const questionText = currentQuestion.statement 
                    || currentQuestion.question 
                    || currentQuestion.original_sentence 
                    || "Question text missing";

  const handleAnswer = (option: string) => {
    setSelectedOption(option);

    const isCorrect = option === currentQuestion.correct_answer;

    if (isCorrect) {
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
        } else {
          onCorrect();
        }
      }, 800);
    } else {
      onIncorrect();
      // Unlock buttons after 1 second so user can retry
      setTimeout(() => {
        setSelectedOption(null); 
      }, 1000);
    }
  };

  const getButtonStyle = (option: string) => {
    if (selectedOption === option) {
      return option === currentQuestion.correct_answer 
        ? styles.correctButton 
        : styles.wrongButton;
    }
    return styles.defaultButton;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Question {currentIndex + 1} of {questions.length}
      </Text>

      <View style={styles.card}>
        {/* Use the safe questionText variable */}
        <Text style={styles.statementText}>{questionText}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {["True", "False"].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionButton, getButtonStyle(option)]}
            onPress={() => handleAnswer(option)}
            disabled={selectedOption !== null} 
          >
            <Ionicons 
              name={option === "True" ? "checkmark-circle-outline" : "close-circle-outline"} 
              size={24} 
              color="white" 
              style={{ marginRight: 8 }}
            />
            <Text style={styles.optionText}>{option}</Text>
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
  },
  counter: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statementText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
    lineHeight: 32,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultButton: {
    backgroundColor: "#3b82f6", 
  },
  correctButton: {
    backgroundColor: "#22c55e", 
  },
  wrongButton: {
    backgroundColor: "#ef4444", 
  },
  optionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});