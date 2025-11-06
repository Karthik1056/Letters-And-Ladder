import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { fibData, matchColA, matchColB, speechData } from './GameData';
import GameFillInTheBlanks from '../Games/GameFillInTheBlanks';
import GameMatchTheFollowing from '../Games/GameMatchTheFollowing';
import GameSpeechPractice from '../Games/GameSpeechPractice';

// Simple Progress Bar Component
const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${(current / total) * 100}%` }]} />
  </View>
);

interface GameContainerProps {
  isVisible: boolean;
  onClose: () => void;
  character: React.ReactNode; // Pass your existing AnimatedCharacter here
  onSpeak: (text: string) => void; // Reuse your main speak function
}

export default function GameContainer({ isVisible, onClose, character, onSpeak }: GameContainerProps) {
  // Define the sequence of games. You can mix and match here.
  const gameSequence = [
    { type: 'fill', data: fibData[0] },
    { type: 'speak', data: speechData[0] },
    { type: 'fill', data: fibData[1] },
    { type: 'match', data: { colA: matchColA, colB: matchColB } }, // One big match game
    { type: 'fill', data: fibData[2] },
    { type: 'speak', data: speechData[1] },
    { type: 'fill', data: fibData[3] },
    { type: 'speak', data: speechData[2] },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  
  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(0);
      setAnswerState('idle');
    }
  }, [isVisible]);

  const currentGame = gameSequence[currentIndex];
  const isLastGame = currentIndex === gameSequence.length - 1;

  const handleCorrect = () => {
    setAnswerState('correct');
    // Play a success sound effect here if you want
  };

  const handleIncorrect = () => {
    setAnswerState('incorrect');
    // Vibrate or play error sound
  };

  const handleContinue = () => {
    if (isLastGame) {
      onClose();
    } else {
      setAnswerState('idle');
      setCurrentIndex(prev => prev + 1);
    }
  };

  const renderCurrentGame = () => {
    switch (currentGame.type) {
      case 'fill':
        return <GameFillInTheBlanks data={currentGame.data as any} onCorrect={handleCorrect} onIncorrect={handleIncorrect} key={currentIndex} />;
      case 'match':
        return <GameMatchTheFollowing colA={(currentGame.data as any).colA} colB={(currentGame.data as any).colB} onComplete={handleCorrect} key={currentIndex} />;
      case 'speak':
        return <GameSpeechPractice data={currentGame.data as any} onComplete={handleCorrect} onSpeak={onSpeak} key={currentIndex} />;
      default:
        return null;
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#94a3b8" />
          </TouchableOpacity>
          <ProgressBar current={currentIndex + (answerState === 'correct' ? 1 : 0)} total={gameSequence.length} />
        </View>

        <View style={styles.gameArea}>
          {renderCurrentGame()}
        </View>

        {/* Character positioned above bottom bar */}
        <View style={styles.characterArea}>
           {character}
        </View>

        {/* Feedback / Continue Bar */}
        {answerState !== 'idle' && (
          <View style={[styles.bottomBar, answerState === 'correct' ? styles.correctBar : styles.incorrectBar]}>
            <Text style={[styles.feedbackText, answerState === 'correct' ? styles.correctText : styles.incorrectText]}>
              {answerState === 'correct' ? 'Great job! 🎉' : 'Not quite right yet.'}
            </Text>
            <TouchableOpacity
              style={[styles.continueBtn, answerState === 'correct' ? styles.correctBtn : styles.incorrectBtn]}
              onPress={answerState === 'correct' ? handleContinue : () => setAnswerState('idle')}
            >
              <Text style={styles.continueBtnText}>
                {answerState === 'correct' ? 'CONTINUE' : 'TRY AGAIN'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  closeBtn: { padding: 4 },
  progressTrack: { flex: 1, height: 16, backgroundColor: '#e2e8f0', borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 8 },
  gameArea: { flex: 1, padding: 20, justifyContent: 'center' },
  characterArea: { alignItems: 'center', marginBottom: 130 }, // Push up to avoid being covered by bottom bar
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 24, borderTopWidth: 2, elevation: 10 },
  correctBar: { backgroundColor: '#dcfce7', borderTopColor: '#22c55e' },
  incorrectBar: { backgroundColor: '#fee2e2', borderTopColor: '#ef4444' },
  feedbackText: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  correctText: { color: '#15803d' },
  incorrectText: { color: '#b91c1c' },
  continueBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  correctBtn: { backgroundColor: '#22c55e' },
  incorrectBtn: { backgroundColor: '#ef4444' },
  continueBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});