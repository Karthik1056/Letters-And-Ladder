import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PuzzleQuestion } from "./GameData";

interface Props {
  data: PuzzleQuestion;
  onComplete: () => void;
}

export default function GamePuzzle({ data, onComplete }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  // Reset on new puzzle
  useEffect(() => {
    setSelected([]);
    setLocked(false);
  }, [data.id]);

  const handleSelect = (item: string) => {
    if (locked || selected.includes(item)) return;

    const next = [...selected, item];

    // ❌ Wrong order detection
    const correctSoFar = data.correctSequence.slice(0, next.length);
    if (JSON.stringify(next) !== JSON.stringify(correctSoFar)) {
      setLocked(true);
      setTimeout(() => {
        setSelected([]);
        setLocked(false);
      }, 1000);
      return;
    }

    setSelected(next);

    // ✅ Completed correctly
    if (next.length === data.correctSequence.length) {
      onComplete();
    }
  };

  return (
    <View>
      <Text style={styles.question}>{data.question}</Text>

      <View style={styles.options}>
        {data.options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.card,
              selected.includes(opt) && styles.cardSelected,
            ]}
            onPress={() => handleSelect(opt)}
            disabled={locked}
          >
            <Text style={styles.text}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progress}>
        {selected.map((s, i) => (
          <Text key={i} style={styles.progressText}>
            {i + 1}. {s}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  options: {
    gap: 14,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  cardSelected: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
  },
  progress: {
    marginTop: 30,
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    color: "#64748b",
  },
});
