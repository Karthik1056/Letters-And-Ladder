import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SelectionGroup } from '../components/SelectionGroup';
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
import { Ionicons } from '@expo/vector-icons';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// --- Data Constants ---
const boards = ['CBSE', 'ICSE', 'State Board'] as const;
const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'] as const;
const subjects = ['ಕನ್ನಡ', 'English', 'Hindi', 'EVS'] as const;  
type Board = (typeof boards)[number];
type Class = (typeof classes)[number];
type Subject = (typeof subjects)[number];

// --- Custom Hook for Staggered Animation ---
const useStaggeredAnimation = (delay: number) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
  }, []);

  return useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    transform: [{ translateY: withTiming(animationProgress.value === 1 ? 0 : 20) }],
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

  return (
    <Animated.View
      style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]}
    />
  );
};

export default function SelectionPage() {
  const router = useRouter();

  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const isReady = selectedBoard && selectedClass && selectedSubject;
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

  // Use the custom hook for cleaner animation logic
  const boardGroupStyle = useStaggeredAnimation(0);
  const classGroupStyle = useStaggeredAnimation(150);
  const subjectGroupStyle = useStaggeredAnimation(300);

  const handleLearnPress = () => {
    if (isReady) {
      router.push({
        pathname: '/ChapterList',
        params: { board: selectedBoard, class: selectedClass, subject: selectedSubject },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Student Selection',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#fff',
          headerBackground: () => (
            <LinearGradient
              colors={['#3b82f6', '#60a5fa']}
              style={styles.headerBackground}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Animated gradient background */}
      <AnimatedLinearGradient
        style={StyleSheet.absoluteFill}
        colors={['#eaf3fa', '#d9e8f5']}
        animatedProps={animatedGradientProps}
      />

      {/* Floating decorative shapes */}
      <FloatingShape
        style={styles.shape1}
        color="rgba(147, 197, 253, 0.3)"
        duration={12000}
      />
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
        <SelectionGroup
          title="Select Your Board"
          items={boards}
          selectedValue={selectedBoard}
          onSelect={setSelectedBoard}
          iconName={'library-outline'}
          style={boardGroupStyle}
        />
        <SelectionGroup
          title="Select Your Class"
          items={classes}
          selectedValue={selectedClass}
          onSelect={setSelectedClass}
          iconName={'school-outline'}
          style={classGroupStyle}
        />
        <SelectionGroup
          title="Select Your Subject"
          items={subjects}
          selectedValue={selectedSubject}
          onSelect={setSelectedSubject}
          iconName={'book-outline'}
          style={subjectGroupStyle}
        />

        <View style={styles.buttonWrapper}>
          <Animated.View style={[styles.buttonShadow, animatedButtonShadowStyle]}>
            <TouchableOpacity
              disabled={!isReady}
              onPress={handleLearnPress}
              onPressIn={() => (buttonScale.value = withSpring(0.98))}
              onPressOut={() => (buttonScale.value = withSpring(1))}
              activeOpacity={1}
            >
              <Animated.View
                style={[styles.buttonBase, animatedButtonContainerStyle]}
              >
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
  // Header
  headerBackground: { flex: 1 },
  headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
  backButton: {
    marginLeft: 16,
    marginTop: -4, // slight upward shift
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 9999,
    padding: 6,
  },
  // ScrollView
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32, // spacing below header
    paddingBottom: 40,
    flexGrow: 1,
  },
  // Shapes
  shapeBase: { position: 'absolute', borderRadius: 9999 },
  shape1: { width: 200, height: 200, top: 80, left: -80 },
  shape2: { width: 150, height: 150, bottom: 100, right: -60 },
  shape3: { width: 100, height: 100, bottom: -40, left: 20 },
  // Button
  buttonWrapper: { width: '100%', marginTop: 24 },
  buttonBase: {
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  buttonShadow: {
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
