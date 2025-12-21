import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SentenceOrder } from "./GameData";

interface Props {
  data: SentenceOrder;
  onComplete: () => void;
}

export default function GameSentenceOrder({ data, onComplete }: Props) {
  const [order, setOrder] = useState<string[]>([]);

  const handleSelect = (sentence: string) => {
    if (order.includes(sentence)) return;

    const updated = [...order, sentence];
    setOrder(updated);

    if (
      updated.length === data.correctOrder.length &&
      JSON.stringify(updated) === JSON.stringify(data.correctOrder)
    ) {
      onComplete();
    }
  };

  return (
    <View>
      <Text style={styles.title}>Arrange the sentences</Text>

      {data.shuffled.map(item => (
        <TouchableOpacity
          key={item}
          style={[
            styles.card,
            order.includes(item) && styles.cardSelected,
          ]}
          onPress={() => handleSelect(item)}
        >
          <Text style={styles.text}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  cardSelected: { backgroundColor: "#dcfce7", borderColor: "#22c55e" },
  text: { fontSize: 16, fontWeight: "600" },
});
