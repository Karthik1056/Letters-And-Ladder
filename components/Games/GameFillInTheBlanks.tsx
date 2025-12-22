// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
// import Animated, { useAnimatedStyle, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';

// export interface FillInTheBlankProps {
//   sentence: (string | null)[]; 
//   correctWord: string;        
// }

// interface Props {
//   data: FillInTheBlankProps;
//   onCorrect: () => void;
//   onIncorrect: () => void;
// }

// export default function GameFillInTheBlanks({ data, onCorrect, onIncorrect }: Props) {
//   const [inputText, setInputText] = useState("");
//   const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  
//   // Animation value for shaking the input on wrong answer
//   const translateX = useSharedValue(0);

//   // --- DEBUG LOG HERE ---
//   useEffect(() => {
//     if (data) {
//       console.log("====================================");
//       console.log("[FILL BLANK COMPONENT] Received Data:");
//       console.log(JSON.stringify(data, null, 2));
//       console.log("====================================");
//     }
    
//     // Reset state when new data loads
//     setInputText("");
//     setStatus("idle");
//   }, [data]);

//   const handleCheck = () => {
//     const cleanInput = inputText.trim().toLowerCase();
//     const cleanAnswer = data.correctWord.trim().toLowerCase();

//     if (cleanInput === cleanAnswer) {
//       setStatus("correct");
//       Keyboard.dismiss();
//       setTimeout(onCorrect, 1000); // Wait 1s before moving next
//     } else {
//       setStatus("wrong");
//       triggerShake();
//       onIncorrect(); // Play sound/vibrate from parent if needed
      
//       // Allow trying again immediately
//       setTimeout(() => setStatus("idle"), 1500); 
//     }
//   };

//   const triggerShake = () => {
//     translateX.value = withSequence(
//       withTiming(-10, { duration: 50 }),
//       withTiming(10, { duration: 50 }),
//       withTiming(-10, { duration: 50 }),
//       withTiming(10, { duration: 50 }),
//       withTiming(0, { duration: 50 })
//     );
//   };

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ translateX: translateX.value }],
//     };
//   });

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === "ios" ? "padding" : "height"} 
//         style={styles.container}
//       >
//         <Text style={styles.instruction}>Type the missing word</Text>
        
//         <View style={styles.sentenceContainer}>
//           {data.sentence.map((part, i) => (
//             part === null ? (
//               <Animated.View key={i} style={[styles.inputWrapper, animatedStyle]}>
//                 <TextInput
//                   style={[
//                     styles.input, 
//                     status === "correct" && styles.inputCorrect,
//                     status === "wrong" && styles.inputWrong
//                   ]}
//                   value={inputText}
//                   onChangeText={(text) => {
//                     setInputText(text);
//                     setStatus("idle");
//                   }}
//                   placeholder="type here..."
//                   placeholderTextColor="#94a3b8"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   editable={status !== "correct"}
//                 />
//               </Animated.View>
//             ) : (
//               <Text key={i} style={styles.text}>{part}</Text>
//             )
//           ))}
//         </View>

//         {status === "correct" && (
//             <Text style={styles.feedbackText}>Correct! 🎉</Text>
//         )}
        
//         {status === "wrong" && (
//             <Text style={styles.errorText}>Try Again</Text>
//         )}

//         <TouchableOpacity
//           style={[styles.checkBtn, !inputText && styles.checkBtnDisabled]}
//           onPress={handleCheck}
//           disabled={!inputText || status === "correct"}
//         >
//           <Text style={styles.checkBtnText}>CHECK</Text>
//         </TouchableOpacity>
//       </KeyboardAvoidingView>
//     </TouchableWithoutFeedback>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center' },
//   instruction: { fontSize: 24, fontWeight: 'bold', color: '#334155', marginBottom: 32 },
  
//   sentenceContainer: { 
//     flexDirection: 'row', 
//     flexWrap: 'wrap', 
//     alignItems: 'center', 
//     marginBottom: 40 
//   },
  
//   text: { fontSize: 22, color: '#334155', lineHeight: 36 },
  
//   inputWrapper: {
//     minWidth: 120,
//     marginHorizontal: 4,
//   },
  
//   input: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#3b82f6',
//     fontSize: 22,
//     color: '#1e293b',
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     backgroundColor: '#f1f5f9',
//     borderRadius: 8,
//   },
  
//   inputCorrect: {
//     borderBottomColor: '#22c55e',
//     color: '#22c55e',
//     backgroundColor: '#dcfce7'
//   },
  
