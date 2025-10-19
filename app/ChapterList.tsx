import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// --- Floating Background Shape ---
type FloatingShapeProps = {
  style?: object;
  color: string;
  duration?: number;
  delay?: number;
};

const FloatingShape = ({ style, color, duration = 10000, delay = 0 }: FloatingShapeProps) => {
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
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]} />;
};

// --- Mock API ---
type Chapter = {
  id: string;
  title: string;
  lessonNumber: number;
};

const mockChapters: {
  [board: string]: {
    [className: string]: {
      [subject: string]: Chapter[];
    };
  };
} = {
  'State Board': {
    'Class 1': {
      'ಕನ್ನಡ': [
        { id: 's1k1', title: 'Varnamale (Basics)', lessonNumber: 1 },
        { id: 's1k2', title: 'Kagunitha (Intro)', lessonNumber: 2 },
      ],
      'English': [
        { id: 's1e1', title: 'Alphabet (Part 1)', lessonNumber: 1 },
        { id: 's1e2', title: 'Phonics Fun', lessonNumber: 2 },
      ],
    },
    'Class 2': {
      'ಕನ್ನಡ': [
        { id: 's2k1', title: 'Vathaakshara (Advanced)', lessonNumber: 1 },
        { id: 's2k2', title: 'Simple Poems', lessonNumber: 2 },
      ],
      'English': [
        { id: 's2e1', title: 'Building Words', lessonNumber: 1 },
        { id: 's2e2', title: 'Reading Sentences', lessonNumber: 2 },
      ],
    },
  },
  'CBSE': {
    'Class 1': {
      'English': [
        { id: 'c1e1', title: 'Meet the Letters', lessonNumber: 1 },
        { id: 'c1e2', title: 'Word Families', lessonNumber: 2 },
      ],
      'Hindi': [
        { id: 'c1h1', title: 'वर्णमाला परिचय', lessonNumber: 1 },
        { id: 'c1h2', title: 'मात्राएँ', lessonNumber: 2 },
      ],
    },
  },
};

// This function simulates fetching data from an API.
const fetchChapters = async (board: string, className: string, subject: string): Promise<Chapter[]> => {
  console.log(`Fetching chapters for: ${board} - ${className} - ${subject}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const chapters = mockChapters[board]?.[className]?.[subject] || [];
      resolve(chapters);
    }, 1000); // Simulate network delay
  });
};

export default function ChapterListPage() {
  const router = useRouter();
  const {
    board,
    class: className,
    subject,
  } = useLocalSearchParams<{ board?: string | string[]; class?: string | string[]; subject?: string | string[] }>();

  // Normalize params (handles undefined or array case)
  const subjectTitle = Array.isArray(subject) ? subject[0] : subject ?? 'Subject';
  const boardTitle = Array.isArray(board) ? board[0] : board ?? 'Board';
  const classTitle = Array.isArray(className) ? className[0] : className ?? 'Class';

  const backgroundProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);

  useEffect(() => {
    backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentScale.value = withDelay(200, withTiming(1, { duration: 600 }));
  }, []);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
      setIsLoading(true);
      const fetchedChapters = await fetchChapters(boardTitle, classTitle, subjectTitle);
      setChapters(fetchedChapters);
      setIsLoading(false);
    };
    loadChapters();
  }, [boardTitle, classTitle, subjectTitle]);

  const animatedGradientProps = useAnimatedProps(() => {
    const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
    const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
    return { colors: [color1, color2] as [string, string] };
  });

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <Stack.Screen
        options={{
          headerTitle: `${subjectTitle} - ${classTitle}`,
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#fff',
          headerBackground: () => (
            <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('./SelectionPage');
                }
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Background */}
      <AnimatedLinearGradient
        style={StyleSheet.absoluteFill}
        colors={['#eaf3fa', '#d9e8f5']}
        animatedProps={animatedGradientProps}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Shapes */}
      <FloatingShape style={styles.shape1} color="rgba(147, 197, 253, 0.3)" duration={12000} />
      <FloatingShape style={styles.shape2} color="rgba(165, 214, 255, 0.3)" duration={10000} delay={1000} />
      <FloatingShape style={styles.shape3} color="rgba(191, 219, 254, 0.3)" duration={14000} delay={500} />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loaderText}>Loading Chapters...</Text>
          </View>
        ) : (
          <Animated.View style={animatedContentStyle}>
            {chapters.map((chapter, index) => (
              <TouchableOpacity key={chapter.id} style={styles.chapterCard} onPress={() => {}}>
                <View style={styles.chapterNumberContainer}>
                  <Text style={styles.chapterNumber}>{chapter.lessonNumber}</Text>
                </View>
                <View style={styles.chapterTitleContainer}>
                  <Text style={styles.chapterTitle} numberOfLines={1}>
                    {chapter.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={24} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerBackground: { flex: 1 },
  headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
  backButton: {
    marginLeft: 16,
    marginTop: -4, // moves the arrow slightly upward
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9999,
  },

  // ScrollView
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Floating shapes
  shapeBase: { position: 'absolute', borderRadius: 9999 },
  shape1: { width: 220, height: 220, top: '5%', left: -80 },
  shape2: { width: 160, height: 160, bottom: '15%', right: -70 },
  shape3: { width: 110, height: 110, bottom: '2%', left: 30 },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 18,
    color: '#4b5563',
  },

  // Chapter Card
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  chapterNumberContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4338ca',
  },
  chapterTitleContainer: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
});
