import React, { useEffect, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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

const AnimatedBackground = ({ children }: { children: ReactNode }) => {
  const backgroundProgress = useSharedValue(0);

  useEffect(() => {
    backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const animatedGradientProps = useAnimatedProps(() => {
    const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
    const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
    return { colors: [color1, color2] as [string, string] };
  });

  return (
    <View style={styles.container}>
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
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shapeBase: {
    position: 'absolute',
    borderRadius: 9999,
  },
  shape1: {
    width: 200,
    height: 200,
    top: '15%',
    left: -80,
  },
  shape2: {
    width: 150,
    height: 150,
    bottom: '10%',
    right: -60,
  },
  shape3: {
    width: 100,
    height: 100,
    top: '50%',
    left: 20,
  },
});

export default AnimatedBackground;
