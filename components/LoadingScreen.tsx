import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Default facts if none are provided
const DEFAULT_FACTS = [
  "Did you know? The most common letter in the English language is 'e'.",
  "Tip: Reading out loud helps you remember words better than reading silently.",
  "Fun Fact: There are over 7,000 languages spoken in the world today.",
  "Keep it up! Consistency is more important than intensity.",
  "Did you know? 'Queue' is the only word in English that is pronounced the same way when the last four letters are removed.",
  "Brain Power: Learning a new language can increase the size of your brain!",
  "Tip: Don't be afraid to make mistakes. They are the best way to learn."
];

interface Props {
  isVisible: boolean;
  message?: string; // Optional: "Generating Games..." or "Simplifying Text..."
  customFacts?: string[]; // Optional: Pass your own facts
}

export default function FactLoadingScreen({ isVisible, message = "Loading...", customFacts }: Props) {
  const [factIndex, setFactIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity: 1

  const facts = customFacts && customFacts.length > 0 ? customFacts : DEFAULT_FACTS;

  useEffect(() => {
    if (!isVisible) return;

    // Cycle facts every 4.5 seconds (allowing 500ms for transition)
    const interval = setInterval(() => {
      // 1. Fade Out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // 2. Change Text
        setFactIndex((prev) => (prev + 1) % facts.length);

        // 3. Fade In
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Background decoration circles (optional aesthetic) */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      <View style={styles.content}>
        {/* Spinner */}
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginBottom: 20 }} />

        {/* Status Message */}
        <Text style={styles.loadingText}>{message}</Text>

        <View style={styles.divider} />

        {/* Fact Card */}
        <View style={styles.factCard}>
          <View style={styles.iconHeader}>
            <Ionicons name="bulb" size={24} color="#f59e0b" />
            <Text style={styles.factLabel}>DID YOU KNOW?</Text>
          </View>
          
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.factText}>
              "{facts[factIndex]}"
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Cover the entire parent view
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Ensure it sits on top
  },
  content: {
    alignItems: "center",
    width: "85%",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 30,
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    marginBottom: 30,
  },
  factCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  iconHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  factLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f59e0b",
    letterSpacing: 1.2,
  },
  factText: {
    fontSize: 18,
    color: "#475569",
    textAlign: "center",
    lineHeight: 26,
    fontStyle: 'italic',
    minHeight: 80, // Prevent layout jump when text length changes
  },
  // Decorative Background Circles
  circle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: "#3b82f6",
    top: -100,
    right: -100,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "#f59e0b",
    bottom: -50,
    left: -50,
  },
});