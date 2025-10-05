import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface FloatingShapeProps {
  style?: object;
  color: string;
  duration?: number;
  delay?: number;
}

const FloatingShape: React.FC<FloatingShapeProps> = ({
  style,
  color,
  duration = 10000,
  delay = 0,
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
  }, [delay, duration, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]} />
  );
};

interface AuthBackgroundProps {
  children: React.ReactNode;
  withContentContainer?: boolean;
  contentHeight?: string;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({
  children,
  withContentContainer = true,
  contentHeight,
}) => {
  const backgroundProgress = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const finalContentHeight = contentHeight || '80%';
  const appNameContainerHeight = `${100 - parseInt(finalContentHeight, 10)}%`;

  useEffect(() => {
    backgroundProgress.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      true
    );
  }, [backgroundProgress]);

  const animatedGradientProps = useAnimatedProps(() => ({
    colors: [
      interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']),
      interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']),
    ],
  }));

  return (
    <View style={styles.container}>
      <AnimatedLinearGradient
        style={StyleSheet.absoluteFill}
        animatedProps={animatedGradientProps as any}
        colors={['#eaf3fa', '#d9e8f5']}
      />

      {withContentContainer && (
        <View style={[styles.appNameContainer, { top: insets.top, height: appNameContainerHeight }]}>
          <Text style={styles.appName}>Letters & Ladders</Text>
        </View>
      )}

      {/* Floating shapes */}
      <FloatingShape style={styles.shape1} color="rgba(147, 197, 253, 0.3)" duration={12000} />
      <FloatingShape style={styles.shape2} color="rgba(165, 214, 255, 0.3)" duration={10000} delay={1000} />
      <FloatingShape style={styles.shape3} color="rgba(191, 219, 254, 0.3)" duration={14000} delay={500} />

      {withContentContainer ? (
        <View style={[styles.contentContainer, { height: finalContentHeight }]}>{children}</View>
      ) : (
        children
      )}
    </View>
  );
};

export default AuthBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  appNameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    opacity: 0.9,
  },
  shapeBase: {
    position: 'absolute',
    borderRadius: 9999,
  },
  shape1: { width: 220, height: 220, top: '5%', left: -80 },
  shape2: { width: 160, height: 160, bottom: '15%', right: -70 },
  shape3: { width: 110, height: 110, bottom: '2%', left: 30 },
});
