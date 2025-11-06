//Simple with original lesson

// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import * as Speech from 'expo-speech';
// import Animated, {
//   useSharedValue, withTiming, Easing, useAnimatedStyle, withRepeat, withSequence, withSpring,
// } from 'react-native-reanimated';


// const AnimatedCharacter = ({ isSpeaking }: { isSpeaking: boolean }) => {
//   const translateY = useSharedValue(0);
//   const scale = useSharedValue(1);
//   useEffect(() => {
//     translateY.value = withRepeat(withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
//   }, []);
//   useEffect(() => {
//     if (isSpeaking) scale.value = withSequence(withTiming(1.2, { duration: 120 }), withSpring(1));
//   }, [isSpeaking]);
//   const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }, { scale: scale.value }] }));
//   return (
//     <Animated.View style={[styles.characterContainer, animatedStyle]}>
//       <View style={styles.characterFace}>
//         <View style={styles.eyeLeft} />
//         <View style={styles.eyeRight} />
//         <View style={[styles.mouth, isSpeaking && styles.mouthSpeaking]} />
//       </View>
//     </Animated.View>
//   );
// };

// /* ---------- CONTENT PARSER ---------- */
// const parseLesson = (text: string) => {
//   const conversationRegex = /^.*:.*$/m;
//   const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
//   if (lines.some(line => conversationRegex.test(line))) return lines.map(l => ({ type: "dialogue", content: l }));
//   const avgLen = lines.reduce((a, b) => a + b.length, 0) / lines.length;
//   if (avgLen < 40) return lines.map(l => ({ type: "poem", content: l }));
//   return text.split("\n\n").map(p => ({ type: "paragraph", content: p.trim() }));
// };

// type DictEntry = {
//   word?: string;
//   phonetic?: string;
//   meaning?: string;
//   example?: string;
//   definition?:string;
//   partOfSpeech?: string;
//   synonyms?: string[];
// };

// export default function ChapterDetail() {
//   const [contentBlocks, setContentBlocks] = useState<any[]>([]);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showOriginal, setShowOriginal] = useState(false);

//   // word vocab state
//   const [selectedWord, setSelectedWord] = useState<string>('');
//   const [isSpeakingWord, setIsSpeakingWord] = useState<boolean>(false);
//   const [definitionData, setDefinitionData] = useState<DictEntry | null>(null);
//   const [isFetchingDict, setIsFetchingDict] = useState<boolean>(false);

//   const router = useRouter();
//   const { title = "Chapter", lessonNumber = "?", textUrl = "" } = useLocalSearchParams() as any;

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         let text = await fetch(textUrl).then(r => r.text());
//         text = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
//         setContentBlocks(parseLesson(text));
//       } catch {
//         setContentBlocks([{ type: "paragraph", content: "Failed to load chapter content." }]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [textUrl]);

//   useEffect(() => {
//     return () => { void Speech.stop(); };
//   }, []);

//   /* ---------- Speech ---------- */
//   const speakText = (text: string, isSingleWord: boolean = false) => {
//     const textToSpeak = isSingleWord ? text.replace(/[.,!?;:"()]/g, "").trim() : text;
//     if (!textToSpeak) return;

//     Speech.stop();
//     if (isSingleWord) setIsSpeakingWord(true);
//     setIsSpeaking(true);

//     Speech.speak(textToSpeak, {
//       language: 'en-IN',
//       rate: 0.8,
//       pitch: 1.0,
//       onDone: () => { setIsSpeaking(false); setIsSpeakingWord(false); },
//       onStopped: () => { setIsSpeaking(false); setIsSpeakingWord(false); },
//       onError: () => { setIsSpeaking(false); setIsSpeakingWord(false); }
//     });
//   };

//   /* ---------- Dictionary Fetch ---------- */
//   const fetchMeaning = async (word: string) => {
//   try {
//     setIsFetchingDict(true);

//     const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
//     const data = await res.json();

//     const entry = Array.isArray(data) ? data[0] : null;
//     if (!entry) throw new Error("No data");

//     const meaningBlock = entry.meanings?.[0];
//     const definitionBlock = meaningBlock?.definitions?.[0];

//     setDefinitionData({
//       word: entry.word,
//       phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
//       partOfSpeech: meaningBlock?.partOfSpeech,
//       definition: definitionBlock?.definition || "Meaning not found.",
//       example: definitionBlock?.example || null,
//       synonyms: (meaningBlock?.synonyms || []).slice(0, 5) // Only show up to 5 synonyms
//     });
//   } catch (e) {
//     setDefinitionData({
//       word,
//       definition: "Meaning not found.",
//     });
//   } finally {
//     setIsFetchingDict(false);
//   }
// };


