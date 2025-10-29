


// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'; // Added Alert
// import { Stack, useRouter } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';
// import Animated, {
//   useSharedValue,
//   withTiming,
//   withRepeat,
//   Easing,
//   useAnimatedProps,
//   useAnimatedStyle,
//   withDelay,
//   withSpring,
//   interpolateColor,
//   withSequence,
// } from 'react-native-reanimated';
// import { Ionicons } from '@expo/vector-icons';
// import { SelectionGroup } from '../components/SelectionGroup';
// import { fetchBoards, DataMap, Board } from '@/Services/Boards/Service';
// // Import the new function (adjust path as needed)
// import { fetchClasses, Details } from '@/Services/Class/Service';
// import { updateUserInfo } from '@/Services/User/UserService';

// const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// // --- FloatingShape and useStaggeredAnimation (Keep as is) ---
// const FloatingShape = ({ style, color, duration = 10000, delay = 0 }: any) => {
//   const translateY = useSharedValue(0);
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       translateY.value = withRepeat(
//         withSequence(
//           withTiming(-20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
//           withTiming(20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
//         ),
//         -1,
//         true
//       );
//     }, delay);
//     return () => clearTimeout(timer);
//   }, [delay, duration]);
//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//   }));
//   return <Animated.View style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]} />;
// };

// const useStaggeredAnimation = (delay: number) => {
//   const animationProgress = useSharedValue(0);
//   useEffect(() => {
//     animationProgress.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
//   }, [delay]);
//   return useAnimatedStyle(() => ({
//     opacity: animationProgress.value,
//     transform: [{ translateY: withTiming(animationProgress.value === 1 ? 0 : 20) }],
//   }));
// };
// // --- End Animations ---

// export default function SelectionPage() {
//   const router = useRouter();

//   // Board states
//   const [boards, setBoards] = useState<DataMap<Board>>({});
//   const [loadingBoards, setLoadingBoards] = useState(true);
//   const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
//   const [selectedBoardName, setSelectedBoardName] = useState<string | null>(null);

//   // Class and Subject Names state
//   const [classNames, setClassNames] = useState<string[]>([]);
//   const [subjectNames, setSubjectNames] = useState<string[]>([]);
//   const [loadingBoardDetails, setLoadingBoardDetails] = useState(false);

//   // Selected Class and Subject Name states
//   const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
//   const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);

//   const isReady = selectedBoardId && selectedClassName && selectedSubjectName;

//   // --- Fetch Boards ---
//   useEffect(() => {
//     const loadBoards = async () => {
//       setLoadingBoards(true);
//       const fetchedBoards = await fetchBoards();
//       setBoards(fetchedBoards);
//       setLoadingBoards(false);
//     };
//     loadBoards();
//   }, []);

//   // --- Fetch Class Names & Subjects when Board changes ---
//   useEffect(() => {
//     // Reset selections and data when board changes or is cleared
//     setClassNames([]);
//     setSubjectNames([]);
//     setSelectedClassName(null);
//     setSelectedSubjectName(null);

//     if (!selectedBoardId) {
//       return; // Exit if no board selected
//     }

//     const loadDetails = async () => {
//       setLoadingBoardDetails(true);
//       const details = await fetchClasses(selectedBoardId);
//       if (details) {
//         setClassNames(details.classNames);
//         setSubjectNames(details.subjectNames);
//       } else {
//         // Handle case where board details might not be found
//         setClassNames([]);
//         setSubjectNames([]);
//         // Optionally show an alert or keep the "No classes found" message
//          Alert.alert("Data Issue", "Could not find class and subject details for the selected board.");
//       }
//       setLoadingBoardDetails(false);
//     };
//     loadDetails();
//   }, [selectedBoardId]); // Re-run when selectedBoardId changes

//   // --- Selection Handlers ---
//   const handleSelectBoard = (boardId: string) => {
//     const board = boards[boardId];
//     if (board) {
//       setSelectedBoardId(boardId);
//       setSelectedBoardName(board.name);
//       // Resets for class/subject are handled by the useEffect above
//     }
//   };

//   const handleSelectClass = (className: string) => {
//     setSelectedClassName(className);
//     // Reset subject selection when class changes
//     setSelectedSubjectName(null);
//   };

//   const handleSelectSubject = (subjectName: string) => {
//     setSelectedSubjectName(subjectName);
//   };

//   // --- Handle Learn Press ---
//   const handleLearnPress = async () => {
//     if (!isReady || !selectedBoardName || !subjectNames.length) {
//       console.log("Selections not complete or subject names not loaded.");
//       Alert.alert("Incomplete", "Please select a board, class, and subject.");
//       return;
//     }

//     // Create the subject status map using the fetched subjectNames for this board
//     const subjectStatusMap: { [key: string]: boolean } = {};
//     subjectNames.forEach(name => {
//       subjectStatusMap[name] = (name === selectedSubjectName);
//     });

//     const dataToUpdate = {
//       boardName: selectedBoardName, // Should not be null if isReady
//       className: selectedClassName, // Should not be null if isReady
//       selectedSubjects: subjectStatusMap,
//     };

//     buttonScale.value = withSpring(0.98);

//     try {
//       await updateUserInfo(dataToUpdate); // No need to await returned value unless used
//       console.log("User info updated with:", dataToUpdate);
//       buttonScale.value = withSpring(1);
//       router.push({
//         pathname: './ChapterList',
//         params: {
//           board: selectedBoardId,      // Pass board string ID
//           class: selectedClassName,    // Pass selected class name
//           subject: selectedSubjectName // Pass selected subject name
//         },
//       });
//     } catch (error) {
//       console.error("Failed to update user selection info:", error);
//       buttonScale.value = withSpring(1);
//       Alert.alert("Error", "Could not save your selections. Please try again.");
//     }
//   };

//   // --- Animations & Styles (Keep as is) ---
//   const backgroundProgress = useSharedValue(0);
//   const buttonScale = useSharedValue(1);
//   useEffect(() => {
//     backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
//   }, []);

//   const animatedGradientProps = useAnimatedProps(() => {
//     const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
//     const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
//     return { colors: [color1, color2] as [string, string] };
//   });

//   const animatedButtonContainerStyle = useAnimatedStyle(() => ({
//     backgroundColor: withTiming(isReady ? '#3b82f6' : '#9ca3af', { duration: 300 }),
//     transform: [{ scale: buttonScale.value }],
//   }));
//   const animatedButtonShadowStyle = useAnimatedStyle(() => ({
//     shadowColor: isReady ? '#60a5fa' : '#000',
//     shadowOpacity: withTiming(isReady ? 0.5 : 0.2, { duration: 300 }),
//   }));

//   const boardGroupStyle = useStaggeredAnimation(0);
//   const classGroupStyle = useStaggeredAnimation(150);
//   const subjectGroupStyle = useStaggeredAnimation(300);
//   // --- End Animations ---


//   // --- Render Logic ---
//   return (
//     <View style={styles.container}>
//       {/* --- Header (Keep as is) --- */}
//        <Stack.Screen
//          options={{
//            headerTitle: 'Student Selection',
//            headerTitleAlign: 'center',
//            headerTitleStyle: styles.headerTitle,
//            headerTintColor: '#fff',
//            headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />,
//            headerLeft: () => (
//              <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('./')} style={styles.backButton}>
//                <Ionicons name="arrow-back" size={22} color="#fff" />
//              </TouchableOpacity>
//            ),
//          }}
//        />
//       {/* --- End Header --- */}

//       <AnimatedLinearGradient style={StyleSheet.absoluteFill} colors={['#eaf3fa', '#d9e8f5']} animatedProps={animatedGradientProps} />
//       <FloatingShape style={styles.shape1} color="rgba(147, 197, 253, 0.3)" duration={12000} />
//       <FloatingShape style={styles.shape2} color="rgba(165, 214, 255, 0.3)" duration={10000} delay={1000} />
//       <FloatingShape style={styles.shape3} color="rgba(191, 219, 254, 0.3)" duration={14000} delay={500} />

//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {/* --- Board Selection --- */}
//         {loadingBoards ? (
//           <ActivityIndicator size="large" color="#3b82f6" />
//         ) : (
//           <SelectionGroup
//             title="Select Your Board"
//             items={Object.values(boards).map(b => ({ label: b.name, value: b.id }))}
//             selectedValue={selectedBoardId}
//             onSelect={handleSelectBoard}
//             iconName="library-outline"
//             style={boardGroupStyle}
//           />
//         )}

//         {/* --- Class Selection --- */}
//         {selectedBoardId && ( // Only show if a board is selected
//           classNames.length > 0 ? (
//             <SelectionGroup
//               title="Select Your Class"
//               // Use classNames array, name is both label and value
//               items={classNames.map(name => ({ label: name, value: name }))}
//               selectedValue={selectedClassName}
//               onSelect={handleSelectClass}
//               iconName="school-outline"
//               style={classGroupStyle}
//             />
//           ) : loadingBoardDetails ? ( // Show loader while fetching details
//               <ActivityIndicator size="small" color="#3b82f6" style={styles.groupLoader} />
//           ) : !loadingBoards ? ( // Show "No classes" only after boards loaded and details failed/empty
//               <Text style={styles.noDataText}>No classes found for this board.</Text>
//           ) : null
//         )}

//         {/* --- Subject Selection --- */}
//         {selectedBoardId && selectedClassName && ( // Only show if board AND class selected
//           subjectNames.length > 0 ? (
//             <SelectionGroup
//               title="Select Your Subject"
//                // Use subjectNames array, name is both label and value
//               items={subjectNames.map(name => ({ label: name, value: name }))}
//               selectedValue={selectedSubjectName}
//               onSelect={handleSelectSubject}
//               iconName="book-outline"
//               style={subjectGroupStyle}
//             />
//           ) : loadingBoardDetails ? ( // Can show loader here too briefly
//              null // Or <ActivityIndicator size="small" color="#3b82f6" style={styles.groupLoader} />
//           ) : !loadingBoards && !loadingBoardDetails ? ( // Show "No subjects" only after loading complete
//               <Text style={styles.noDataText}>No subjects found for this class/board.</Text>
//           ) : null
//         )}

//         {/* --- Button --- */}
//         <View style={styles.buttonWrapper}>
//           <Animated.View style={[styles.buttonShadow, animatedButtonShadowStyle]}>
//             <TouchableOpacity
//               disabled={!isReady}
//               onPress={handleLearnPress}
//               onPressIn={() => (buttonScale.value = withSpring(0.98))}
//               onPressOut={() => (buttonScale.value = withSpring(1))}
//               activeOpacity={1}
//             >
//               <Animated.View style={[styles.buttonBase, animatedButtonContainerStyle]}>
//                 <Text style={styles.buttonText}>Let's Learn!</Text>
//               </Animated.View>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// // --- Styles (Keep as is) ---
// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     headerBackground: { flex: 1 },
//     headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
//     backButton: {
//       marginLeft: 16,
//       marginTop: -4,
//       backgroundColor: 'rgba(255,255,255,0.2)',
//       borderRadius: 9999,
//       padding: 6,
//     },
//     scrollContainer: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, flexGrow: 1 },
//     shapeBase: { position: 'absolute', borderRadius: 9999 },
//     shape1: { width: 200, height: 200, top: 80, left: -80 },
//     shape2: { width: 150, height: 150, bottom: 100, right: -60 },
//     shape3: { width: 100, height: 100, bottom: -40, left: 20 },
//     buttonWrapper: { width: '100%', marginTop: 24 },
//     buttonBase: { borderRadius: 16, paddingVertical: 20, alignItems: 'center' },
//     buttonShadow: { shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 5 },
//     buttonText: { fontSize: 22, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
//     noDataText: {
//       marginTop: 20,
//       fontSize: 16,
//       color: '#6b7280', // Grey text
//       textAlign: 'center',
//       padding: 10,
//     },
//     groupLoader: {
//       marginTop: 20,
//       marginBottom: 20,
//     },
// });


// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { Stack, useRouter } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';
// import Animated, {
//   useSharedValue,
//   withTiming,
//   withRepeat,
//   Easing,
//   useAnimatedProps,
//   useAnimatedStyle,
//   withDelay,
//   withSpring,
//   interpolateColor,
//   withSequence,
// } from 'react-native-reanimated';
// import { Ionicons } from '@expo/vector-icons';
// import { SelectionGroup } from '../components/SelectionGroup'; // Adjust path if needed
// import { fetchBoards, DataMap, Board } from '@/Services/Boards/Service'; // Adjust path if needed
// import { updateUserInfo } from '@/Services/User/UserService'; // Adjust path if needed
// import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore'; // Import Firestore functions
// import { db } from '@/firebaseConfig'; // Adjust path if needed

// const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// // Interface for subjects embedded in the class data
// interface EmbeddedSubject {
//   id: string;
//   name: string;
// }

// // Interface for the data structure within the Firestore document
// interface BoardClassData {
//   boardId: number;
//   classesWithSubjects?: {
//     [className: string]: EmbeddedSubject[];
//   };
// }

// const FloatingShape = ({ style, color, duration = 10000, delay = 0 }: any) => {
//   const translateY = useSharedValue(0);
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       translateY.value = withRepeat(
//         withSequence(
//           withTiming(-20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
//           withTiming(20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
//         ),
//         -1,
//         true
//       );
//     }, delay);
//     return () => clearTimeout(timer);
//   }, [delay, duration]);
//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//   }));
//   return <Animated.View style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]} />;
// };

// const useStaggeredAnimation = (delay: number) => {
//   const animationProgress = useSharedValue(0);
//   useEffect(() => {
//     animationProgress.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
//   }, [delay]);
//   return useAnimatedStyle(() => ({
//     opacity: animationProgress.value,
//     transform: [{ translateY: withTiming(animationProgress.value === 1 ? 0 : 20) }],
//   }));
// };

// export default function SelectionPage() {
//   const router = useRouter();

//   const [boards, setBoards] = useState<DataMap<Board>>({});
//   const [loadingBoards, setLoadingBoards] = useState(true);
//   const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
//   const [selectedBoardName, setSelectedBoardName] = useState<string | null>(null);

//   const [selectedBoardData, setSelectedBoardData] = useState<BoardClassData | null>(null);
//   const [availableClassNames, setAvailableClassNames] = useState<string[]>([]);
//   const [availableSubjects, setAvailableSubjects] = useState<EmbeddedSubject[]>([]);

//   const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
//   const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
//   const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

//   const [loadingBoardDetails, setLoadingBoardDetails] = useState(false);

//   const isReady = selectedBoardId && selectedClassName && selectedSubjectId;

//   useEffect(() => {
//     const loadBoards = async () => {
//       setLoadingBoards(true);
//       const fetchedBoards = await fetchBoards();
//       setBoards(fetchedBoards);
//       setLoadingBoards(false);
//     };
//     loadBoards();
//   }, []);

//   useEffect(() => {
//     setSelectedBoardData(null);
//     setAvailableClassNames([]);
//     setAvailableSubjects([]);
//     setSelectedClassName(null);
//     setSelectedSubjectId(null);
//     setSelectedSubjectName(null);

//     if (!selectedBoardId) {
//       return;
//     }

//     const loadClassAndSubjectData = async () => {
//       setLoadingBoardDetails(true);
//       try {
//         const boardIdValue = Number(selectedBoardId);
//         const q = query(
//           collection(db, 'classes'),
//           where('boardId', '==', boardIdValue)
//         );
//         const snapshot = await getDocs(q);

//         if (!snapshot.empty) {
//           const boardDoc = snapshot.docs[0];
//           const data = boardDoc.data() as BoardClassData;
//           setSelectedBoardData(data);

//           if (data.classesWithSubjects) {
//             setAvailableClassNames(Object.keys(data.classesWithSubjects).sort());
//           } else {
//              setAvailableClassNames([]);
//              console.warn(`'classesWithSubjects' map missing for boardId ${boardIdValue}`);
//           }
//         } else {
//           setSelectedBoardData(null);
//           setAvailableClassNames([]);
//           console.log(`No data document found for boardId ${boardIdValue}`);
//         }
//       } catch (error) {
//         console.error(`Error fetching class/subject data for board ${selectedBoardId}:`, error);
//         setSelectedBoardData(null);
//         setAvailableClassNames([]);
//       } finally {
//         setLoadingBoardDetails(false);
//       }
//     };

//     loadClassAndSubjectData();
//   }, [selectedBoardId]);

//   useEffect(() => {
//     setAvailableSubjects([]);
//     setSelectedSubjectId(null);
//     setSelectedSubjectName(null);

//     if (selectedClassName && selectedBoardData?.classesWithSubjects?.[selectedClassName]) {
//       const subjectsForClass = selectedBoardData.classesWithSubjects[selectedClassName];
//       setAvailableSubjects(subjectsForClass);
//     }
//   }, [selectedClassName, selectedBoardData]);

//   const handleSelectBoard = (boardId: string) => {
//     const board = boards[boardId];
//     if (board) {
//       setSelectedBoardId(boardId);
//       setSelectedBoardName(board.name);
//     }
//   };

//   const handleSelectClass = (className: string) => {
//     setSelectedClassName(className);
//   };

//   const handleSelectSubject = (subjectId: string) => {
//      const subjectItem = availableSubjects.find(s => s.id === subjectId);
//      if (subjectItem) {
//         setSelectedSubjectId(subjectId);
//         setSelectedSubjectName(subjectItem.name);
//      }
//   };

//   const handleLearnPress = async () => {
//     if (!isReady || !selectedBoardName || !selectedClassName || !selectedSubjectName || !availableSubjects.length) {
//       console.log("Selections not complete or data missing.");
//       Alert.alert("Incomplete", "Please select a board, class, and subject.");
//       return;
//     }

//     const subjectStatusMap: { [key: string]: boolean } = {};
//     availableSubjects.forEach(subject => {
//       subjectStatusMap[subject.name] = (subject.id === selectedSubjectId);
//     });

//     const dataToUpdate = {
//       boardName: selectedBoardName ?? undefined,
//       className: selectedClassName ?? undefined,
//       selectedSubjects: subjectStatusMap,
//     };

//     buttonScale.value = withSpring(0.98);

//     try {
//       await updateUserInfo(dataToUpdate);
//       console.log("User info updated with subject status:", dataToUpdate);
//       buttonScale.value = withSpring(1);
//       router.push({
//         pathname: './ChapterList', // Adjust path if needed
//         params: {
//           board: selectedBoardId,
//           class: selectedClassName,
//           subject: selectedSubjectId // Pass the unique subject ID
//         },
//       });
//     } catch (error) {
//       console.error("Failed to update user selection info:", error);
//       buttonScale.value = withSpring(1);
//       Alert.alert("Error", "Could not save your selections. Please try again.");
//     }
//   };

//   const backgroundProgress = useSharedValue(0);
//   const buttonScale = useSharedValue(1);
//   useEffect(() => {
//     backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
//   }, []);

//   const animatedGradientProps = useAnimatedProps(() => {
//     const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
//     const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
//     return { colors: [color1, color2] as [string, string] };
//   });

//   const animatedButtonContainerStyle = useAnimatedStyle(() => ({
//     backgroundColor: withTiming(isReady ? '#3b82f6' : '#9ca3af', { duration: 300 }),
//     transform: [{ scale: buttonScale.value }],
//   }));
//   const animatedButtonShadowStyle = useAnimatedStyle(() => ({
//     shadowColor: isReady ? '#60a5fa' : '#000',
//     shadowOpacity: withTiming(isReady ? 0.5 : 0.2, { duration: 300 }),
//   }));

//   const boardGroupStyle = useStaggeredAnimation(0);
//   const classGroupStyle = useStaggeredAnimation(150);
//   const subjectGroupStyle = useStaggeredAnimation(300);

//   return (
//     <View style={styles.container}>
//        <Stack.Screen
//          options={{
//            headerTitle: 'Student Selection',
//            headerTitleAlign: 'center',
//            headerTitleStyle: styles.headerTitle,
//            headerTintColor: '#fff',
//            headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />,
//            headerLeft: () => (
//              <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('./')} style={styles.backButton}>
//                <Ionicons name="arrow-back" size={22} color="#fff" />
//              </TouchableOpacity>
//            ),
//          }}
//        />

//       <AnimatedLinearGradient style={StyleSheet.absoluteFill} colors={['#eaf3fa', '#d9e8f5']} animatedProps={animatedGradientProps} />
//       <FloatingShape style={styles.shape1} color="rgba(147, 197, 253, 0.3)" duration={12000} />
//       <FloatingShape style={styles.shape2} color="rgba(165, 214, 255, 0.3)" duration={10000} delay={1000} />
//       <FloatingShape style={styles.shape3} color="rgba(191, 219, 254, 0.3)" duration={14000} delay={500} />

//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {loadingBoards ? (
//           <ActivityIndicator size="large" color="#3b82f6" />
//         ) : (
//           <SelectionGroup
//             title="Select Your Board"
//             items={Object.values(boards).map(b => ({ label: b.name, value: b.id }))}
//             selectedValue={selectedBoardId}
//             onSelect={handleSelectBoard}
//             iconName="library-outline"
//             style={boardGroupStyle}
//           />
//         )}

//         {selectedBoardId && (
//           availableClassNames.length > 0 ? (
//             <SelectionGroup
//               title="Select Your Class"
//               items={availableClassNames.map(name => ({ label: name, value: name }))}
//               selectedValue={selectedClassName}
//               onSelect={handleSelectClass}
//               iconName="school-outline"
//               style={classGroupStyle}
//             />
//           ) : loadingBoardDetails ? (
//               <ActivityIndicator size="small" color="#3b82f6" style={styles.groupLoader} />
//           ) : !loadingBoards ? (
//               <Text style={styles.noDataText}>No classes found for this board.</Text>
//           ) : null
//         )}

//         {selectedClassName && (
//           availableSubjects.length > 0 ? (
//             <SelectionGroup
//               title="Select Your Subject"
//               items={availableSubjects.map(s => ({ label: s.name, value: s.id }))}
//               selectedValue={selectedSubjectId}
//               onSelect={handleSelectSubject}
//               iconName="book-outline"
//               style={subjectGroupStyle}
//             />
//           ) : loadingBoardDetails ? (
//              null
//           ) : !loadingBoards && !loadingBoardDetails ? (
//               <Text style={styles.noDataText}>No subjects found for this class.</Text>
//           ) : null
//         )}

//         <View style={styles.buttonWrapper}>
//           <Animated.View style={[styles.buttonShadow, animatedButtonShadowStyle]}>
//             <TouchableOpacity
//               disabled={!isReady}
//               onPress={handleLearnPress}
//               onPressIn={() => (buttonScale.value = withSpring(0.98))}
//               onPressOut={() => (buttonScale.value = withSpring(1))}
//               activeOpacity={1}
//             >
//               <Animated.View style={[styles.buttonBase, animatedButtonContainerStyle]}>
//                 <Text style={styles.buttonText}>Let's Learn!</Text>
//               </Animated.View>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     headerBackground: { flex: 1 },
//     headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
//     backButton: {
//       marginLeft: 16,
//       marginTop: -4,
//       backgroundColor: 'rgba(255,255,255,0.2)',
//       borderRadius: 9999,
//       padding: 6,
//     },
//     scrollContainer: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, flexGrow: 1 },
//     shapeBase: { position: 'absolute', borderRadius: 9999 },
//     shape1: { width: 200, height: 200, top: 80, left: -80 },
//     shape2: { width: 150, height: 150, bottom: 100, right: -60 },
//     shape3: { width: 100, height: 100, bottom: -40, left: 20 },
//     buttonWrapper: { width: '100%', marginTop: 24 },
//     buttonBase: { borderRadius: 16, paddingVertical: 20, alignItems: 'center' },
//     buttonShadow: { shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 5 },
//     buttonText: { fontSize: 22, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
//     noDataText: {
//       marginTop: 20,
//       fontSize: 16,
//       color: '#6b7280',
//       textAlign: 'center',
//       padding: 10,
//     },
//     groupLoader: {
//       marginTop: 20,
//       marginBottom: 20,
//     },
// });

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withDelay,
  withSpring,
  interpolateColor,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SelectionGroup } from '../components/SelectionGroup'; // Adjust path if needed
import { fetchBoards, DataMap, Board } from '@/Services/Boards/Service'; // Adjust path if needed
import { updateUserInfo } from '@/Services/User/UserService'; // Adjust path if needed
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore'; // Import Firestore functions
import { db } from '@/firebaseConfig'; // Adjust path if needed

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Interface for subjects embedded in the class data
interface EmbeddedSubject {
  id: string;
  name: string;
}

// Interface for the data structure within the Firestore document
interface BoardClassData {
  boardId: number;
  classesWithSubjects?: {
    [className: string]: EmbeddedSubject[];
  };
}

const FloatingShape = ({ style, color, duration = 10000, delay = 0 }: any) => {
  const translateY = useSharedValue(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]} />;
};

