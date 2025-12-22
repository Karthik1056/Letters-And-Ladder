import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  FadeIn, 
  ZoomIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";

type MatchItem = {
  id: number;
  text: string;
};

export interface MatchProps {
  left: MatchItem[];
  right: MatchItem[];
}

interface Props {
  data: MatchProps;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameMatchFollowing({ data, onCorrect, onIncorrect }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [errorId, setErrorId] = useState<number | null>(null);

  // Check for game completion
  useEffect(() => {
    if (data.left.length > 0 && matchedIds.length === data.left.length) {
      setTimeout(onCorrect, 1000);
    }
  }, [matchedIds]);

  const handleLeftPress = (id: number) => {
    if (matchedIds.includes(id)) return;
    setSelectedLeft(id);
    setErrorId(null);
  };

  const handleRightPress = (id: number) => {
    if (matchedIds.includes(id)) return;
    
    if (selectedLeft === null) {
      // Prompt user to select left side first (optional shake or hint)
      return;
    }

    if (selectedLeft === id) {
      // MATCH!
      setMatchedIds(prev => [...prev, id]);
      setSelectedLeft(null);
    } else {
      // WRONG!
      onIncorrect();
      setErrorId(id);
      setTimeout(() => setErrorId(null), 1000);
      setSelectedLeft(null);
    }
  };

  const Card = ({ item, type, isSelected, isError, isMatched }: any) => {
    // Styles logic
    let bgStyle = styles.cardDefault;
    let textStyle = styles.textDefault;

    if (isMatched) {
      bgStyle = styles.cardMatched;
      textStyle = styles.textMatched;
    } else if (isSelected) {
      bgStyle = styles.cardSelected;
      textStyle = styles.textSelected;
    } else if (isError) {
      bgStyle = styles.cardError;
      textStyle = styles.textError;
    }

    return (
      <TouchableOpacity
        style={[styles.card, bgStyle]}
        onPress={() => type === 'left' ? handleLeftPress(item.id) : handleRightPress(item.id)}
        activeOpacity={0.8}
        disabled={isMatched}
      >
        <Text style={[styles.text, textStyle]}>{item.text}</Text>
        {isMatched && (
          <View style={styles.iconBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Tap a pair to match them</Text>
      
      <View style={styles.row}>
        {/* LEFT COLUMN */}
        <View style={styles.column}>
          {data.left.map((item) => (
            <Animated.View key={`L-${item.id}`} entering={FadeIn} style={styles.cardWrapper}>
              <Card 
                item={item} 
                type="left" 
                isSelected={selectedLeft === item.id} 
                isMatched={matchedIds.includes(item.id)}
              />
            </Animated.View>
          ))}
        </View>

        {/* CENTER DIVIDER (Optional visual) */}
        <View style={{ width: 20 }} />

        {/* RIGHT COLUMN */}
        <View style={styles.column}>
          {data.right.map((item) => (
            <Animated.View key={`R-${item.id}`} entering={FadeIn} style={styles.cardWrapper}>
              <Card 
                item={item} 
                type="right" 
                isError={errorId === item.id}
                isMatched={matchedIds.includes(item.id)}
              />
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', paddingHorizontal: 10 },
  instruction: { fontSize: 20, fontWeight: 'bold', color: '#334155', marginBottom: 20, textAlign: 'center' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1 },
  cardWrapper: { marginBottom: 12 },

  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  text: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  
  // STATES
  cardDefault: { borderColor: '#e2e8f0', backgroundColor: '#fff' },
  textDefault: { color: '#334155' },

  cardSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  textSelected: { color: '#3b82f6' },

  cardMatched: { borderColor: '#22c55e', backgroundColor: '#dcfce7', opacity: 0.6 },
  textMatched: { color: '#166534' },

  cardError: { borderColor: '#ef4444', backgroundColor: '#fee2e2' },
  textError: { color: '#991b1b' },

  iconBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#22c55e', borderRadius: 12 },
});