//   /* ---------- Tokenize & render clickable text ---------- */
//   const handleWordPress = (raw: string) => {
//     const clean = raw.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase(); // keep letters, numbers, apostrophe/hyphen
//     if (!clean) return;
//     setSelectedWord(clean);
//     speakText(clean, true);
//     fetchMeaning(clean);
//   };

//   const ClickableText = ({ text, style }: { text: string, style?: any }) => {
//     // Split and keep whitespace tokens
//     const tokens = text.split(/(\s+)/);
//     return (
//       <Text style={style}>
//         {tokens.map((tok, idx) => {
//           // if whitespace, just render
//           if (tok.trim() === "") {
//             return <Text key={idx}>{tok}</Text>;
//           }
//           const clean = tok.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase();
//           const highlighted = isSpeakingWord && selectedWord === clean;
//           return (
//             <Text
//               key={idx}
//               onPress={() => handleWordPress(tok)}
//               suppressHighlighting={false}
//               style={highlighted ? styles.wordHighlight : undefined}
//             >
//               {tok}
//             </Text>
//           );
//         })}
//       </Text>
//     );
//   };

//   /* ---------- Read Whole Block button ---------- */
//   const ReadBlockBtn = ({ text }: { text: string }) => (
//     <TouchableOpacity onPress={() => speakText(text, false)} style={styles.readBlockBtn}>
//        <Ionicons name="volume-high" size={20} color="#3b82f6" />
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.mainContainer}>
//       <Stack.Screen
//         options={{
//           headerTitle: title,
//           headerTitleAlign: "center",
//           headerTintColor: "#fff",
//           headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={{ flex: 1 }} />,
//           headerLeft: () => (
//             <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//               <Ionicons name="arrow-back" size={22} color="#fff" />
//             </TouchableOpacity>
//           ),
//         }}
//       />

//       <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
//         <View style={styles.headerRow}>
//           <View style={styles.lessonBadge}><Text style={styles.lessonText}>{lessonNumber}</Text></View>
//           <Text style={styles.title}>{title}</Text>
//         </View>

//         <TouchableOpacity onPress={() => setShowOriginal(!showOriginal)} style={styles.toggleBtn}>
//           <Text style={styles.toggleText}>{showOriginal ? "Show Simplified Lesson" : "Show Original Lesson"}</Text>
//         </TouchableOpacity>

//         <View style={styles.box}>
//           <View style={styles.boxHeader}>
//             <Text style={styles.boxTitle}>{showOriginal ? "Original Lesson" : "Simplified Version"}</Text>
//             <AnimatedCharacter isSpeaking={isSpeaking} />
//           </View>

//           {loading ? (
//             <Text style={styles.loading}>Loading...</Text>
//           ) : (
//             showOriginal ? (
//               contentBlocks.map((block, index) => {
//                 if (block.type === "dialogue") {
//                   const [speakerRaw, ...rest] = block.content.split(":");
//                   const speechText = block.content;
//                   return (
//                     <View key={index} style={styles.blockWrapper}>
//                       <ReadBlockBtn text={speechText} />
//                       <Text style={styles.dialogueParagraph}>
//                         <Text
//                           style={styles.speaker}
//                           onPress={() => handleWordPress(speakerRaw)}
//                           suppressHighlighting={false}
//                         >
//                           {speakerRaw.trim()}:{" "}
//                         </Text>
//                         <ClickableText text={rest.join(":").trim()} style={styles.dialogueText} />
//                       </Text>
//                     </View>
//                   );
//                 }
//                 if (block.type === "poem") {
//                   return (
//                     <View key={index} style={styles.poemLineContainer}>
//                       <ClickableText text={block.content} style={styles.poemLine} />
//                     </View>
//                   );
//                 }
//                 return (
//                   <View key={index} style={styles.blockWrapper}>
//                     <ReadBlockBtn text={block.content} />
//                     <ClickableText text={block.content} style={styles.paragraph} />
//                   </View>
//                 );
//               })
//             ) : (
//               <Text style={styles.simplifiedPlaceholder}>📌 Model output here.</Text>
//             )
//           )}
//         </View>
//       </ScrollView>

