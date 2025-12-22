
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import GameFillInTheBlanks from "./GameFillInTheBlanks";
import GameMCQ from "./GameMCQ";
import GameMatchFollowing from "./GameMatchTheFollowing";
import GameTrueFalse from "./GameTrueFalse";
import GameSentenceOrder from "./GameSentenceOrder";
import GameMissingLetters from "./GameMissingLetters"
import GameSpeech from "./GameSpeechPractice";


import { fetchGameData, GameType, adaptFillBlank, adaptMCQ, adaptJumbled, adaptMatch, adaptTrueFalse, adaptMissingLetters,adaptSpeech } from "../../hooks/GameAPI";

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
  simplifiedLines: string[];
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
  language
}: GameContainerProps) {

  // State
  const [gamePlan, setGamePlan] = useState<GamePlanItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGameData, setCurrentGameData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  // --- LANGUAGE CONVERSION LOGIC ---
  const backendLanguage = language.includes('-') ? language.split('-')[0] : language;

  useEffect(() => {
    console.log("Backend Language Code:", backendLanguage);
  }, [backendLanguage])

  // 1. On Mount: Split Lines into 8 Games
  useEffect(() => {
    if (isVisible && simplifiedLines.length > 0) {
      const plan: GamePlanItem[] = [];
      const totalGames = 8;

      const chunkSize = Math.max(1, Math.ceil(simplifiedLines.length / totalGames));

      const availableTypes: GameType[] = ["fill", "mcq", "match", "truefalse", "jumbled", "missing", "speech"];

      for (let i = 0; i < simplifiedLines.length; i += chunkSize) {
        const chunk = simplifiedLines.slice(i, i + chunkSize);
        const type = availableTypes[(plan.length) % availableTypes.length];
        plan.push({ type, lines: chunk });

        if (plan.length === totalGames) break;
      }

      setGamePlan(plan);
      setCurrentIndex(0);
      setStatus("idle");
    }
  }, [isVisible, simplifiedLines]);

  useEffect(() => {
    const loadLevel = async () => {
      if (gamePlan.length === 0) return;

      setIsLoading(true);
      const currentPlan = gamePlan[currentIndex];

      console.log(`[DEBUG] Requesting ${currentPlan.type}...`);

      const rawData = await fetchGameData(currentPlan.type, currentPlan.lines, backendLanguage);

      console.log("====================================");
      console.log(`[BACKEND RESPONSE] Game Type: ${currentPlan.type}`);
      console.log(JSON.stringify(rawData, null, 2));
      console.log("====================================");
      // ------------------------------------------

      if (rawData && rawData.length > 0) {
        setCurrentGameData(rawData[0]);
      } else {
        console.warn("No data for game", currentPlan.type);
        handleNext();
      }

      setIsLoading(false);
    };

    loadLevel();
  }, [currentIndex, gamePlan]);

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

      case "mcq":
        const mcqProps = adaptMCQ(currentGameData);
        return (
          <GameMCQ
            data={mcqProps}
            onCorrect={() => setStatus("correct")}
            onIncorrect={() => setStatus("wrong")}
          />
        );

      case "match":
        const matchProps = adaptMatch(currentGameData);
        return (
          <GameMatchFollowing
            data={matchProps}
            onCorrect={() => setStatus("correct")}
            onIncorrect={() => setStatus("wrong")}
          />
        );

      // Inside renderGameContent switch
      case "truefalse":
        const tfProps = adaptTrueFalse(currentGameData);
        return (
          <GameTrueFalse
            data={tfProps}
            onCorrect={() => setStatus("correct")}
            onIncorrect={() => setStatus("wrong")}
          />
        );

      // Inside switch(type)
      case "jumbled":
        const jumbledProps = adaptJumbled(currentGameData);
        return (
          <GameSentenceOrder
            data={jumbledProps}
            onCorrect={() => setStatus("correct")}
            onIncorrect={() => setStatus("wrong")}
          />
        );

      // Inside switch(type)
      case "missing":
        const missingProps = adaptMissingLetters(currentGameData);
        return (
          <GameMissingLetters
            data={missingProps}
            onCorrect={() => setStatus("correct")}
            onIncorrect={() => setStatus("wrong")}
          />
        );

      case "speech":
        const speechProps = adaptSpeech(currentGameData);
        return (
          <GameSpeech
            data={speechProps}
            onCorrect={() => setStatus("correct")}
            onIncorrect={() => setStatus("wrong")}
          />
        );

      default:
        return <Text>Game type not implemented yet</Text>;
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