//   inputWrong: {
//     borderBottomColor: '#ef4444',
//     color: '#ef4444',
//     backgroundColor: '#fee2e2'
//   },

//   feedbackText: { color: '#22c55e', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   errorText: { color: '#ef4444', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

//   checkBtn: { 
//     backgroundColor: '#22c55e', 
//     paddingVertical: 16, 
//     borderRadius: 16, 
//     alignItems: 'center', 
//     width: '100%',
//     marginTop: 'auto'
//   },
//   checkBtnDisabled: { backgroundColor: '#e2e8f0' },
//   checkBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
// });

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';

export interface FillInTheBlankProps {
  sentence: (string | null)[]; 
  correctWord: string;        
}

interface Props {
  data: FillInTheBlankProps;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export default function GameFillInTheBlanks({ data, onCorrect, onIncorrect }: Props) {
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  
  const translateX = useSharedValue(0);

  useEffect(() => {
    // Debug log to see exactly what we are comparing
    if (data) {
      console.log("[FILL BLANK DEBUG] Target Answer:", data.correctWord);
    }
    setInputText("");
    setStatus("idle");
  }, [data]);

  // --- THE FIX IS HERE ---
  const handleCheck = () => {
    // Helper function to remove punctuation and extra spaces
    // This Regex removes anything that is NOT a letter (a-z) or number (0-9)
    const normalize = (str: string) => {
      return str
        .toLowerCase()                 // make lowercase
        .replace(/[^\w\s]|_/g, "")     // remove punctuation like : . , ! ? - _
        .replace(/\s+/g, " ")          // collapse multiple spaces
        .trim();                       // remove leading/trailing space
    };

    const cleanInput = normalize(inputText);
    const cleanAnswer = normalize(data.correctWord);

    console.log(`[COMPARISON] User: '${cleanInput}' vs Answer: '${cleanAnswer}'`);

    if (cleanInput === cleanAnswer && cleanInput.length > 0) {
      setStatus("correct");
      Keyboard.dismiss();
      setTimeout(onCorrect, 1000); 
    } else {
      setStatus("wrong");
      triggerShake();
      onIncorrect(); 
      setTimeout(() => setStatus("idle"), 1500); 
    }
  };
  // -----------------------

  const triggerShake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        <Text style={styles.instruction}>Type the missing word</Text>
        
        <View style={styles.sentenceContainer}>
          {data.sentence.map((part, i) => (
            part === null ? (
              <Animated.View key={i} style={[styles.inputWrapper, animatedStyle]}>
                <TextInput
                  style={[
                    styles.input, 
                    status === "correct" && styles.inputCorrect,
                    status === "wrong" && styles.inputWrong
                  ]}
                  value={inputText}
                  onChangeText={(text) => {
                    setInputText(text);
                    setStatus("idle");
                  }}
                  placeholder="type here..."
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={status !== "correct"}
                />
              </Animated.View>
            ) : (
              <Text key={i} style={styles.text}>{part}</Text>
            )
          ))}
        </View>

        {status === "correct" && <Text style={styles.feedbackText}>Correct! 🎉</Text>}
        {status === "wrong" && <Text style={styles.errorText}>Try Again</Text>}

        <TouchableOpacity
          style={[styles.checkBtn, !inputText && styles.checkBtnDisabled]}
          onPress={handleCheck}
          disabled={!inputText || status === "correct"}
        >
          <Text style={styles.checkBtnText}>CHECK</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  instruction: { fontSize: 24, fontWeight: 'bold', color: '#334155', marginBottom: 32 },
  sentenceContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 40 },
  text: { fontSize: 22, color: '#334155', lineHeight: 36 },
  inputWrapper: { minWidth: 120, marginHorizontal: 4 },
  input: { borderBottomWidth: 2, borderBottomColor: '#3b82f6', fontSize: 22, color: '#1e293b', paddingVertical: 4, paddingHorizontal: 8, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f1f5f9', borderRadius: 8 },
  inputCorrect: { borderBottomColor: '#22c55e', color: '#22c55e', backgroundColor: '#dcfce7' },
  inputWrong: { borderBottomColor: '#ef4444', color: '#ef4444', backgroundColor: '#fee2e2' },
  feedbackText: { color: '#22c55e', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  errorText: { color: '#ef4444', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  checkBtn: { backgroundColor: '#22c55e', paddingVertical: 16, borderRadius: 16, alignItems: 'center', width: '100%', marginTop: 'auto' },
  checkBtnDisabled: { backgroundColor: '#e2e8f0' },
  checkBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});