//       {/* Duolingo-style popup card */}
//       {definitionData && (
//         <View style={styles.meaningPopup}>
//           <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 }}>
//             <Text style={styles.popupWord}>{definitionData.word}</Text>
//             {!!definitionData.phonetic && <Text style={styles.popupPhonetic}>  /{definitionData.phonetic}/</Text>}
//           </View>
//           <Text style={styles.popupMeaning}>
//             {isFetchingDict ? "Fetching meaning..." : (definitionData.meaning ?? "Meaning not found.")}
//           </Text>
//           {!!definitionData.example && (
//             <Text style={styles.popupExample}>Example: “{definitionData.example}”</Text>
//           )}

//           <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
//             <TouchableOpacity
//               style={styles.popupSpeakBtn}
//               onPress={() => definitionData?.word && speakText(definitionData.word, true)}
//             >
//               <Ionicons name="volume-high" size={18} color="#fff" />
//               <Text style={styles.popupSpeakText}>Hear</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => setDefinitionData(null)} style={styles.closeBtn}>
//               <Text style={{ color: "white", fontWeight: "600" }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// /* ---------- STYLES ---------- */
// const styles = StyleSheet.create({
//   mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
//   backButton: { padding: 6, marginLeft: 12 },
//   scroll: { flex: 1 },
//   scrollContent: { padding: 16, paddingBottom: 40 },

//   headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   lessonBadge: { width: 60, height: 60, borderRadius: 16, backgroundColor: "#e0e7ff", justifyContent: "center", alignItems: "center", marginRight: 16 },
//   lessonText: { fontSize: 22, fontWeight: "bold", color: "#4338ca" },
//   title: { fontSize: 26, fontWeight: "bold", color: "#1e293b", flex: 1, flexWrap: 'wrap' },

//   toggleBtn: { backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 12, marginBottom: 20 },
//   toggleText: { textAlign: "center", color: "#fff", fontWeight: "600", fontSize: 16 },

//   box: { backgroundColor: "white", borderRadius: 20, padding: 20, width: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
//   boxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 12, marginBottom: 16 },
//   boxTitle: { fontSize: 18, fontWeight: "700", color: "#334155" },

//   blockWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
//   readBlockBtn: { marginRight: 12, marginTop: 4, padding: 4, backgroundColor: '#f0f9ff', borderRadius: 8 },

//   paragraph: { fontSize: 18, lineHeight: 30, color: "#334155", flex: 1 },
//   poemLineContainer: { alignItems: 'center', width: '100%' },
//   poemLine: { fontSize: 20, lineHeight: 34, textAlign: "center", marginBottom: 6, color: "#1e293b", fontStyle: 'italic' },
//   dialogueParagraph: { fontSize: 18, lineHeight: 30, color: "#334155", flex: 1 },

//   /* dialogue text part only (kept for potential overrides) */
//   dialogueText: {},

//   speaker: { fontWeight: "800", color: "#2563eb" },

//   simplifiedPlaceholder: { fontSize: 18, color: "#94a3b8", fontStyle: "italic", textAlign: 'center', marginTop: 20 },
//   loading: { fontSize: 16, marginTop: 20, textAlign: 'center', color: "#64748b" },

//   /* Speaking underline highlight */
//   wordHighlight: {
//     textDecorationLine: "underline",
//     textDecorationStyle: "dotted",
//     textDecorationColor: "#3b82f6",
//   },

//   /* Popup card ↓ (Duolingo style) */
//   meaningPopup: {
//     position: "absolute",
//     left: 16,
//     right: 16,
//     bottom: 20,
//     backgroundColor: "#ffffff",
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   popupWord: { fontSize: 22, fontWeight: "800", color: "#1e3a8a" },
//   popupPhonetic: { fontSize: 16, color: "#475569" },
//   popupMeaning: { fontSize: 18, color: "#374151", marginTop: 6 },
//   popupExample: { fontSize: 16, fontStyle: "italic", color: "#6b7280", marginTop: 6 },

//   popupSpeakBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: "#2563eb",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 10,
//   },
//   popupSpeakText: { color: "#fff", fontWeight: "700", marginLeft: 6 },

//   closeBtn: {
//     backgroundColor: "#3b82f6",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//     marginLeft: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   /* Animated Character */
//   characterContainer: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
//   characterFace: { width: 36, height: 36, backgroundColor: "#4ade80", borderRadius: 10, alignItems: "center", justifyContent: "center" },
//   eyeLeft: { position: "absolute", top: 10, left: 8, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 2 },
//   eyeRight: { position: "absolute", top: 10, right: 8, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 2 },
//   mouth: { position: "absolute", bottom: 8, width: 10, height: 3, backgroundColor: "#15803d", borderRadius: 2 },
//   mouthSpeaking: { height: 6, bottom: 7, borderRadius: 3 },
// });


// With model connection

// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
// import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import * as Speech from 'expo-speech';
// import Animated, {
//   useSharedValue, withTiming, Easing, useAnimatedStyle, withRepeat, withSequence, withSpring,
// } from 'react-native-reanimated';

// /* ---------- ANIMATED CHARACTER ---------- */
// const AnimatedCharacter = ({ isSpeaking }: { isSpeaking: boolean }) => {
//   const translateY = useSharedValue(0);
//   const scale = useSharedValue(1);
//   useEffect(() => {
//     translateY.value = withRepeat(withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
//   }, []);
//   useEffect(() => {
//     if (isSpeaking) scale.value = withSequence(withTiming(1.2, { duration: 120 }), withSpring(1));
//   }, [isSpeaking]);
//   const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }, { scale: scale.value }] }));
//   return (
//     <Animated.View style={[styles.characterContainer, animatedStyle]}>
//       <View style={styles.characterFace}>
//         <View style={styles.eyeLeft} /><View style={styles.eyeRight} /><View style={[styles.mouth, isSpeaking && styles.mouthSpeaking]} />
//       </View>
//     </Animated.View>
//   );
// };

// /* ---------- BLOCK PARSER ---------- */
// const parseLesson = (text: string) => {
//   const conversationRegex = /^.*:.*$/m;
//   const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
//   if (lines.some(line => conversationRegex.test(line))) return lines.map(l => ({ type: "dialogue", content: l }));
//   const avgLen = lines.reduce((a, b) => a + b.length, 0) / lines.length;
//   if (avgLen < 40) return lines.map(l => ({ type: "poem", content: l }));
//   return text.split("\n\n").map(p => ({ type: "paragraph", content: p.trim() }));
// };

// type DictEntry = { word?: string; phonetic?: string; definition?: string; partOfSpeech?: string; example?: string; synonyms?: string[] };

// export default function ChapterDetail() {
//   const [originalBlocks, setOriginalBlocks] = useState<any[]>([]);
//   const [simplifiedBlocks, setSimplifiedBlocks] = useState<any[]>([]);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [showOriginal, setShowOriginal] = useState(false);

//   const [selectedWord, setSelectedWord] = useState('');
//   const [isSpeakingWord, setIsSpeakingWord] = useState(false);
//   const [definitionData, setDefinitionData] = useState<DictEntry | null>(null);
//   const [isFetchingDict, setIsFetchingDict] = useState(false);

//   const router = useRouter();
//   const { title = "Chapter", lessonNumber = "?", textUrl = "" } = useLocalSearchParams() as any;

//   /* ✅ CALL MODEL USING file_url ONLY */
//   const fetchModelSimplifiedLesson = async () => {
//     try {
//       const response = await fetch("http://192.168.0.101:5000/simplify_file_url", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ file_url: textUrl })
//       });
//       const data = await response.json();
//       return data.simplified_text || "⚠️ No simplified text available.";
//     } catch (error) {
//       console.log("Model API Error:", error);
//       return "⚠️ Could not reach simplification server.";
//     }
//   };

//   useEffect(() => {
//     const loadContent = async () => {
//       setLoading(true);
//       try {
//         // Load original
//         let originalText = await fetch(textUrl).then(r => r.text());
//         originalText = originalText.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
//         setOriginalBlocks(parseLesson(originalText));

//         // Load simplified (from backend)
//         const simplifiedTextRaw = await fetchModelSimplifiedLesson();
//         setSimplifiedBlocks(parseLesson(simplifiedTextRaw));

//       } catch {
//         setOriginalBlocks([{ type: "paragraph", content: "Failed to load lesson." }]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadContent();
//   }, [textUrl]);

//   useEffect(() => () => { Speech.stop(); }, []);

//   const speakText = (text: string, isSingleWord = false) => {
//     const clean = isSingleWord ? text.replace(/[.,!?;:"()]/g, "").trim() : text;
//     Speech.stop();
//     if (isSingleWord) setIsSpeakingWord(true);
//     setIsSpeaking(true);
//     Speech.speak(clean, {
//       language: 'en-IN', rate: 0.8, pitch: 1.0,
//       onDone: () => { setIsSpeaking(false); setIsSpeakingWord(false); }
//     });
//   };

//   const fetchMeaning = async (word: string) => {
//     try {
//       setIsFetchingDict(true);
//       const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
//       const data = await res.json();
//       const entry = data?.[0];
//       const meaning = entry?.meanings?.[0];
//       const def = meaning?.definitions?.[0];
//       setDefinitionData({
//         word: entry.word, phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
//         partOfSpeech: meaning?.partOfSpeech,
//         definition: def?.definition, example: def?.example,
//         synonyms: (meaning?.synonyms || []).slice(0, 5)
//       });
//     } catch {
//       setDefinitionData({ word, definition: "Meaning not found." });
//     } finally {
//       setIsFetchingDict(false);
//     }
//   };

