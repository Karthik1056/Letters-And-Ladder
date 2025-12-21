import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TrueFalseQuestion } from "./GameData";

interface Props {
  data: TrueFalseQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameTrueFalse({ data, onCorrect, onIncorrect }: Props) {
  const [locked, setLocked] = useState(false);

  // 🔑 RESET WHEN QUESTION CHANGES
  useEffect(() => {
    setLocked(false);
  }, [data.id]);

  const handleAnswer = (value: boolean) => {
    if (locked) return;
    setLocked(true);

    value === data.answer ? onCorrect() : onIncorrect();
  };

  return (
    <View>
      <Text style={styles.statement}>{data.statement}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.trueBtn]}
          onPress={() => handleAnswer(true)}
          disabled={locked}
        >
          <Text style={styles.text}>TRUE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.falseBtn]}
          onPress={() => handleAnswer(false)}
          disabled={locked}
        >
          <Text style={styles.text}>FALSE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statement: { fontSize: 24, fontWeight: "bold", marginBottom: 40 },
  row: { flexDirection: "row", gap: 20 },
  btn: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  trueBtn: { backgroundColor: "#22c55e" },
  falseBtn: { backgroundColor: "#ef4444" },
  text: { color: "white", fontSize: 18, fontWeight: "bold" },
});
