import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withDelay,
  interpolateColor,
  withSequence,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export type Chapter = {
  id: string;
  title: string;
  lessonNumber: number;
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

// Move per-item hook usage into a child component so hooks are not called inside the map
const ChapterCard = ({ chapter, index }: { chapter: Chapter; index: number }) => {
  const cardStyle = useStaggeredAnimation(150 + index * 100);

  return (
    <Animated.View style={[styles.chapterCard, cardStyle]}>
      <TouchableOpacity style={styles.touchableCard} activeOpacity={0.7}>
        <View style={styles.lessonNumberContainer}>
          <Text style={styles.lessonNumber}>{chapter.lessonNumber}</Text>
        </View>
        <View style={styles.chapterInfo}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
        </View>
        <Ionicons name="play-circle" size={40} color="#3b82f6" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ChapterList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { boardId, classId, subjectId, boardName, className, subjectName } = params;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChaptersData = () => { // Made async unnecessary as it's just a setTimeout
      if (boardName && className && subjectName) { // Changed condition to use names
        setLoading(true);
        // In a real app, you'd fetch from a service. For now, we use a mock.
        const mockData: Chapter[] = [
          { id: 'c1', title: 'Alphabet Adventure', lessonNumber: 1 },
          { id: 'c2', title: 'Phonics Fun', lessonNumber: 2 },
          { id: 'c3', title: 'Word Building', lessonNumber: 3 },
          { id: 'c4', title: 'Reading Simple Sentences', lessonNumber: 4 },
          { id: 'c5', title: 'Story Time: The Lost Kite', lessonNumber: 5 },
        ];
        setTimeout(() => {
          setChapters(mockData);
          setLoading(false);
        }, 1000);
      }
    };

    fetchChaptersData();
  }, [boardName, className, subjectName]); // Changed dependencies

  const backgroundProgress = useSharedValue(0);
  useEffect(() => {
    backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const animatedGradientProps = useAnimatedProps(() => {
    const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
    const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
    return { colors: [color1, color2] as [string, string] };
  });

  const headerStyle = useStaggeredAnimation(0);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: (subjectName as string) || 'Chapters',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#fff',
          headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
        <Animated.View style={[styles.pathHeader, headerStyle]}>
          <Text style={styles.pathText}>{className}</Text>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
        ) : (
          chapters.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index} />
          ))
        )}
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pathHeader: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    alignItems: 'center',
  },
  pathText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
  },
  chapterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  touchableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  lessonNumberContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    marginRight: 16,
  },
  lessonNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4338ca',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  shapeBase: { position: 'absolute', borderRadius: 9999 },
  shape1: { width: 200, height: 200, top: 80, left: -80 },
  shape2: { width: 150, height: 150, bottom: 100, right: -60 },
  shape3: { width: 100, height: 100, bottom: -40, left: 20 },
});
