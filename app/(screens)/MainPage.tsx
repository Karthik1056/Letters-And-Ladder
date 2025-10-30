import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react'; // React is already imported
import { Ionicons } from '@expo/vector-icons';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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

// --- Reusable Animated Shape Component ---
const FloatingShape = ({
  style,
  color,
  duration = 10000,
  delay = 0,
}: {
  style?: object;
  color: string;
  duration?: number;
  delay?: number;
}) => {
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

export default function MainPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Memoize the list of selected subjects from the user context
  const selectedSubjects = useMemo(() => {
    if (!user?.selectedSubjects) return [];
    return Object.entries(user.selectedSubjects)
      .filter(([, isSelected]) => isSelected)
      .map(([subjectName]) => subjectName);
  }, [user?.selectedSubjects]);

  const handleSubjectPress = (subjectName: string) => {
    // Navigate to ChapterList, passing the required info
    router.push({
      pathname: '/ChapterList',
      params: { boardName: user?.boardName, className: user?.className, subjectName },
    });
  };

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

  const titleStyle = useStaggeredAnimation(100, 'top');
  const buttonStyle = useStaggeredAnimation(600, 'bottom');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Letters And Ladders',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#fff',
          headerBackVisible: false,
          headerBackground: () => (
            <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />
          ),
          headerRight: () => (
            // Assuming profile is also in the (screens) group
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={30} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <AnimatedLinearGradient
        style={StyleSheet.absoluteFill}
        colors={['#eaf3fa', '#d9e8f5']}
        animatedProps={animatedGradientProps}
      />

      <FloatingShape style={styles.shape1} color="rgba(147, 197, 253, 0.3)" duration={12000} />
      <FloatingShape
        style={styles.shape2}
        color="rgba(165, 214, 255, 0.3)"
        duration={10000}
        delay={1000}
      />
      <FloatingShape
        style={styles.shape3}
        color="rgba(191, 219, 254, 0.3)"
        duration={14000}
        delay={500}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.Text style={[styles.sectionTitle, titleStyle]}>Your Subjects</Animated.Text>

        {selectedSubjects.length > 0 ? (
          selectedSubjects.map((subject, index) => {
            const cardStyle = useStaggeredAnimation(150 + index * 100, 'bottom');
            return (
              <Animated.View key={subject} style={[styles.subjectCard, cardStyle]}>
                <TouchableOpacity
                  style={styles.touchableCard}
                  activeOpacity={0.8}
                  onPress={() => handleSubjectPress(subject)}
                >
                  <View style={styles.cardIconWrapper}>
                    <Ionicons name="book-outline" size={24} color="#3b82f6" />
                  </View>
                  <Text style={styles.subjectTitle}>{subject}</Text>
                  {/* Added a subtle divider */}
                  <View style={styles.cardDivider} />
                  <Ionicons name="chevron-forward-outline" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </Animated.View>
            );
          })
        ) : (
          <Animated.View style={[styles.noSubjectsContainer, useStaggeredAnimation(150, 'bottom')]}>
            <Ionicons name="bulb-outline" size={60} color="#9ca3af" style={styles.noSubjectsIcon} />
            <Text style={styles.noSubjectsText}>No subjects selected yet!</Text>
            <Text style={styles.noSubjectsSubText}>
              Tap "{selectedSubjects.length > 0 ? 'Change Subjects' : 'Start New Lesson'}" to begin
              your learning adventure.
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
        <TouchableOpacity
          onPress={() => router.push('/SelectionPage')}
          onPressIn={() => (buttonScale.value = withSpring(0.98))}
          onPressOut={() => (buttonScale.value = withSpring(1))}
          activeOpacity={1}
        >
          <Animated.View style={[styles.button, { transform: [{ scale: buttonScale.value }] }]}>
            <Text style={styles.buttonText}>
              {selectedSubjects.length > 0 ? 'Change Subjects' : 'Start New Lesson'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: { flex: 1 },
  headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
  profileButton: { marginRight: 16 },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120, // Space for the floating button
  },
  sectionTitle: {
    fontSize: 24, // Slightly larger for prominence
    fontWeight: 'bold',
    color: '#2c3e50', // A bit softer dark blue-grey
    marginBottom: 24,
    letterSpacing: 0.5, // Added letter spacing for refinement
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
  cardDivider: { width: 1, height: '70%', backgroundColor: '#e2e8f0', marginRight: 16 },
  subjectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 16,
  },
  noSubjectsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  noSubjectsSubText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
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
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  shapeBase: { position: 'absolute', borderRadius: 9999 },
  shape1: { width: 200, height: 200, top: '15%', left: -80 },
  shape2: { width: 150, height: 150, bottom: '10%', right: -60 },
  shape3: { width: 100, height: 100, top: '50%', left: 20 },
});
