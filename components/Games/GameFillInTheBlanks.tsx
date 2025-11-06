import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { FillInTheBlankQuestion } from './GameData';

interface Props {
  data: FillInTheBlankQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameFillInTheBlanks({ data, onCorrect, onIncorrect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheck = () => {
    if (!selected) return;
    setHasChecked(true);
    if (selected === data.correctWord) {
      onCorrect();
    } else {
      onIncorrect();
      // Reset after a short delay so they can try again
      setTimeout(() => {
        setHasChecked(false);
        setSelected(null);
      }, 1000);
    }
  };

  return (
    <View>
      <Text style={styles.instruction}>Fill in the blank</Text>
      
      <View style={styles.sentenceContainer}>
        {data.sentence.map((part, i) => (
          part === null ? (
            <View key={i} style={[styles.blank, selected && styles.blankFilled]}>
               {selected && (
                 <Animated.Text entering={BounceIn.duration(300)} style={styles.filledText}>
                   {selected}
                 </Animated.Text>
               )}
            </View>
          ) : (
            <Text key={i} style={styles.text}>{part}</Text>
          )
        ))}
      </View>

      <View style={styles.optionsContainer}>
        {data.options.map((opt, i) => (
          <Animated.View key={opt} entering={FadeInDown.delay(i * 100)}>
            <TouchableOpacity
              style={[styles.option, selected === opt && styles.optionSelected]}
              onPress={() => setSelected(opt)}
              disabled={hasChecked}
            >
              <Text style={[styles.optionText, selected === opt && styles.optionTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, (!selected || hasChecked) && styles.checkBtnDisabled]}
        onPress={handleCheck}
        disabled={!selected || hasChecked}
      >
        <Text style={styles.checkBtnText}>CHECK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: { fontSize: 24, fontWeight: 'bold', color: '#334155', marginBottom: 32 },
  sentenceContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 40 },
  text: { fontSize: 22, color: '#334155', lineHeight: 34 },
  blank: { minWidth: 100, borderBottomWidth: 3, borderBottomColor: '#cbd5e1', marginHorizontal: 8, alignItems: 'center', justifyContent: 'center', height: 34 },
  blankFilled: { borderBottomColor: '#3b82f6' },
  filledText: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 },
  option: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: 'white' },
  optionSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  optionText: { fontSize: 18, color: '#334155', fontWeight: '600' },
  optionTextSelected: { color: '#3b82f6' },
  checkBtn: { backgroundColor: '#22c55e', paddingVertical: 16, borderRadius: 16, alignItems: 'center', width: '100%' },
  checkBtnDisabled: { backgroundColor: '#e2e8f0' },
  checkBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});