//   const handleWordPress = (raw: string) => {
//     const clean = raw.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase();
//     if (!clean) return;
//     setSelectedWord(clean);
//     speakText(clean, true);
//     fetchMeaning(clean);
//   };

//   const ClickableText = ({ text, style }: any) => (
//     <Text style={style}>
//       {text.split(/(\s+)/).map((tok: string, i: number) => {
//         if (tok.trim() === "") return <Text key={i}>{tok}</Text>;
//         const clean = tok.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase();
//         const highlighted = isSpeakingWord && selectedWord === clean;
//         return (
//           <Text key={i} onPress={() => handleWordPress(tok)} style={highlighted ? styles.wordHighlight : undefined}>
//             {tok}
//           </Text>
//         );
//       })}
//     </Text>
//   );

//   const ReadBlockBtn = ({ text }: any) => (
//     <TouchableOpacity onPress={() => speakText(text)} style={styles.readBlockBtn}>
//       <Ionicons name="volume-high" size={20} color="#3b82f6" />
//     </TouchableOpacity>
//   );

//   const renderBlocks = (blocks: any[]) =>
//     blocks.map((block, index) => {
//       if (block.type === "dialogue") {
//         const [speakerRaw, ...rest] = block.content.split(":");
//         return (
//           <View key={index} style={styles.blockWrapper}>
//             <ReadBlockBtn text={block.content} />
//             <Text style={styles.dialogueParagraph}>
//               <Text style={styles.speaker}>{speakerRaw.trim()}: </Text>
//               <ClickableText text={rest.join(":").trim()} />
//             </Text>
//           </View>
//         );
//       }
//       return (
//         <View key={index} style={styles.blockWrapper}>
//           <ReadBlockBtn text={block.content} />
//           <ClickableText text={block.content} style={styles.paragraph} />
//         </View>
//       );
//     });

//   return (
//     <View style={styles.mainContainer}>
//       <Stack.Screen options={{
//         headerTitle: title, headerTitleAlign: "center", headerTintColor: "#fff",
//         headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={{ flex: 1 }} />,
//         headerLeft: () => <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
//       }} />

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.headerRow}>
//           <View style={styles.lessonBadge}><Text style={styles.lessonText}>{lessonNumber}</Text></View>
//           <Text style={styles.title}>{title}</Text>
//         </View>

//         <TouchableOpacity onPress={() => setShowOriginal(!showOriginal)} style={styles.toggleBtn}>
//           <Text style={styles.toggleText}>{showOriginal ? "Show Simplified Lesson" : "Show Original Lesson"}</Text>
//         </TouchableOpacity>

//         <View style={styles.box}>
//           <View style={styles.boxHeader}>
//             <Text style={styles.boxTitle}>{showOriginal ? "Original Lesson" : "Simplified Lesson"}</Text>
//             <AnimatedCharacter isSpeaking={isSpeaking} />
//           </View>

//           {loading ? (
//             <ActivityIndicator size="large" color="#3b82f6" />
//           ) : showOriginal ? renderBlocks(originalBlocks) : renderBlocks(simplifiedBlocks)}
//         </View>
//       </ScrollView>

