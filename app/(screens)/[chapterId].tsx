import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue, withTiming, Easing, useAnimatedStyle, withRepeat, withSequence, withSpring, SlideInDown, SlideOutDown
} from 'react-native-reanimated';

import GameContainer from '../../components/Games/GameContainer';
import AnimatedBackground from '../../components/AnimatedBackground';
import { useSimplifiedLesson } from '../../context/SimplifiedLessonContext';

// const BACKEND_URL = "http://192.168.1.5:5000"; 
const BACKEND_URL = process.env.EXPO_PUBLIC_MODEL_URL; 

type DictEntry = {
  word?: string;
  phonetic?: string;
  meaning?: string;
  example?: string;
  definition?: string;
  partOfSpeech?: string;
  synonyms?: string[];
};

const AnimatedCharacter = ({ isSpeaking }: { isSpeaking: boolean }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      scale.value = withSequence(withTiming(1.2, { duration: 120 }), withSpring(1));
    }
  }, [isSpeaking]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }, { scale: scale.value }] }));

  return (
    <Animated.View style={[styles.characterContainer, animatedStyle]}>
      <View style={styles.characterFace}>
        <View style={styles.eyeLeft} /><View style={styles.eyeRight} /><View style={[styles.mouth, isSpeaking && styles.mouthSpeaking]} />
      </View>
    </Animated.View>
  );
};

const parseLesson = (text: string): Array<{ type: "dialogue" | "poem" | "paragraph"; content: string }> => {
  const conversationRegex = /^.*:.*$/m;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  if (lines.some(line => conversationRegex.test(line))) {
    return lines.map(l => ({ type: "dialogue" as const, content: l }));
  }

  const avgLen = lines.reduce((a, b) => a + b.length, 0) / lines.length;
  if (avgLen < 40) {
    return lines.map(l => ({ type: "poem" as const, content: l }));
  }

  return text.split("\n\n").map(p => ({ type: "paragraph" as const, content: p.trim() }));
};

