import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";

// Define the single question structure
interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  correct_answer: string; // Ensure this matches your backend key
}

interface Props {
  data: {
    questions: QuestionItem[]; // Receives an array now
  };
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameMCQ({ data, onCorrect, onIncorrect }: Props) {
  // State to track current question index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const questions = data.questions || [];
  const currentQuestion = questions[currentIndex];

  // Reset selection when index changes
  useEffect(() => {
    setSelectedOption(null);
    setStatus("idle");
  }, [currentIndex]);

  if (!currentQuestion) return <Text>Loading Questions...</Text>;

  const handleCheck = () => {
    if (!selectedOption) return;

    // Compare selection with current question's answer
    if (selectedOption === currentQuestion.correct_answer) {
      setStatus("correct");
      
      // Wait 1 second, then move to next question OR finish
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // All questions finished successfully
          onCorrect(); 
        }
      }, 1000);

    } else {
      setStatus("wrong");
      onIncorrect(); // Play sound/vibrate, but don't close modal
      
      // Let user try again after 1.5 seconds
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  // --- Styles Helper ---
  const getOptionStyle = (option: string) => {
    if (status === "correct" && option === currentQuestion.correct_answer) return styles.optionCorrect;
    if (status === "wrong" && option === selectedOption) return styles.optionWrong;
    if (selectedOption === option) return styles.optionSelected;
    return styles.optionDefault;
  };

  const getTextStyle = (option: string) => {
     if (status === "correct" && option === currentQuestion.correct_answer) return styles.textCorrect;
     if (status === "wrong" && option === selectedOption) return styles.textWrong;
     if (selectedOption === option) return styles.textSelected;
     return styles.textDefault;
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator (Optional) */}
      <Text style={styles.counter}>
        Question {currentIndex + 1} of {questions.length}
      </Text>

      {/* Question Text */}
      <Text style={styles.question}>{currentQuestion.question}</Text>

      {/* Options List */}
      <View style={styles.optionsGrid}>
        {currentQuestion.options.map((option, index) => (
          <Animated.View
            key={`${option}-${currentIndex}-${index}`} // Unique key forces re-animation on new question
            entering={FadeInDown.delay(index * 100)}
            style={{ width: '100%' }}
          >
            <TouchableOpacity
              style={[styles.optionBase, getOptionStyle(option)]}
              onPress={() => {
                if (status !== "idle") return; // Lock input while checking
                setSelectedOption(option);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.textBase, getTextStyle(option)]}>{option}</Text>
              
              {/* Icons */}
              {status === "correct" && option === currentQuestion.correct_answer && (
                 <Animated.View entering={ZoomIn} style={styles.iconContainer}>
                   <Ionicons name="checkmark-circle" size={24} color="#166534" />
                 </Animated.View>
              )}
               {status === "wrong" && option === selectedOption && (
                 <Animated.View entering={ZoomIn} style={styles.iconContainer}>
                   <Ionicons name="close-circle" size={24} color="#991b1b" />
                 </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Check Button */}
      <TouchableOpacity
        style={[styles.checkBtn, (!selectedOption || status === "correct") && styles.checkBtnDisabled]}
        onPress={handleCheck}
        disabled={!selectedOption || status === "correct"}
      >
        <Text style={styles.checkBtnText}>CHECK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', width: '100%', paddingHorizontal: 10 },
  
  counter: {
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
  },

  question: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#334155', 
    marginBottom: 32, 
    textAlign: 'center' 
  },
  
  optionsGrid: { gap: 12, marginBottom: 40 },
  
  optionBase: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'white',
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  
  optionDefault: { borderColor: '#e2e8f0' },
  optionSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#dcfce7' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: '#fee2e2' },

  textBase: { fontSize: 18, fontWeight: '600', flexShrink: 1 },
  textDefault: { color: '#334155' },
  textSelected: { color: '#3b82f6' },
  textCorrect: { color: '#166534' },
  textWrong: { color: '#991b1b' },

  iconContainer: { marginLeft: 10 },

  checkBtn: { 
    backgroundColor: '#22c55e', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    width: '100%',
    marginTop: 'auto'
  },
  checkBtnDisabled: { backgroundColor: '#e2e8f0' },
  checkBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});