import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

export default function ChapterListPage() {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject?: string | string[] }>();

  // Normalize subject (handles undefined or array case)
  const subjectTitle = Array.isArray(subject) ? subject[0] : subject ?? 'Subject';

  const backgroundProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);

  useEffect(() => {
    backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);

    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 600 });
      contentScale.value = withTiming(1, { duration: 600 });
    }, 200);
  }, []);

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
          headerTitle: `${subjectTitle} Chapters`,
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
                  router.replace('/SelectionPage');
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
        <Animated.View style={[styles.card, animatedContentStyle]}>
          <Ionicons name="construct-outline" size={48} color="#9ca3af" style={styles.icon} />
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonText}>We're busy preparing the chapters for you.</Text>
        </Animated.View>
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

  // Card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  icon: { marginBottom: 16 },
  comingSoonTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
  },
});