const useStaggeredAnimation = (delay: number) => {
  const animationProgress = useSharedValue(0);
  useEffect(() => {
    animationProgress.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, [delay]);
  return useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    transform: [{ translateY: withTiming(animationProgress.value === 1 ? 0 : 20) }],
  }));
};

export default function SelectionPage() {
  const router = useRouter();

  // Board states
  const [boards, setBoards] = useState<DataMap<Board>>({});
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedBoardName, setSelectedBoardName] = useState<string | null>(null);

  // Fetched data for the selected board
  const [selectedBoardData, setSelectedBoardData] = useState<BoardClassData | null>(null);
  const [availableClassNames, setAvailableClassNames] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<EmbeddedSubject[]>([]); // Subjects for the *selected* class

  // Selected class state
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);

  // Selected subjects state (Arrays for multi-select)
  const [selectedSubjectNames, setSelectedSubjectNames] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Loading states
  const [loadingBoardDetails, setLoadingBoardDetails] = useState(false);

  // Readiness check for the button
  const isReady = selectedBoardId && selectedClassName && selectedSubjectIds.length > 0;

  // --- Data Fetching Effects ---
  useEffect(() => {
    const loadBoards = async () => {
      setLoadingBoards(true);
      const fetchedBoards = await fetchBoards();
      setBoards(fetchedBoards);
      setLoadingBoards(false);
    };
    loadBoards();
  }, []);

  useEffect(() => {
    // Reset everything when board changes
    setSelectedBoardData(null);
    setAvailableClassNames([]);
    setAvailableSubjects([]);
    setSelectedClassName(null);
    setSelectedSubjectIds([]);
    setSelectedSubjectNames([]);

    if (!selectedBoardId) return;

    const loadClassAndSubjectData = async () => {
      setLoadingBoardDetails(true);
      try {
        const boardIdValue = Number(selectedBoardId);
        const q = query(
          collection(db, 'classes'),
          where('boardId', '==', boardIdValue)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const boardDoc = snapshot.docs[0];
          const data = boardDoc.data() as BoardClassData;
          setSelectedBoardData(data);
          if (data.classesWithSubjects) {
            setAvailableClassNames(Object.keys(data.classesWithSubjects).sort());
          } else {
             setAvailableClassNames([]);
             console.warn(`'classesWithSubjects' map missing for boardId ${boardIdValue}`);
          }
        } else {
          setSelectedBoardData(null);
          setAvailableClassNames([]);
          console.log(`No data document found for boardId ${boardIdValue}`);
        }
      } catch (error) {
        console.error(`Error fetching class/subject data for board ${selectedBoardId}:`, error);
        setSelectedBoardData(null);
        setAvailableClassNames([]);
      } finally {
        setLoadingBoardDetails(false);
      }
    };
    loadClassAndSubjectData();
  }, [selectedBoardId]);

  useEffect(() => {
    // Reset subjects when class changes
    setAvailableSubjects([]);
    setSelectedSubjectIds([]);
    setSelectedSubjectNames([]);

    // Load subjects for the newly selected class
    if (selectedClassName && selectedBoardData?.classesWithSubjects?.[selectedClassName]) {
      const subjectsForClass = selectedBoardData.classesWithSubjects[selectedClassName];
      setAvailableSubjects(subjectsForClass);
    }
  }, [selectedClassName, selectedBoardData]);

  // --- Selection Handlers ---
  const handleSelectBoard = (boardId: string) => {
    const board = boards[boardId];
    if (board) {
      setSelectedBoardId(boardId);
      setSelectedBoardName(board.name);
      // Other resets are handled by useEffect [selectedBoardId]
    }
  };

  const handleSelectClass = (className: string) => {
    setSelectedClassName(className);
    // Subject resets handled by useEffect [selectedClassName]
  };

  const handleSelectSubject = (subjectId: string) => {
    const subjectItem = availableSubjects.find(s => s.id === subjectId);
    if (!subjectItem) return;

    const currentIndex = selectedSubjectIds.indexOf(subjectId);
    let newSelectedIds = [...selectedSubjectIds];
    let newSelectedNames = [...selectedSubjectNames];

    if (currentIndex === -1) { // Add
      newSelectedIds.push(subjectId);
      newSelectedNames.push(subjectItem.name);
    } else { // Remove
      newSelectedIds.splice(currentIndex, 1);
      newSelectedNames = newSelectedNames.filter(name => name !== subjectItem.name);
    }
    setSelectedSubjectIds(newSelectedIds);
    setSelectedSubjectNames(newSelectedNames);
  };

  // --- Handle Learn Press ---
  const handleLearnPress = async () => {
    if (!isReady || !selectedBoardName || !selectedClassName || !availableSubjects.length) {
      console.log("Selections not complete or data missing.");
      Alert.alert("Incomplete", "Please select a board, class, and at least one subject.");
      return;
    }

    const subjectStatusMap: { [key: string]: boolean } = {};
    availableSubjects.forEach(subject => {
      subjectStatusMap[subject.name] = selectedSubjectIds.includes(subject.id);
    });

    const dataToUpdate = {
      boardName: selectedBoardName ?? undefined,
      className: selectedClassName ?? undefined,
      selectedSubjects: subjectStatusMap,
    };

    buttonScale.value = withSpring(0.98);

    try {
      await updateUserInfo(dataToUpdate);
      console.log("User info updated with subject status:", dataToUpdate);
      buttonScale.value = withSpring(1);

      const subjectIdsParam = selectedSubjectIds.join(','); // Create comma-separated string

      router.push({
        pathname: './ChapterList', // Adjust path if needed
        params: {
          board: selectedBoardId,
          class: selectedClassName,
          subjects: subjectIdsParam, // Pass multiple subject IDs
        },
      });
    } catch (error) {
      console.error("Failed to update user selection info:", error);
      buttonScale.value = withSpring(1);
      Alert.alert("Error", "Could not save your selections. Please try again.");
    }
  };

  // --- Animations & Styles ---
  const backgroundProgress = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  useEffect(() => {
    backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const animatedGradientProps = useAnimatedProps(() => {
    const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
    const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
    return { colors: [color1, color2] as [string, string] };
  });

  const animatedButtonContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isReady ? '#3b82f6' : '#9ca3af', { duration: 300 }),
    transform: [{ scale: buttonScale.value }],
  }));
  const animatedButtonShadowStyle = useAnimatedStyle(() => ({
    shadowColor: isReady ? '#60a5fa' : '#000',
    shadowOpacity: withTiming(isReady ? 0.5 : 0.2, { duration: 300 }),
  }));

  const boardGroupStyle = useStaggeredAnimation(0);
  const classGroupStyle = useStaggeredAnimation(150);
  const subjectGroupStyle = useStaggeredAnimation(300);

  // --- Render Logic ---
  return (
    <View style={styles.container}>
       <Stack.Screen
         options={{
           headerTitle: 'Student Selection',
           headerTitleAlign: 'center',
           headerTitleStyle: styles.headerTitle,
           headerTintColor: '#fff',
           headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />,
           headerLeft: () => (
             <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('./')} style={styles.backButton}>
               <Ionicons name="arrow-back" size={22} color="#fff" />
             </TouchableOpacity>
           ),
         }}
       />

      <AnimatedLinearGradient style={StyleSheet.absoluteFill} colors={['#eaf3fa', '#d9e8f5']} animatedProps={animatedGradientProps} />
      <FloatingShape style={styles.shape1} color="rgba(147, 197, 253, 0.3)" duration={12000} />
      <FloatingShape style={styles.shape2} color="rgba(165, 214, 255, 0.3)" duration={10000} delay={1000} />
      <FloatingShape style={styles.shape3} color="rgba(191, 219, 254, 0.3)" duration={14000} delay={500} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loadingBoards ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <SelectionGroup
            title="Select Your Board"
            items={Object.values(boards).map(b => ({ label: b.name, value: b.id }))}
            selectedValue={selectedBoardId}
            onSelect={handleSelectBoard}
            iconName="library-outline"
            style={boardGroupStyle}
          />
        )}

        {selectedBoardId && (
          availableClassNames.length > 0 ? (
            <SelectionGroup
              title="Select Your Class"
              items={availableClassNames.map(name => ({ label: name, value: name }))}
              selectedValue={selectedClassName}
              onSelect={handleSelectClass}
              iconName="school-outline"
              style={classGroupStyle}
            />
          ) : loadingBoardDetails ? (
              <ActivityIndicator size="small" color="#3b82f6" style={styles.groupLoader} />
          ) : !loadingBoards ? (
              <Text style={styles.noDataText}>No classes found for this board.</Text>
          ) : null
        )}

        {selectedClassName && (
          availableSubjects.length > 0 ? (
            <SelectionGroup
              title="Select Your Subject(s)" // Update title
              items={availableSubjects.map(s => ({ label: s.name, value: s.id }))}
              selectedValue={selectedSubjectIds} // Pass array of IDs
              onSelect={handleSelectSubject}
              iconName="book-outline"
              style={subjectGroupStyle}
              allowMultiple={true} // Add prop for multi-select
            />
          ) : loadingBoardDetails ? (
             null
          ) : !loadingBoards && !loadingBoardDetails ? (
              <Text style={styles.noDataText}>No subjects found for this class.</Text>
          ) : null
        )}

        <View style={styles.buttonWrapper}>
          <Animated.View style={[styles.buttonShadow, animatedButtonShadowStyle]}>
            <TouchableOpacity
              disabled={!isReady}
              onPress={handleLearnPress}
              onPressIn={() => (buttonScale.value = withSpring(0.98))}
              onPressOut={() => (buttonScale.value = withSpring(1))}
              activeOpacity={1}
            >
              <Animated.View style={[styles.buttonBase, animatedButtonContainerStyle]}>
                <Text style={styles.buttonText}>Let's Learn!</Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBackground: { flex: 1 },
    headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
    backButton: {
      marginLeft: 16,
      marginTop: -4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 9999,
      padding: 6,
    },
    scrollContainer: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, flexGrow: 1 },
    shapeBase: { position: 'absolute', borderRadius: 9999 },
    shape1: { width: 200, height: 200, top: 80, left: -80 },
    shape2: { width: 150, height: 150, bottom: 100, right: -60 },
    shape3: { width: 100, height: 100, bottom: -40, left: 20 },
    buttonWrapper: { width: '100%', marginTop: 24 },
    buttonBase: { borderRadius: 16, paddingVertical: 20, alignItems: 'center' },
    buttonShadow: { shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 5 },
    buttonText: { fontSize: 22, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
    noDataText: {
      marginTop: 20,
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
      padding: 10,
    },
    groupLoader: {
      marginTop: 20,
      marginBottom: 20,
    },
});