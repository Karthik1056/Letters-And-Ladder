import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Keyboard, 
  TouchableWithoutFeedback 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from 'expo-speech'; 

interface GameSpeechProps {
  data: {
    sentence: string;
  };
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameSpeech({ data, onCorrect, onIncorrect }: GameSpeechProps) {
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  // Reset when data changes
  useEffect(() => {
    setInputText("");
    setStatus("idle");
  }, [data]);

  const playSentence = () => {
    Speech.stop();
    Speech.speak(data.sentence, { language: 'en-US', rate: 0.9 });
  };

  const checkAnswer = () => {
    Keyboard.dismiss();

    // Normalize: remove punctuation, lowercase
    const normalize = (str: string) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    
    const target = normalize(data.sentence);
    const input = normalize(inputText);

    // Flexible check
    if (input === target || input.includes(target) || target.includes(input)) {
      setStatus("correct");
      Speech.speak("Good job!", { rate: 1.2 });
      setTimeout(onCorrect, 1500);
    } else {
      setStatus("wrong");
      onIncorrect(); // Triggers parent red flash
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.instruction}>1. Listen  2. Tap Box  3. Use Keyboard Mic</Text>
        
        {/* Target Sentence Card */}
        <View style={styles.card}>
          <Text style={styles.targetText}>{data.sentence}</Text>
          
          <TouchableOpacity style={styles.hearButton} onPress={playSentence}>
            <Ionicons name="volume-high" size={24} color="#3b82f6" />
            <Text style={styles.hearText}>Hear It</Text>
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input, 
              status === "correct" && styles.inputCorrect,
              status === "wrong" && styles.inputWrong
            ]}
            placeholder="Tap here & use keyboard mic..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            blurOnSubmit={true}
            returnKeyType="done"
            onSubmitEditing={checkAnswer}
          />
          
          {/* Visual icon to remind them to use keyboard mic */}
          {inputText.length === 0 && (
             <Ionicons name="mic-outline" size={24} color="#cbd5e1" style={styles.inputIcon} />
          )}
        </View>

        {/* Status Feedback */}
        <View style={styles.feedbackArea}>
           {status === "correct" && <Text style={styles.successText}>Correct!</Text>}
           {status === "wrong" && <Text style={styles.errorText}>Try Again</Text>}
        </View>

        {/* Check Button */}
        <TouchableOpacity
          style={[
            styles.checkButton,
            inputText.length === 0 ? styles.checkDisabled : styles.checkActive
          ]}
          onPress={checkAnswer}
          disabled={inputText.length === 0}
        >
          <Text style={styles.checkButtonText}>CHECK</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    flex: 1,
  },
  instruction: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  targetText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 16,
  },
  hearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  hearText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    width: '100%',
    padding: 20,
    paddingRight: 40,
    borderRadius: 16,
    fontSize: 18,
    color: '#334155',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  inputWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  feedbackArea: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
  },
  successText: { color: '#22c55e', fontSize: 20, fontWeight: 'bold' },
  errorText: { color: '#ef4444', fontSize: 20, fontWeight: 'bold' },

  checkButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkActive: {
    backgroundColor: '#3b82f6',
  },
  checkDisabled: {
    backgroundColor: '#cbd5e1',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});