export default function ChapterDetail() {
  const { isLessonCached, getSimplifiedLesson, storeSimplifiedLesson } = useSimplifiedLesson();
  
  const [rawOriginalText, setRawOriginalText] = useState<string>(""); 
  const [originalBlocks, setOriginalBlocks] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSimplifying, setIsSimplifying] = useState(false); 
  const [showOriginal, setShowOriginal] = useState(true);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [isSpeakingWord, setIsSpeakingWord] = useState<boolean>(false);
  const [definitionData, setDefinitionData] = useState<DictEntry | null>(null);
  const [isFetchingDict, setIsFetchingDict] = useState<boolean>(false);
  const [isGameVisible, setIsGameVisible] = useState(false);

  const router = useRouter();
  const { title = "Chapter", lessonNumber = "?", textUrl = "", language = "" } = useLocalSearchParams() as any;

  const simplifiedBlocks = getSimplifiedLesson(textUrl) || [];

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        if (textUrl) {
          let rawText = await fetch(textUrl).then(r => r.text());
          setRawOriginalText(rawText);

          const displayOriginal = rawText.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
          setOriginalBlocks(parseLesson(displayOriginal));
        } else {
          setOriginalBlocks([{ type: "paragraph", content: "No text URL provided." }]);
        }
      } catch (error) {
        console.error("Error loading content:", error);
        setOriginalBlocks([{ type: "paragraph", content: "Failed to load content." }]);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [textUrl]);

  useEffect(() => { return () => { void Speech.stop(); }; }, []);

  const generateSimplifiedLesson = async () => {
    if (!rawOriginalText) return;
    
    if (isLessonCached(textUrl)) {
        return;
    }

    setIsSimplifying(true);
    try {
      const cleanTextForModel = rawOriginalText
        .split('\n')
        .map(line => line.replace(/\s+/g, ' ').trim()) 
        .join('\n'); 

      const payload = {
        language: language || 'en',
        text: cleanTextForModel
      };

      const response = await fetch(`${BACKEND_URL}/simplify_and_save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.status === "success" && data.simplified_lines) {
        const combinedSimplifiedText = data.simplified_lines.join('\n\n');
        const parsedData = parseLesson(combinedSimplifiedText);
        storeSimplifiedLesson(textUrl, parsedData);
      } else {
        Alert.alert("Error", "Could not simplify this lesson.");
        console.error("Backend Error:", data);
      }

    } catch (error) {
      console.error("Simplification API Error:", error);
      Alert.alert("Network Error", "Check if your backend is running.");
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleToggleView = async () => {
    if (showOriginal) {
      if (!isLessonCached(textUrl)) {
        await generateSimplifiedLesson();
      }
      setShowOriginal(false);
    } else {
      setShowOriginal(true);
    }
  };

  const speakText = (text: string, isSingleWord: boolean = false) => {
    const textToSpeak = isSingleWord ? text.replace(/[.,!?;:"()]/g, "").trim() : text;
    if (!textToSpeak) return;

    Speech.stop();
    if (isSingleWord) setIsSpeakingWord(true);
    setIsSpeaking(true);

    Speech.speak(textToSpeak, {
      language: language,
      rate: 0.8,
      pitch: 1.0,
      onDone: () => { setIsSpeaking(false); setIsSpeakingWord(false); },
      onStopped: () => { setIsSpeaking(false); setIsSpeakingWord(false); },
      onError: () => { setIsSpeaking(false); setIsSpeakingWord(false); }
    });
  };

  const fetchMeaning = async (word: string) => {
    try {
      setIsFetchingDict(true);
      
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;

      if (!entry) throw new Error("No data");

      const meaningBlock = entry.meanings?.[0];
      const definitionBlock = meaningBlock?.definitions?.[0];

      setDefinitionData({
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
        partOfSpeech: meaningBlock?.partOfSpeech,
        definition: definitionBlock?.definition || "Meaning not found.",
        example: definitionBlock?.example || null,
        synonyms: (meaningBlock?.synonyms || []).slice(0, 5)
      });
    } catch (e) {
      setDefinitionData({ word, definition: "Meaning not found." });
    } finally {
      setIsFetchingDict(false);
    }
  };

  const handleWordPress = (raw: string) => {
    const clean = raw.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase();
    if (!clean) return;
    setSelectedWord(clean);
    speakText(clean, true);
    fetchMeaning(clean);
  };

  const ClickableText = ({ text, style }: { text: string, style?: any }) => {
    const tokens = text.split(/(\s+)/);
    return (
      <Text style={style}>
        {tokens.map((tok, idx) => {
          if (tok.trim() === "") return <Text key={idx}>{tok}</Text>;
          const clean = tok.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase();
          const highlighted = isSpeakingWord && selectedWord === clean;
          return (
            <Text
              key={idx}
              onPress={() => handleWordPress(tok)}
              suppressHighlighting={false}
              style={highlighted ? styles.wordHighlight : undefined}
            >
              {tok}
            </Text>
          );
        })}
      </Text>
    );
  };

  const ReadBlockBtn = ({ text }: { text: string }) => (
    <TouchableOpacity onPress={() => speakText(text, false)} style={styles.readBlockBtn}>
      <Ionicons name="volume-high" size={20} color="#3b82f6" />
    </TouchableOpacity>
  );

  const renderBlocks = (blocks: any[]) => {
    if (!blocks || blocks.length === 0) return <Text style={styles.placeholderText}>No content available.</Text>;

    return blocks.map((block, index) => {
      if (block.type === "dialogue") {
        const [speakerRaw, ...rest] = block.content.split(":");
        return (
          <View key={index} style={styles.blockWrapper}>
            <ReadBlockBtn text={block.content} />
            <Text style={styles.dialogueParagraph}>
              <Text style={styles.speaker} onPress={() => handleWordPress(speakerRaw)} suppressHighlighting={false}>
                {speakerRaw.trim()}:{" "}
              </Text>
              <ClickableText text={rest.join(":").trim()} style={styles.dialogueText} />
            </Text>
          </View>
        );
      }
      if (block.type === "poem") {
        return (
          <View key={index} style={styles.poemLineContainer}>
            <ClickableText text={block.content} style={styles.poemLine} />
          </View>
        );
      }
      return (
        <View key={index} style={styles.blockWrapper}>
          <ReadBlockBtn text={block.content} />
          <ClickableText text={block.content} style={styles.paragraph} />
        </View>
      );
    });
  };

  return (
    <AnimatedBackground>
      <Stack.Screen options={{
        headerTitle: () => <Text style={styles.headerTitle}>{title}</Text>,
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={{ flex: 1 }} />,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        ),
      }} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.lessonBadge}><Text style={styles.lessonText}>{lessonNumber}</Text></View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <TouchableOpacity onPress={handleToggleView} style={styles.toggleBtn} disabled={loading || isSimplifying}>
          {isSimplifying ? (
             <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.toggleText}>
              {showOriginal ? "Show Simplified Lesson" : "Show Original Lesson"}
            </Text>
          )}
        </TouchableOpacity>

        {!showOriginal && simplifiedBlocks.length > 0 && (
          <TouchableOpacity style={styles.letsLearnButton} onPress={() => setIsGameVisible(true)}>
            <Ionicons name="game-controller" size={24} color="white" />
            <Text style={styles.letsLearnButtonText}>Let's Practice!</Text>
          </TouchableOpacity>
        )}

        <View style={styles.box}>
          <View style={styles.boxHeader}>
            <Text style={styles.boxTitle}>
              {showOriginal ? "Original Lesson" : "Simplified Version"}
            </Text>
            <AnimatedCharacter isSpeaking={isSpeaking} />
          </View>

          {loading || isSimplifying ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
               <ActivityIndicator size="large" color="#3b82f6" />
               {isSimplifying && <Text style={{marginTop: 10, color: '#64748b'}}>Simplifying with AI...</Text>}
            </View>
          ) : (
            showOriginal ? renderBlocks(originalBlocks) : renderBlocks(simplifiedBlocks)
          )}
        </View>
      </ScrollView>

      {definitionData && (
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.meaningPopup}>
          <View style={styles.popupHeader}>
            <Text style={styles.popupWord}>{definitionData.word}</Text>
            {!!definitionData.phonetic && <Text style={styles.popupPhonetic}>  /{definitionData.phonetic}/</Text>}
          </View>

          <Text style={styles.popupMeaning}>
            {isFetchingDict ? "Loading..." : (definitionData.definition || "Definition not found.")}
          </Text>

          {!!definitionData.example && (
            <Text style={styles.popupExample}>"{definitionData.example}"</Text>
          )}

          <View style={styles.popupActions}>
            <TouchableOpacity
              style={styles.popupSpeakBtn}
              onPress={() => definitionData?.word && speakText(definitionData.word, true)}
            >
              <Ionicons name="volume-high" size={18} color="#fff" />
              <Text style={styles.popupBtnText}>Listen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.popupCloseBtn} onPress={() => setDefinitionData(null)}>
              <Text style={styles.popupBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <GameContainer
        isVisible={isGameVisible}
        onClose={() => setIsGameVisible(false)}
        onSpeak={(text: string) => speakText(text, false)}
        character={<AnimatedCharacter isSpeaking={isSpeaking} />}
        simplifiedLines={simplifiedBlocks.map(b => b.content)}
        language={language}
      />
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  backButton: { marginLeft: 16, marginTop: -4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 9999, padding: 6 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 80 }, 

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontFamily: 'CustomFont-Bold', color: '#fff', fontSize: 20, includeFontPadding: false, textAlignVertical: 'center' },
  lessonBadge: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#e0e7ff", justifyContent: "center", alignItems: "center", marginRight: 14 },
  lessonText: { fontSize: 20, fontFamily: 'CustomFont-Bold', color: "#4338ca", includeFontPadding: false },
  title: { fontSize: 24, fontFamily: 'CustomFont-Bold', color: "#1e293b", flex: 1, flexWrap: 'wrap', includeFontPadding: false },

  toggleBtn: { backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 12, marginBottom: 16 },
  toggleText: { textAlign: "center", color: "#fff", fontFamily: 'CustomFont-Bold', fontSize: 16, includeFontPadding: false },
  letsLearnButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 14, marginBottom: 24,
    shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  letsLearnButtonText: { color: 'white', fontSize: 18, fontFamily: 'CustomFont-Bold', includeFontPadding: false },

  box: { backgroundColor: "white", borderRadius: 20, padding: 20, width: '100%', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  boxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 12, marginBottom: 16 },
  boxTitle: { fontSize: 18, fontFamily: 'CustomFont-Bold', color: "#334155", includeFontPadding: false },
  placeholderText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginTop: 20, fontFamily: 'CustomFont-Regular', includeFontPadding: false },

  blockWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  readBlockBtn: { marginRight: 10, marginTop: 4, padding: 6, backgroundColor: '#f0f9ff', borderRadius: 8 },
  paragraph: { fontSize: 18, lineHeight: 28, color: "#334155", flex: 1, fontFamily: 'CustomFont-Regular', includeFontPadding: false },
  dialogueParagraph: { fontSize: 18, lineHeight: 28, color: "#334155", flex: 1, fontFamily: 'CustomFont-Regular', includeFontPadding: false },
  dialogueText: { includeFontPadding: false },
  speaker: { fontFamily: 'CustomFont-Bold', color: "#2563eb", includeFontPadding: false },
  poemLineContainer: { alignItems: 'center', width: '100%', marginBottom: 8 },
  poemLine: { fontSize: 20, lineHeight: 32, textAlign: "center", color: "#1e293b", fontStyle: 'italic', fontFamily: 'CustomFont-Regular', includeFontPadding: false },
  wordHighlight: { textDecorationLine: "underline", textDecorationStyle: "dotted", textDecorationColor: "#3b82f6", backgroundColor: "#e0f2fe" },

  meaningPopup: {
    position: "absolute", left: 16, right: 16, bottom: 30,
    backgroundColor: "#ffffff", padding: 20, borderRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 15, elevation: 10,
    borderWidth: 1, borderColor: "#f1f5f9",
  },
  popupHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  popupWord: { fontSize: 24, fontFamily: 'CustomFont-Bold', color: "#1e3a8a", includeFontPadding: false },
  popupPhonetic: { fontSize: 18, color: "#64748b", marginLeft: 8, fontFamily: 'CustomFont-Regular', includeFontPadding: false },
  popupMeaning: { fontSize: 18, color: "#334155", lineHeight: 26, fontFamily: 'CustomFont-Regular', includeFontPadding: false },
  popupExample: { fontSize: 16, fontStyle: "italic", color: "#64748b", marginTop: 8, fontFamily: 'CustomFont-Regular', includeFontPadding: false },
  popupActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  popupSpeakBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: "#3b82f6", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  popupCloseBtn: { backgroundColor: "#64748b", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  popupBtnText: { color: "white", fontFamily: 'CustomFont-Bold', fontSize: 16, includeFontPadding: false },

  characterContainer: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  characterFace: { width: 40, height: 40, backgroundColor: "#4ade80", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  eyeLeft: { position: "absolute", top: 12, left: 10, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 3 },
  eyeRight: { position: "absolute", top: 12, right: 10, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 3 },
  mouth: { position: "absolute", bottom: 10, width: 12, height: 3, backgroundColor: "#15803d", borderRadius: 2 },
  mouthSpeaking: { height: 8, bottom: 8, borderRadius: 4 },
});