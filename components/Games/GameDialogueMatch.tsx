// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import { CharacterDialogue } from "./GameData";

// interface Props {
//   data: CharacterDialogue[];
//   onComplete: () => void;
// }

// export default function GameDialogueMatch({ data, onComplete }: Props) {
//   const [index, setIndex] = useState(0);

//   // 🔄 Reset when new dialogue set is loaded
//   useEffect(() => {
//     setIndex(0);
//   }, [data]);

//   const handleNext = () => {
//     if (index === data.length - 1) {
//       onComplete();
//     } else {
//       setIndex(prev => prev + 1);
//     }
//   };

//   const current = data[index];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Who said this?</Text>

//       <View style={styles.card}>
//         <Text style={styles.dialogue}>"{current.dialogue}"</Text>
//       </View>

//       <View style={styles.characterBox}>
//         <Text style={styles.character}>{current.character}</Text>
//       </View>

//       <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
//         <Text style={styles.nextText}>
//           {index === data.length - 1 ? "FINISH" : "NEXT"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 24,
//     color: "#334155",
//   },
//   card: {
//     backgroundColor: "#f1f5f9",
//     padding: 24,
//     borderRadius: 20,
//     marginBottom: 24,
//   },
//   dialogue: {
//     fontSize: 20,
//     fontStyle: "italic",
//     color: "#1e293b",
//     textAlign: "center",
//     lineHeight: 30,
//   },
//   characterBox: {
//     backgroundColor: "#dcfce7",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 14,
//     marginBottom: 40,
//   },
//   character: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#166534",
//   },
//   nextBtn: {
//     backgroundColor: "#3b82f6",
//     paddingVertical: 16,
//     paddingHorizontal: 40,
//     borderRadius: 18,
//   },
//   nextText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
// });


import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CharacterDialogue } from "./GameData";

interface Props {
  data: CharacterDialogue[];
  onComplete: () => void;
}

export default function GameDialogueMatch({ data, onComplete }: Props) {
  const [index, setIndex] = useState(0);

  // 🔄 Reset when new dialogue set is loaded
  useEffect(() => {
    setIndex(0);
  }, [data]);

  const handleNext = () => {
    if (index === data.length - 1) {
      onComplete();
    } else {
      setIndex(prev => prev + 1);
    }
  };

  const current = data[index];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who said this?</Text>

      <View style={styles.card}>
        <Text style={styles.dialogue}>"{current.dialogue}"</Text>
      </View>

      <View style={styles.characterBox}>
        <Text style={styles.character}>{current.character}</Text>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>
          {index === data.length - 1 ? "FINISH" : "NEXT"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#334155",
  },
  card: {
    backgroundColor: "#f1f5f9",
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  dialogue: {
    fontSize: 20,
    fontStyle: "italic",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 30,
  },
  characterBox: {
    backgroundColor: "#dcfce7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 40,
  },
  character: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#166534",
  },
  nextBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 18,
  },
  nextText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
