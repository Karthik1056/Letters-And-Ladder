import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MCQQuestion } from "./GameData";

interface Props {
  data: MCQQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameMCQ({ data, onCorrect, onIncorrect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const handleSelect = (option: string) => {
    if (locked) return;
    setSelected(option);
    setLocked(true);

    if (option === data.correctAnswer) {
      onCorrect();
    } else {
      onIncorrect();
      setTimeout(() => {
        setSelected(null);
        setLocked(false);
      }, 1000);
    }
  };

  return (
    <View>
      <Text style={styles.question}>{data.question}</Text>

      {data.options.map((opt, i) => (
        <Animated.View key={opt} entering={FadeInDown.delay(i * 120)}>
          <TouchableOpacity
            style={[
              styles.option,
              selected === opt && styles.optionSelected,
            ]}
            onPress={() => handleSelect(opt)}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  question: { fontSize: 24, fontWeight: "bold", marginBottom: 32 },
  option: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  optionSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  optionText: { fontSize: 18, fontWeight: "600" },
});