//       {definitionData && (
//         <View style={styles.meaningPopup}>
//           <Text style={styles.popupWord}>{definitionData.word}</Text>
//           <Text style={styles.popupMeaning}>{isFetchingDict ? "Loading meaning..." : definitionData.definition}</Text>
//           <TouchableOpacity onPress={() => setDefinitionData(null)} style={styles.closeBtn}><Text style={{ color: "#fff" }}>Close</Text></TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// /* ---------- STYLES ---------- */
// const styles = StyleSheet.create({
//   mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
//   backButton: { padding: 6, marginLeft: 12 },
//   scroll: { flex: 1 },
//   scrollContent: { padding: 16, paddingBottom: 40 },
//   headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   lessonBadge: { width: 60, height: 60, borderRadius: 16, backgroundColor: "#e0e7ff", justifyContent: "center", alignItems: "center", marginRight: 16 },
//   lessonText: { fontSize: 22, fontWeight: "bold", color: "#4338ca" },
//   title: { fontSize: 26, fontWeight: "bold", color: "#1e293b", flex: 1, flexWrap: 'wrap' },
//   toggleBtn: { backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 12, marginBottom: 20 },
//   toggleText: { textAlign: "center", color: "#fff", fontWeight: "600", fontSize: 16 },
//   box: { backgroundColor: "white", borderRadius: 20, padding: 20, width: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
//   boxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 12, marginBottom: 16 },
//   boxTitle: { fontSize: 18, fontWeight: "700", color: "#334155" },
//   blockWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
//   readBlockBtn: { marginRight: 12, marginTop: 4, padding: 4, backgroundColor: '#f0f9ff', borderRadius: 8 },
//   paragraph: { fontSize: 18, lineHeight: 30, color: "#334155", flex: 1 },
//   poemLineContainer: { alignItems: 'center', width: '100%' },
//   poemLine: { fontSize: 20, lineHeight: 34, textAlign: "center", marginBottom: 6, color: "#1e293b", fontStyle: 'italic' },
//   dialogueParagraph: { fontSize: 18, lineHeight: 30, color: "#334155", flex: 1 },
//   dialogueText: {},
//   speaker: { fontWeight: "800", color: "#2563eb" },
//   loading: { fontSize: 16, marginTop: 20, textAlign: 'center', color: "#64748b" },
//   wordHighlight: { textDecorationLine: "underline", textDecorationStyle: "dotted", textDecorationColor: "#3b82f6" },
//   meaningPopup: { position: "absolute", left: 16, right: 16, bottom: 20, backgroundColor: "#ffffff", padding: 16, borderRadius: 16, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 10, borderWidth: 1, borderColor: "#e2e8f0" },
//   popupWord: { fontSize: 22, fontWeight: "800", color: "#1e3a8a" },
//   popupPhonetic: { fontSize: 16, color: "#475569" },
//   popupMeaning: { fontSize: 18, color: "#374151", marginTop: 6 },
//   popupExample: { fontSize: 16, fontStyle: "italic", color: "#6b7280", marginTop: 6 },
//   popupSpeakBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
//   popupSpeakText: { color: "#fff", fontWeight: "700", marginLeft: 6 },
//   closeBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginLeft: 10, alignItems: "center", justifyContent: "center" },
//   characterContainer: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
//   characterFace: { width: 36, height: 36, backgroundColor: "#4ade80", borderRadius: 10, alignItems: "center", justifyContent: "center" },
//   eyeLeft: { position: "absolute", top: 10, left: 8, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 2 },
//   eyeRight: { position: "absolute", top: 10, right: 8, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 2 },
//   mouth: { position: "absolute", bottom: 8, width: 10, height: 3, backgroundColor: "#15803d", borderRadius: 2 },
//   mouthSpeaking: { height: 6, bottom: 7, borderRadius: 3 },
// });


import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue, withTiming, Easing, useAnimatedStyle, withRepeat, withSequence, withSpring, SlideInDown, SlideOutDown
} from 'react-native-reanimated';

// ✅ IMPORT YOUR GAME CONTAINER HERE
// If you haven't created the game files yet, comment this import out.
import GameContainer from '../../components/Games/GameContainer'

/* ====================================================================
   INTERFACES & STATIC DATA
==================================================================== */

interface LessonData {
  simplified_text: string;
  source_file: string;
  source_text_start: string;
}

// ✅ EMBEDDED STATIC JSON (Fixed escape characters by using backticks)
export const STATIC_LESSON_DATA: LessonData = {
  simplified_text: `Kids were at a village fair. They ate sweet meat.
Some pieces fell. Ants came to eat them.

Fathima: "Look, Radha! So many ants!"
Radha: "Yes, they are working together."

Tejas: "Look! The kittens are so cute."
Fathima: "They are white! The cat is licking its kitten."

Radha: "Animals live together, like people."
Tejas: "Yes! I saw deer in groups. But a tiger was all alone."

Fathima: "Look! Dogs are fighting for bread."
Radha: "Look up! Birds are flying together."
Tejas: "A monkey is on the tree!"

Fathima: "The baby monkey is holding its mom's belly."
Radha: "What if it falls?"
Tejas: "No, it is holding on tightly."

Radha: "The hen is teaching its chicks to find food."
Fathima: "Look! A honey bee is sucking juice from a flower."

Radha: "Let's talk to it."
Tejas: "Honey bee, where is your home?"
Honey Bee: "My hive is in that tree."

Fathima: "What a big family!"
Honey Bee: "Yes! Thousands of bees live in one hive. There is one Queen bee. The rest are worker bees."
Honey Bee: "Worker bees build the hive, get food, and look after the Queen. The Queen bee only lays eggs."

Tejas: "Your hive is beautiful!"
Honey Bee: "We make wax to build our hive."

Fathima: "You eat the juice from flowers, right?"
Honey Bee: "Yes, it is nectar. We store it in the hive. That is honey."

Tejas: "I like honey. My grandma says it is good for health."
Honey Bee: "True. But not all honey is pure. People mix sugar syrup in it."

Fathima: "How do we know if honey is pure?"
Honey Bee: "Oh! It's getting late. I have to go."

Radha: "Goodbye, honey bee!"

Tejas: "I have seen people keep bees in wooden boxes."
Radha: "Yes, I like honey very much."
Tejas and Fathima: "We like it too."`,
  source_file: "lesson_1.txt",
  source_text_start: "Children were standing in a corner in the village fair..."
};

