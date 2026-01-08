import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import { fetchChaptersByFilters } from '@/Services/Chapters/Service';
import {getUserProgress} from '../../Services/User/UserService'

// --- Custom Hook for Staggered Animation ---
const useStaggeredAnimation = (delay: number, from: 'bottom' | 'top' | 'scale' = 'scale') => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) })
    );
  }, []);

  return useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    transform:
      from === 'scale'
        ? [{ scale: animationProgress.value }]
        : [
          {
            translateY:
              (1 - animationProgress.value) * (from === 'bottom' ? 20 : -20),
          },
        ],
  }));
};

// --- Subject Card moved into its own component so hooks are not called conditionally in the
// main component's render loop. This avoids changing the hooks order between renders.
const SubjectCard = ({
  subject,
  index,
  onPress,
  progress,
}: {
  subject: string;
  index: number;
  onPress: (s: string) => void;
  progress: number;
}) => {
  const cardStyle = useStaggeredAnimation(150 + index * 100, 'bottom');

  return (
    <Animated.View style={[styles.subjectCard, cardStyle]}>
      <TouchableOpacity
        style={styles.touchableCard}
        activeOpacity={0.8}
        onPress={() => onPress(subject)}
      >
        <View style={styles.cardIconWrapper}>
          <Ionicons name="book-outline" size={24} color="#3b82f6" />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectTitle}>{subject}</Text>
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={['#60a5fa', '#3b82f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progress)}% Complete</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color="#9ca3af" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MainPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // useEffect(() => {
  //   const loadSelectedSubjects = async () => {
  //     try {
  //       const storedUser = await AsyncStorage.getItem('user');
  //       if (storedUser) {
  //         const parsedUser = JSON.parse(storedUser);
  //         if (parsedUser.selectedSubjects) {
  //           const subjects = Object.entries(parsedUser.selectedSubjects)
  //             .filter(([, isSelected]) => isSelected)
  //             .map(([subjectName]) => subjectName);
  //           setSelectedSubjects(subjects);

  //           // Calculate progress for each subject
  //           const newProgressMap: Record<string, number> = {};
  //           const { boardName, className, completedChapters = {} } = parsedUser;

  //           if (boardName && className) {
  //             await Promise.all(
  //               subjects.map(async (subject) => {
  //                 try {
  //                   const chapters = await fetchChaptersByFilters(boardName, className, subject);
  //                   const total = chapters.length;
  //                   const completed = chapters.filter((ch: any) => completedChapters[ch.id]).length;
  //                   newProgressMap[subject] = total > 0 ? (completed / total) * 100 : 0;
  //                 } catch (e) {
  //                   newProgressMap[subject] = 0;
  //                 }
  //               })
  //             );
  //             setProgressMap(newProgressMap);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error loading subjects from storage:', error);
  //       Alert.alert('Error', 'Could not load your subjects.');
  //     }
  //   };

  //   loadSelectedSubjects();
  // }, [user]); // Re-run if the user object in context changes

  useEffect(() => {
    const loadSelectedSubjects = async () => {
      if (user && user.selectedSubjects) {
        const subjects = Object.keys(user.selectedSubjects || {}).filter(key => user.selectedSubjects?.[key]);
        setSelectedSubjects(subjects);

        const progressData = await getUserProgress();
        const newProgressMap: Record<string, number> = {};

        subjects.forEach((subject) => {
          newProgressMap[subject] = progressData?.subjects?.[subject]?.percentage || 0;
        });

        setProgressMap(newProgressMap);
      }
    };

    loadSelectedSubjects();
  }, [user]);

  const handleSubjectPress = async (subjectName: string) => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Navigate to ChapterList, passing the required info from the freshly loaded user data
        router.push({
          pathname: '/ChapterList',
          params: {
            boardName: parsedUser.boardName,
            className: parsedUser.className,
            subjectName,
          },
        });
      } else {
        Alert.alert('Error', 'Could not find user data. Please try logging out and back in.');
      }
    } catch (error) {
      console.error('Error reading user from storage on subject press:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const buttonScale = useSharedValue(1);

  const titleStyle = useStaggeredAnimation(100, 'top');
  const buttonStyle = useStaggeredAnimation(600, 'bottom');
  // noSubjectsStyle must be called unconditionally at the top level of the component
  // to follow the rules of hooks (don't call hooks conditionally).
  const noSubjectsStyle = useStaggeredAnimation(150, 'bottom');

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: () => <Text style={styles.headerTitle}>Letters And Ladders</Text>,
            headerTitleAlign: 'center',
            headerTintColor: '#fff',
            headerBackVisible: false,
            headerBackground: () => (
              <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />
            ),
            headerLeft: () => (
              // Assuming profile is also in the (screens) group
              <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
                <Ionicons name="person-circle" size={40} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.Text style={[styles.sectionTitle, titleStyle]}>Your Subjects</Animated.Text>

          {selectedSubjects.length > 0 ? (
            selectedSubjects.map((subject, index) => (
              <SubjectCard
                key={subject}
                subject={subject}
                index={index}
                onPress={handleSubjectPress}
                progress={progressMap[subject] || 0}
              />
            ))
          ) : (
            <Animated.View style={[styles.noSubjectsContainer, noSubjectsStyle]}>
              <Ionicons name="bulb-outline" size={60} color="#9ca3af" style={styles.noSubjectsIcon} />
              <Text style={styles.noSubjectsText}>No subjects selected yet!</Text>
              <Text style={styles.noSubjectsSubText}>
                Tap "{selectedSubjects.length > 0 ? 'Add Subjects' : 'Start New Lesson'}" to begin
                your learning adventure.
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
          <TouchableOpacity
            onPress={() => router.push('/SelectionPage2')}
            onPressIn={() => (buttonScale.value = withSpring(0.98))}
            onPressOut={() => (buttonScale.value = withSpring(1))}
            activeOpacity={1}
          >
            <Animated.View style={[styles.button, { transform: [{ scale: buttonScale.value }] }]}>
              <Text style={styles.buttonText}>
                {selectedSubjects.length > 0 ? 'Add Subjects' : 'Start New Lesson'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: { flex: 1 },
  headerTitle: { fontFamily: 'CustomFont-Bold', color: '#fff', fontSize: 20, includeFontPadding: false, textAlignVertical: 'center' },
  profileButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120, // Space for the floating button
  },
  sectionTitle: {
    fontSize: 24, // Slightly larger for prominence
    fontFamily: 'CustomFont-Bold',
    color: '#2c3e50', // A bit softer dark blue-grey
    marginBottom: 16,
    letterSpacing: 0.5, // Added letter spacing for refinement
    includeFontPadding: false,
  },
  subjectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  touchableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  subjectTitle: {
    fontSize: 18,
    fontFamily: 'CustomFont-Bold',
    color: '#1e293b',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressLabel: {
    fontSize: 12, color: '#64748b', marginTop: 4, fontFamily: 'CustomFont-Regular', includeFontPadding: false
  },
  noSubjectsText: {
    fontSize: 18,
    fontFamily: 'CustomFont-Bold',
    color: '#475569',
    marginBottom: 8,
    includeFontPadding: false,
  },
  noSubjectsSubText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'CustomFont-Regular',
    color: '#64748b',
    lineHeight: 24,
    includeFontPadding: false,
  },
  noSubjectsContainer: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    paddingVertical: 40,
  },
  noSubjectsIcon: { marginBottom: 20 },
  buttonWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'CustomFont-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
