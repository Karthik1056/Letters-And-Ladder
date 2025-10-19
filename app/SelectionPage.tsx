import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
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
import { SelectionGroup } from '../components/SelectionGroup';
import { fetchBoards,DataMap ,Board} from '@/Services/Boards/Service';
import { fetchClasses ,Class} from '@/Services/Class/Service';
import { fetchSubjects,Subject } from '@/Services/Subjects/Service';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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

  const [boards, setBoards] = useState<DataMap<Board>>({});
  const [classes, setClasses] = useState<DataMap<Class>>({});
  const [subjects, setSubjects] = useState<DataMap<Subject>>({});

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const isReady = selectedBoard && selectedClass && selectedSubject;

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoard(boardId);
    setSelectedClass(null);
    setSelectedSubject(null);
    setClasses({});
    setSubjects({});
  };

  const handleSelectClass = (classId: string) => {
    setSelectedClass(classId);
    setSelectedSubject(null);
    setSubjects({});
  };

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

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
    if (!selectedBoard) {
      setClasses({});
      return;
    }
    const loadClasses = async () => {
      setLoadingClasses(true);
      const fetchedClasses = await fetchClasses(selectedBoard);
      setClasses(fetchedClasses);
      setLoadingClasses(false);
    };
    loadClasses();
  }, [selectedBoard]);

  useEffect(() => {
    if (!selectedClass) {
      setSubjects({});
      return;
    }
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      const fetchedSubjects = await fetchSubjects(selectedClass);
      setSubjects(fetchedSubjects);
      setLoadingSubjects(false);
    };
    loadSubjects();
  }, [selectedClass]);

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

  const handleLearnPress = () => {
    if (isReady) {
      router.push({
        pathname: './ChapterList',
        params: { board: selectedBoard, class: selectedClass, subject: selectedSubject },
      });
    }
  };

  const classCount = Object.keys(classes).length;
  const subjectCount = Object.keys(subjects).length;

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
            selectedValue={selectedBoard}
            onSelect={handleSelectBoard}
            iconName="library-outline"
            style={boardGroupStyle}
          />
        )}

        {selectedBoard && (
          classCount > 0 ? (
            <SelectionGroup
              title="Select Your Class"
              items={Object.values(classes).map(c => ({ label: c.name, value: c.id }))}
              selectedValue={selectedClass}
              onSelect={handleSelectClass}
              iconName="school-outline"
              style={classGroupStyle}
            />
          ) : loadingClasses ? (
              <ActivityIndicator size="small" color="#3b82f6" style={styles.groupLoader} />
          ) : (
              <Text style={styles.noDataText}>No classes found for this board.</Text>
          )
        )}

        {selectedClass && (
          subjectCount > 0 ? (
            <SelectionGroup
              title="Select Your Subject"
              items={Object.values(subjects).map(s => ({ label: s.name, value: s.id }))}
              selectedValue={selectedSubject}
              onSelect={handleSelectSubject}
              iconName="book-outline"
              style={subjectGroupStyle}
            />
          ) : loadingSubjects ? (
              <ActivityIndicator size="small" color="#3b82f6" style={styles.groupLoader} />
          ) : (
              <Text style={styles.noDataText}>No subjects found for this class.</Text>
          )
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
    color: '#ef4444', 
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  groupLoader: {
    marginTop: 20,
    marginBottom: 20,
  },
});