type DictEntry = {
  word?: string;
  phonetic?: string;
  meaning?: string;
  example?: string;
  definition?: string;
  partOfSpeech?: string;
  synonyms?: string[];
};

/* ====================================================================
   HELPER COMPONENTS & FUNCTIONS
==================================================================== */

/* ---------- Animated Character ---------- */
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

/* ---------- Content Parser ---------- */
const parseLesson = (text: string) => {
  const conversationRegex = /^.*:.*$/m;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  if (lines.some(line => conversationRegex.test(line))) {
    return lines.map(l => ({ type: "dialogue", content: l }));
  }

  const avgLen = lines.reduce((a, b) => a + b.length, 0) / lines.length;
  if (avgLen < 40) {
    return lines.map(l => ({ type: "poem", content: l }));
  }

  return text.split("\n\n").map(p => ({ type: "paragraph", content: p.trim() }));
};

/* ====================================================================
   MAIN COMPONENT
==================================================================== */
export default function ChapterDetail() {
  // --- Content State ---
  const [originalBlocks, setOriginalBlocks] = useState<any[]>([]);
  const [simplifiedBlocks, setSimplifiedBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);

  // --- Interactive State ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [isSpeakingWord, setIsSpeakingWord] = useState<boolean>(false);
  const [definitionData, setDefinitionData] = useState<DictEntry | null>(null);
  const [isFetchingDict, setIsFetchingDict] = useState<boolean>(false);
  const [isGameVisible, setIsGameVisible] = useState(false);

  const router = useRouter();
  const { title = "Chapter", lessonNumber = "?", textUrl = "" } = useLocalSearchParams() as any;

  // --- Load Content on Mount ---
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        // 1. Fetch Original (if URL exists)
        if (textUrl) {
          let text = await fetch(textUrl).then(r => r.text());
          text = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
          setOriginalBlocks(parseLesson(text));
        }

        // 2. Load Static Simplified Data
        // Simulate a small delay to feel like an API call if desired: await new Promise(r => setTimeout(r, 500));
        setSimplifiedBlocks(parseLesson(STATIC_LESSON_DATA.simplified_text));

      } catch (error) {
        console.error("Error loading content:", error);
        setOriginalBlocks([{ type: "paragraph", content: "Failed to load content." }]);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [textUrl]);

  // Cleanup speech on unmount
  useEffect(() => { return () => { void Speech.stop(); }; }, []);

  /* ---------- Speech & Dictionary Handlers ---------- */
  const speakText = (text: string, isSingleWord: boolean = false) => {
    const textToSpeak = isSingleWord ? text.replace(/[.,!?;:"()]/g, "").trim() : text;
    if (!textToSpeak) return;

    Speech.stop();
    if (isSingleWord) setIsSpeakingWord(true);
    setIsSpeaking(true);

    Speech.speak(textToSpeak, {
      language: 'en-IN',
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

  /* ---------- Render Helpers ---------- */
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
      // Standard paragraph
      return (
        <View key={index} style={styles.blockWrapper}>
          <ReadBlockBtn text={block.content} />
          <ClickableText text={block.content} style={styles.paragraph} />
        </View>
      );
    });
  };

  /* ---------- Main Render ---------- */
  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{
        headerTitle: title,
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
        {/* Header Info */}
        <View style={styles.headerRow}>
          <View style={styles.lessonBadge}><Text style={styles.lessonText}>{lessonNumber}</Text></View>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Toggle Button */}
        <TouchableOpacity onPress={() => setShowOriginal(!showOriginal)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {showOriginal ? "Show Simplified Lesson" : "Show Original Lesson"}
          </Text>
        </TouchableOpacity>

        {/* Let's Practice Button (Visible only on Simplified view when loaded) */}
        {!showOriginal && !loading && (
          <TouchableOpacity style={styles.letsLearnButton} onPress={() => setIsGameVisible(true)}>
            <Ionicons name="game-controller" size={24} color="white" />
            <Text style={styles.letsLearnButtonText}>Let's Practice!</Text>
          </TouchableOpacity>
        )}

        {/* Content Box */}
        <View style={styles.box}>
          <View style={styles.boxHeader}>
            <Text style={styles.boxTitle}>
              {showOriginal ? "Original Lesson" : "Simplified Version"}
            </Text>
            <AnimatedCharacter isSpeaking={isSpeaking} />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ margin: 20 }} />
          ) : (
            showOriginal ? renderBlocks(originalBlocks) : renderBlocks(simplifiedBlocks)
          )}
        </View>
      </ScrollView>

      {/* Dictionary Popup */}
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

      {/* Game Modal Integration */}
      {/* Ensure you have GameContainer.tsx in the same folder for this to work */}
      <GameContainer
        isVisible={isGameVisible}
        onClose={() => setIsGameVisible(false)}
        onSpeak={(text: string) => speakText(text, false)}
        character={<AnimatedCharacter isSpeaking={isSpeaking} />}
      />
    </View>
  );
}

