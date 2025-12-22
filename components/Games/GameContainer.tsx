import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Game Components
import GameFillInTheBlanks from "./GameFillInTheBlanks";

// API & Logic
import { fetchGameData, GameType, adaptFillBlank, adaptMCQ, adaptJumbled } from "../../hooks/GameAPI";

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${(current / total) * 100}%` }]} />
  </View>
);

interface GameContainerProps {
  isVisible: boolean;
  onClose: () => void;
  character: React.ReactNode;
  onSpeak: (text: string) => void;
  simplifiedLines: string[]; // <--- Dynamic Input
  language: string;
}

type GamePlanItem = {
  type: GameType;
  lines: string[];
};

export default function GameContainer({
  isVisible,
  onClose,
  character,
  onSpeak,
  simplifiedLines = [],
  language = 'en'
}: GameContainerProps) {

  // State
  const [gamePlan, setGamePlan] = useState<GamePlanItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGameData, setCurrentGameData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  // 1. On Mount: Split Lines into 8 Games
  useEffect(() => {
    if (isVisible && simplifiedLines.length > 0) {
      const plan: GamePlanItem[] = [];
      const totalGames = 8; // We want exactly 8 levels
      
      // Calculate how many lines per game
      // If we have 20 lines, chunk size is approx 2 or 3
      const chunkSize = Math.max(1, Math.ceil(simplifiedLines.length / totalGames));
      
      const availableTypes: GameType[] = ["fill", "mcq", "truefalse", "jumbled", "match"];
      
      for (let i = 0; i < simplifiedLines.length; i += chunkSize) {
        // Slice the lines for this specific game
        const chunk = simplifiedLines.slice(i, i + chunkSize);
        
        // Pick a game type (rotate through them)
        const type = availableTypes[(plan.length) % availableTypes.length];
        
        plan.push({ type, lines: chunk });
        
        // Stop if we hit 8 games (even if lines are left over, or loop if needed)
        if (plan.length === totalGames) break;
      }
      
      setGamePlan(plan);
      setCurrentIndex(0);
      setStatus("idle");
    }
  }, [isVisible, simplifiedLines]);

  // 2. Fetch Data whenever Index Changes
  useEffect(() => {
    const loadLevel = async () => {
      if (gamePlan.length === 0) return;
      
      setIsLoading(true);
      const currentPlan = gamePlan[currentIndex];
      
      // Call Backend
      const rawData = await fetchGameData(currentPlan.type, currentPlan.lines, language);
      
      if (rawData && rawData.length > 0) {
        // We might get multiple questions for these lines, just pick the first one for now
        // or loop through them. Let's pick the first one to keep UI simple.
        setCurrentGameData(rawData[0]); 
      } else {
        // Fallback or Skip if API fails
        console.warn("No data for game", currentPlan.type);
        handleNext(); 
      }
      
      setIsLoading(false);
    };

    loadLevel();
  }, [currentIndex, gamePlan]);

  // Logic to move next
  const handleNext = () => {
    if (currentIndex < gamePlan.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStatus("idle");
      setCurrentGameData(null);
    } else {
      onClose(); // Finished all games
    }
  };

  // 3. Render the Correct Game Component
  const renderGameContent = () => {
    if (isLoading || !currentGameData) {
      return <ActivityIndicator size="large" color="#22c55e" />;
    }

    const type = gamePlan[currentIndex].type;

    switch (type) {
      case "fill":
        const fillProps = adaptFillBlank(currentGameData);
        return (
          <GameFillInTheBlanks 
            data={fillProps} 
            onCorrect={() => setStatus("correct")} 
            onIncorrect={() => setStatus("wrong")} 
          />
        );
      
    //   case "mcq":
    //     const mcqProps = adaptMCQ(currentGameData);
    //     return (
    //       // <GameMCQ 
    //       //   data={mcqProps} 
    //       //   onCorrect={() => setStatus("correct")} 
    //       //   onIncorrect={() => setStatus("wrong")} 
    //       // />
    //     );

    //   case "truefalse":
    //     // Assuming backend returns { statement: "...", answer: "True" }
    //     return (
    //       <GameTrueFalse 
    //         data={currentGameData} 
    //         onCorrect={() => setStatus("correct")} 
    //         onIncorrect={() => setStatus("wrong")} 
    //       />
    //     );

    //   case "jumbled":
    //     const jumbledProps = adaptJumbled(currentGameData);
    //     return (
    //       // <GameSentenceOrder 
    //       //   data={jumbledProps} 
    //       //   onComplete={() => setStatus("correct")} 
    //       // />
    //     );
      
    //   // Add other cases...
    //   default:
    //     return <Text>Game type not implemented yet</Text>;
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} />
          </TouchableOpacity>
          <ProgressBar current={currentIndex + 1} total={gamePlan.length || 1} />
        </View>

        <View style={styles.game}>
           {renderGameContent()}
        </View>

        <View style={styles.character}>{character}</View>

        {status !== "idle" && (
          <TouchableOpacity 
            style={[styles.bottom, status === "wrong" ? styles.bgRed : styles.bgGreen]} 
            onPress={status === "correct" ? handleNext : () => setStatus("idle")}
          >
            <Text style={styles.bottomText}>
              {status === "correct" ? "CONTINUE" : "TRY AGAIN"}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: "row", gap: 12, padding: 16, alignItems: 'center' },
  progressTrack: { flex: 1, height: 12, backgroundColor: "#e5e7eb", borderRadius: 6 },
  progressFill: { height: "100%", backgroundColor: "#22c55e", borderRadius: 6 },
  game: { flex: 1, padding: 20, justifyContent: "center" },
  character: { alignItems: "center", marginBottom: 100 },
  bottom: { padding: 20, alignItems: "center", position: 'absolute', bottom: 0, width: '100%' },
  bgGreen: { backgroundColor: "#22c55e" },
  bgRed: { backgroundColor: "#ef4444" },
  bottomText: { color: "white", fontSize: 18, fontWeight: "bold" },
});