import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  withDelay,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

const useFadeInAnimation = (delay: number) => {
  const animationProgress = useSharedValue(0);
  
  useEffect(() => {
    animationProgress.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
  }, [delay]);

  return useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    transform: [{ 
      translateY: withTiming(animationProgress.value === 1 ? 0 : 20) 
    }],
  }));
};

export default function ChapterDetail() {
  const router = useRouter();
  const params = useLocalSearchParams() as {
    chapterId?: string;
    title?: string;
    lessonNumber?: string;
    subject?: string;
    className?: string;
    boardName?: string;
    textUrl?: string; 
  };

  const {
    title = "Chapter",
    lessonNumber = "?",
    subject = "Subject",
    className = "Class",
    boardName = "Board",
    textUrl = "No URL provided"
  } = params;
  
  const titleStyle = useFadeInAnimation(100);
  const pathStyle = useFadeInAnimation(200);
  const contentStyle = useFadeInAnimation(300);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: title,
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

      <ScrollView style={styles.scrollContainer}>
        <AnimatedView style={[styles.headerSection, titleStyle]}>
          <View style={styles.lessonNumberContainer}>
            <Text style={styles.lessonNumber}>{lessonNumber}</Text>
          </View>
          <Text style={styles.chapterTitle}>{title}</Text>
        </AnimatedView>

        <AnimatedView style={[styles.infoBox, pathStyle]}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Board: </Text>
            {boardName}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Class: </Text>
            {className}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Subject: </Text>
            {subject}
          </Text>
        </AnimatedView>
        
        <AnimatedView style={[styles.contentBox, contentStyle]}>
          <Text style={styles.contentTitle}>Chapter Content</Text>
          <Text style={styles.contentText}>
            The text content for this chapter will be loaded from:
          </Text>
          <Text style={[styles.contentText, styles.urlText]}>{textUrl}</Text>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf3fa',
  },
  headerBackground: { 
    flex: 1 
  },
  headerTitle: { 
    fontWeight: 'bold', 
    color: '#fff', 
    fontSize: 20 
  },
  backButton: {
    marginLeft: 16,
    marginTop: -4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    padding: 6,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  lessonNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#c7d2fe',
  },
  lessonNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4338ca',
  },
  chapterTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    flexWrap: 'wrap',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#334155',
  },
  infoText: {
    fontSize: 16,
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  contentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contentText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  urlText: {
    color: '#3b82f6',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