/* ====================================================================
   STYLES
==================================================================== */
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
  backButton: { padding: 6, marginLeft: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 80 }, // Extra padding for popup

  // --- Header ---
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  lessonBadge: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#e0e7ff", justifyContent: "center", alignItems: "center", marginRight: 14 },
  lessonText: { fontSize: 20, fontWeight: "bold", color: "#4338ca" },
  title: { fontSize: 24, fontWeight: "bold", color: "#1e293b", flex: 1, flexWrap: 'wrap' },

  // --- Buttons ---
  toggleBtn: { backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 12, marginBottom: 16 },
  toggleText: { textAlign: "center", color: "#fff", fontWeight: "600", fontSize: 16 },
  letsLearnButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 14, marginBottom: 24,
    shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  letsLearnButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // --- Content Box ---
  box: { backgroundColor: "white", borderRadius: 20, padding: 20, width: '100%', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  boxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 12, marginBottom: 16 },
  boxTitle: { fontSize: 18, fontWeight: "700", color: "#334155" },
  placeholderText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginTop: 20 },

  // --- Text Blocks ---
  blockWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  readBlockBtn: { marginRight: 10, marginTop: 4, padding: 6, backgroundColor: '#f0f9ff', borderRadius: 8 },
  paragraph: { fontSize: 18, lineHeight: 28, color: "#334155", flex: 1 },
  dialogueParagraph: { fontSize: 18, lineHeight: 28, color: "#334155", flex: 1 },
  dialogueText: {},
  speaker: { fontWeight: "700", color: "#2563eb" },
  poemLineContainer: { alignItems: 'center', width: '100%', marginBottom: 8 },
  poemLine: { fontSize: 20, lineHeight: 32, textAlign: "center", color: "#1e293b", fontStyle: 'italic' },
  wordHighlight: { textDecorationLine: "underline", textDecorationStyle: "dotted", textDecorationColor: "#3b82f6", backgroundColor: "#e0f2fe" },

  // --- Dictionary Popup ---
  meaningPopup: {
    position: "absolute", left: 16, right: 16, bottom: 30,
    backgroundColor: "#ffffff", padding: 20, borderRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 15, elevation: 10,
    borderWidth: 1, borderColor: "#f1f5f9",
  },
  popupHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  popupWord: { fontSize: 24, fontWeight: "800", color: "#1e3a8a" },
  popupPhonetic: { fontSize: 18, color: "#64748b", marginLeft: 8 },
  popupMeaning: { fontSize: 18, color: "#334155", lineHeight: 26 },
  popupExample: { fontSize: 16, fontStyle: "italic", color: "#64748b", marginTop: 8 },
  popupActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  popupSpeakBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: "#3b82f6", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  popupCloseBtn: { backgroundColor: "#64748b", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  popupBtnText: { color: "white", fontWeight: "600", fontSize: 16 },

  // --- Character ---
  characterContainer: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  characterFace: { width: 40, height: 40, backgroundColor: "#4ade80", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  eyeLeft: { position: "absolute", top: 12, left: 10, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 3 },
  eyeRight: { position: "absolute", top: 12, right: 10, width: 5, height: 7, backgroundColor: "#fff", borderRadius: 3 },
  mouth: { position: "absolute", bottom: 10, width: 12, height: 3, backgroundColor: "#15803d", borderRadius: 2 },
  mouthSpeaking: { height: 8, bottom: 8, borderRadius: 4 },
});