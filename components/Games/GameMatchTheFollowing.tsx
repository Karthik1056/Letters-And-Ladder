import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { ZoomOut, FadeIn } from 'react-native-reanimated';
import { MatchPair } from './GameData';

interface Props {
  colA: MatchPair[];
  colB: MatchPair[];
  onComplete: () => void;
}

export default function GameMatchTheFollowing({ colA, colB, onComplete }: Props) {
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  useEffect(() => {
    if (matchedIds.length === colA.length * 2) {
      setTimeout(onComplete, 500);
    }
  }, [matchedIds]);

  const handlePressA = (id: string) => {
    setSelectedA(id);
  };

  const handlePressB = (itemB: MatchPair) => {
    if (!selectedA) return;
    // Find the item in Col A that was selected
    const itemA = colA.find(i => i.id === selectedA);
    
    if (itemA && itemA.matchId === itemB.id) {
      // Correct match
      setMatchedIds(prev => [...prev, itemA.id, itemB.id]);
      setSelectedA(null);
    } else {
      // Incorrect match - just deselect for now (could add shake animation here)
      setSelectedA(null);
    }
  };

  const renderButton = (item: MatchPair, isColA: boolean) => {
    const isMatched = matchedIds.includes(item.id);
    const isSelected = selectedA === item.id;

    if (isMatched) {
      return <Animated.View key={item.id} exiting={ZoomOut} style={[styles.bubble, styles.bubbleHidden]} />;
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.bubble, isSelected && styles.bubbleSelected]}
        onPress={() => isColA ? handlePressA(item.id) : handlePressB(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, isSelected && styles.textSelected]}>{item.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Text style={styles.instruction}>Tap the pairs</Text>
      <View style={styles.columns}>
        <View style={styles.col}>
          {colA.map(item => renderButton(item, true))}
        </View>
        <View style={styles.col}>
          {colB.map(item => renderButton(item, false))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: { fontSize: 24, fontWeight: 'bold', color: '#334155', marginBottom: 32, textAlign: 'center' },
  columns: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  col: { flex: 1, gap: 16 },
  bubble: { backgroundColor: 'white', borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, minHeight: 80, justifyContent: 'center', alignItems: 'center' },
  bubbleSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  bubbleHidden: { opacity: 0 }, // Keep space but hide
  text: { fontSize: 16, fontWeight: '600', color: '#334155', textAlign: 'center' },
  textSelected: { color: '#3b82f6' },
});