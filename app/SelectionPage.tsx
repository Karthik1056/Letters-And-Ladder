import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedStyle,
  interpolateColor,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SelectionGroup } from "../components/SelectionGroup"; // Adjust path
import { fetchBoards, DataMap, Board } from "@/Services/Boards/Service"; // Adjust path
import { fetchClassesByBoardName, ClassItem } from "@/Services/Class/Service"; // Adjust path
import { updateUserInfo } from "@/Services/User/UserService"; // Adjust path

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SelectionPage() {
  const router = useRouter();

  // 🔹 State management
  const [boards, setBoards] = useState<DataMap<Board>>({});
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [selectedBoardName, setSelectedBoardName] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<string[]>([]);
  // **FIX: Change selectedSubject from string|null to string[]**
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]); // Now an array

  // **FIX: Update isReady check**
  const isReady = !!(selectedBoardName && selectedClassId && selectedSubjects.length > 0);

  // 🔹 Animated background
  const bg = useSharedValue(0);
  useEffect(() => {
    bg.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, true);
  }, []);
  const animatedGradient = useAnimatedStyle(() => {
    const color1 = interpolateColor(bg.value, [0, 1], ["#eaf3fa", "#d9e8f5"]);
    return { backgroundColor: color1 };
  });

  // 🔹 Load boards initially
  useEffect(() => {
    const loadBoards = async () => {
      setLoadingBoards(true);
      try {
        const res = await fetchBoards();
        setBoards(res);
      } catch (err) {
        console.error("Board fetch error:", err);
        Alert.alert("Error", "Failed to load boards.");
      } finally {
        setLoadingBoards(false);
      }
    };
    loadBoards();
  }, []);

  // 🔹 Load classes for selected board
  useEffect(() => {
    if (!selectedBoardName) return;
    setLoadingClasses(true);
    setSelectedClassId(null);
    setSubjects([]);
    setSelectedSubjects([]); // **FIX: Reset array**
    setClasses([]);

    const loadClasses = async () => {
      try {
        const data = await fetchClassesByBoardName(selectedBoardName);
        if (data.length === 0) {
          console.log(`No classes found for board: ${selectedBoardName}`);
          setClasses([]);
        } else {
          setClasses(data);
        }
      } catch (err) {
        console.error("Class fetch error:", err);
        Alert.alert("Error", "Failed to fetch classes.");
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, [selectedBoardName]);

  // 🔹 Handle class selection
  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    const selected = classes.find((c) => c.id === classId);
    setSubjects(selected ? selected.subjects : []);
    setSelectedSubjects([]); // **FIX: Reset array**
  };

  // **FIX: New handler for multi-select subjects**
  const handleSubjectSelect = (subjectName: string) => {
    setSelectedSubjects((prevSelected) => {
      if (prevSelected.includes(subjectName)) {
        // Already selected, remove it
        return prevSelected.filter((s) => s !== subjectName);
      } else {
        // Not selected, add it
        return [...prevSelected, subjectName];
      }
    });
  };

  // 🔹 Handle Learn button
  const handleLearnPress = async () => {
    if (!isReady || !selectedClassId) {
      Alert.alert("Incomplete", "Please select board, class, and at least one subject.");
      return;
    }

    const selectedClassObject = classes.find(c => c.id === selectedClassId);
    if (!selectedClassObject) {
         Alert.alert("Error", "Could not find selected class. Please re-select.");
         return;
    }

    // **FIX: Build subjectStatus map from selectedSubjects array**
    const subjectStatus: Record<string, boolean> = {};
    // First, set all available subjects for this class to false
    subjects.forEach((subj) => (subjectStatus[subj] = false));
    // Then, set the selected ones to true
    selectedSubjects.forEach((subj) => (subjectStatus[subj] = true));

    try {
      await updateUserInfo({
        boardName: selectedBoardName,
        className: selectedClassObject.name,
        selectedSubjects: subjectStatus,
      });

      // **FIX: Pass multiple subjects to ChapterList**
      // We join them with a comma. ChapterList will need to split this.
      const subjectsParam = selectedSubjects.join(',');

      router.push({
        pathname: "/",
        params: {
          board: selectedBoardName,
          class: selectedClassObject.name,
          subjects: subjectsParam, // Pass comma-separated string
        },
      });
    } catch (err) {
      console.error("updateUserInfo error:", err);
      Alert.alert("Error", "Failed to save your selection.");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Student Selection",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitle,
          headerTintColor: "#fff",
          headerBackground: () => (
            <LinearGradient colors={["#3b82f6", "#60a5fa"]} style={styles.headerBackground} />
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("./"))}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <Animated.View style={[StyleSheet.absoluteFill, animatedGradient]} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 🔹 Board Selection */}
        {loadingBoards ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <SelectionGroup
            title="Select Your Board"
            items={Object.values(boards).map((b) => ({
              label: b.name,
              value: b.name,
            }))}
            selectedValue={selectedBoardName}
            onSelect={setSelectedBoardName}
            iconName="library-outline"
          />
        )}

        {/* 🔹 Class Selection */}
        {selectedBoardName && (
          <>
            {loadingClasses ? (
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 20 }} />
            ) : classes.length > 0 ? (
              <SelectionGroup
                title="Select Your Class"
                items={classes.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
                selectedValue={selectedClassId}
                onSelect={handleClassSelect}
                iconName="school-outline"
              />
            ) : (
              <Text style={styles.noDataText}>No classes found for this board.</Text>
            )}
          </>
        )}

        {/* 🔹 Subject Selection */}
        {selectedClassId && (
          <>
            {subjects.length > 0 ? (
              <SelectionGroup
                title="Select Your Subject(s)" // Title changed
                items={subjects.map((s) => ({ label: s, value: s }))}
                selectedValue={selectedSubjects} // **FIX: Pass array**
                onSelect={handleSubjectSelect}   // **FIX: Use new handler**
                allowMultiple={true}             // **FIX: Enable multi-select**
                iconName="book-outline"
              />
            ) : (
              <Text style={styles.noDataText}>No subjects found for this class.</Text>
            )}
          </>
        )}

        {/* 🔹 Button */}
        <TouchableOpacity
          disabled={!isReady}
          onPress={handleLearnPress}
          style={[styles.button, !isReady && { backgroundColor: "#9ca3af" }]}
        >
          <Text style={styles.buttonText}>Let's Learn!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: { flex: 1 },
  headerTitle: { fontWeight: "bold", color: "#fff", fontSize: 20 },
  backButton: {
    marginLeft: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 9999,
    padding: 6,
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flexGrow: 1,
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    padding: 10,
  },
  button: {
    width: '100%',
    marginTop: 24,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: { fontSize: 20, fontWeight: "bold", color: "#fff", textAlign: "center" },
});