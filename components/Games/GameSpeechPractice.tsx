import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeechQuestion } from './GameData';

interface Props {
  data: SpeechQuestion;
  onComplete: () => void;
  onSpeak: (text: string) => void;
}

export default function GameSpeechPractice({ data, onComplete, onSpeak }: Props) {
  const [isListening, setIsListening] = useState(false);

  const handleListen = () => {
    onSpeak(data.sentence);
  };

  const handleRecord = () => {
    // --- SIMULATED SPEECH RECOGNITION ---
    // In a real app, you'd use @react-native-voice/voice here.
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onComplete(); // Auto-completes after 2 seconds
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Speak this sentence</Text>

      <View style={styles.card}>
        <TouchableOpacity onPress={handleListen} style={styles.speakerBtn}>
          <Ionicons name="volume-high" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.sentence}>{data.sentence}</Text>
      </View>

      <View style={styles.micContainer}>
        <TouchableOpacity
          style={[styles.micBtn, isListening && styles.micBtnActive]}
          onPress={handleRecord}
          disabled={isListening}
        >
          <Ionicons name={isListening ? "mic" : "mic-outline"} size={48} color="white" />
        </TouchableOpacity>
        <Text style={styles.micText}>{isListening ? "Listening..." : "Tap to speak"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  instruction: { fontSize: 24, fontWeight: 'bold', color: '#334155', marginBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 24, borderRadius: 20, width: '100%', marginBottom: 60 },
  speakerBtn: { padding: 8, backgroundColor: 'white', borderRadius: 12, marginRight: 16 },
  sentence: { fontSize: 20, color: '#334155', flex: 1, lineHeight: 30, fontWeight: '500' },
  micContainer: { alignItems: 'center' },
  micBtn: { width: 100, height: 100, backgroundColor: '#3b82f6', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 5, shadowColor: '#3b82f6', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 10 },
  micBtnActive: { backgroundColor: '#ef4444', transform: [{ scale: 1.1 }] },
  micText: { fontSize: 18, color: '#64748b', fontWeight: '600' },
});