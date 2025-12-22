
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  withDelay,
} from 'react-native-reanimated';
import { fetchChaptersByFilters } from '@/Services/Chapters/Service'; // Adjust path if needed
import AnimatedBackground from '../../components/AnimatedBackground';

// 1. Updated Chapter type to include all necessary data
export type Chapter = {
  id: string;
  title: string;       // Mapped from 'name'
  lessonNumber: number; // Mapped from 'chap_num'
  subject: string;
  className: string;
  boardName: string;
  textUrl: string;
  language:string;
};
// Removed the unused 'chapterList' interface

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

// 2. Updated ChapterCard to accept and use an 'onPress' prop
const ChapterCard = ({ chapter, index, onPress }: { chapter: Chapter; index: number; onPress: (chapter: Chapter) => void }) => {
  const cardStyle = useStaggeredAnimation(150 + index * 100);

  return (
    <Animated.View style={[styles.chapterCard, cardStyle]}>
      {/* 3. Added onPress handler to the TouchableOpacity */}
      <TouchableOpacity
        style={styles.touchableCard}
        activeOpacity={0.7}
        onPress={() => onPress(chapter)} // Call the passed function
      >
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
  const { boardName, className, subjectName } = useLocalSearchParams() as {
    boardName: string;
    className: string;
    subjectName: string;
  };


  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChaptersData = async () => {
      if (boardName && className && subjectName) {
        setLoading(true);

        const data = await fetchChaptersByFilters(boardName, className, subjectName);

        // 4. Updated mapping to include all data from the Chapter type
        const chaptersFromDB: Chapter[] = data
          .map((item: any) => ({
            id: item.id,
            title: item.name, // Map 'name' to 'title'
            lessonNumber: item.chap_num, // Map 'chap_num' to 'lessonNumber'
            subject: item.subject,
            className: item.className,
            boardName: item.boardName,
            textUrl: item.textUrl, // Include textUrl,
            language:item.language
          }))
          .sort((a, b) => a.lessonNumber - b.lessonNumber); // Sort by lesson number

        // Removed the setTimeout, data is loaded
        setChapters(chaptersFromDB);
        setLoading(false);
      }
    };

    fetchChaptersData();
  }, [boardName, className, subjectName]);

  // 5. New function to handle navigation
  // This code goes inside app/(screens)/ChapterList.tsx

  const handleChapterPress = (chapter: Chapter) => {
    console.log("Navigating to chapter:", chapter.title);

    router.push({
      // Use the route template literal that matches the app routes union type.
      // This will be resolved with the params below.
      pathname: '/(screens)/[chapterId]',

      // All these params will be passed automatically.
      // useLocalSearchParams will get ALL of them.
      params: {
        chapterId: chapter.id,
        title: chapter.title,
        lessonNumber: chapter.lessonNumber.toString(),
        textUrl: chapter.textUrl,
        // These are no longer needed on the detail page, but it's fine
        subject: chapter.subject,
        className: chapter.className,
        boardName: chapter.boardName,
        language:chapter.language
      }
    });
  };

  const headerStyle = useStaggeredAnimation(0);

  return (
    <AnimatedBackground>
      <Stack.Screen
        options={{
          headerTitle: () => <Text style={styles.headerTitle}>{(subjectName as string) || 'Chapters'}</Text>,
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.pathHeader, headerStyle]}>
          <Text style={styles.pathText}>{className}</Text>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
        ) : (
          chapters.map((chapter, index) => (
            // 6. Pass the handleChapterPress function to the card
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              index={index}
              onPress={handleChapterPress}
            />
          ))
        )}
      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  headerBackground: { flex: 1 },
  headerTitle: { fontFamily: 'CustomFont-Bold', color: '#fff', fontSize: 20, includeFontPadding: false, textAlignVertical: 'center' },
  backButton: {
    marginLeft: 16,
    marginTop: -4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    fontFamily: 'CustomFont-Bold',
    color: '#475569',
    includeFontPadding: false,
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
    fontFamily: 'CustomFont-Bold',
    color: '#4338ca',
    includeFontPadding: false,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 17,
    fontFamily: 'CustomFont-Bold',
    color: '#1e293b',
    includeFontPadding: false,
  },
});
