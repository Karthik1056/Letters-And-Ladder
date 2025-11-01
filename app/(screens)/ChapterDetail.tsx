import React, { useEffect } from 'react';
// 1. Removed React Native imports (View, Text, StyleSheet, etc.)
// 2. Removed all Expo-specific imports (expo-router, expo-linear-gradient, @expo/vector-icons)
// 3. Removed react-native-reanimated
// These imports are for React Native and will not work in a web/esbuild environment.

// 4. Mocked components and hooks with web-equivalents (div, span, basic state)

// Mock hook for simple fade-in animation (using basic React state, not reanimated)
const useFadeInAnimation = (delay: number) => {
  const [style, setStyle] = React.useState({ opacity: 0, transform: 'translateY(10px)' });
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set CSS properties for transition
      setStyle({ opacity: 1, transform: 'translateY(0px)' });
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  // Return the style and the transition rule to be applied
  return [style, { transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' }];
};

// Mock useRouter
const useRouter = () => ({
  back: () => window.history.back(),
});

// Mock useLocalSearchParams
const useLocalSearchParams = () => {
  // In a real web app, you'd parse URL params.
  // Returning mock data as a fallback since params aren't available.
  try {
    // A simple way to get URL search params
    const params = new URLSearchParams(window.location.search);
    const mockParams = {
      title: params.get('title') || "Chapter",
      lessonNumber: params.get('lessonNumber') || "?",
      subject: params.get('subject') || "Subject",
      className: params.get('className') || "Class",
      boardName: params.get('boardName') || "Board",
      textUrl: params.get('textUrl') || "No URL provided"
    };
    // Check if any params were actually found
    if (params.get('title')) {
      return mockParams;
    }
    // Fallback to default mock if no params
    return {
      title: "Chapter",
      lessonNumber: "?",
      subject: "Subject",
      className: "Class",
      boardName: "Board",
      textUrl: "No URL provided"
    };
  } catch (e) {
    // Fallback for non-browser environments
    return {
      title: "Chapter",
      lessonNumber: "?",
      subject: "Subject",
      className: "Class",
      boardName: "Board",
      textUrl: "No URL provided"
    };
  }
};

// Mock Stack.Screen - it doesn't do anything in this context
const Stack = { Screen: (props: any) => null };
// Mock LinearGradient
const LinearGradient = (props: any) => <div style={{...props.style, ...styles.headerBackground, background: 'linear-gradient(to right, #3b82f6, #60a5fa)'}}>{props.children}</div>;
// Mock Ionicons
const Ionicons = (props: { name: string, size: number, color: string }) => <span style={{fontSize: props.size, color: props.color}}>{props.name === 'arrow-back' ? '←' : '?'}</span>;

export default function ChapterDetail() {
  const router = useRouter();
  
  // 1. Get all parameters passed from the previous screen
  const params = useLocalSearchParams() as {
    chapterId?: string;
    title?: string;
    lessonNumber?: string;
    subject?: string;
    className?: string;
    boardName?: string;
    textUrl?: string; 
  };

  // 2. Destructure parameters with fallbacks
  const {
    title = "Chapter",
    lessonNumber = "?",
    subject = "Subject",
    className = "Class",
    boardName = "Board",
    textUrl = "No URL provided"
  } = params;
  
  // 3. Apply animations to the content
  const [titleStyle, titleTransition] = useFadeInAnimation(100);
  const [pathStyle, pathTransition] = useFadeInAnimation(200);
  const [contentStyle, contentTransition] = useFadeInAnimation(300);

  // 4. Replaced React Native components with HTML (div, span, button, etc.)
  return (
    <div style={styles.container}>
      {/* 4. Setup the header with the chapter title and back button */}
      <Stack.Screen
        options={{
          headerTitle: title, // Use the chapter title in the header
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#fff',
          headerBackground: () => <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />,
          headerLeft: () => (
            <button onClick={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </button>
          ),
        }}
      />

      {/* Replaced ScrollView with a div */}
      <div style={styles.scrollContainer}>
        {/* Header Section */}
        <div style={{...styles.headerSection, ...titleStyle, ...titleTransition}}>
          <div style={styles.lessonNumberContainer}>
            <span style={styles.lessonNumber}>{lessonNumber}</span>
          </div>
          <span style={styles.chapterTitle}>{title}</span>
        </div>

        {/* Path/Info Section */}
        <div style={{...styles.infoBox, ...pathStyle, ...pathTransition}}>
          <span style={styles.infoText}><span style={styles.infoLabel}>Board:</span> {boardName}</span>
          <div style={styles.divider} />
          <span style={styles.infoText}><span style={styles.infoLabel}>Class:</span> {className}</span>
          <div style={styles.divider} />
          <span style={styles.infoText}><span style={styles.infoLabel}>Subject:</span> {subject}</span>
        </div>
        
        {/* Content Section (Displaying textUrl for now) */}
        <div style={{...styles.contentBox, ...contentStyle, ...contentTransition}}>
          <span style={styles.contentTitle}>Chapter Content</span>
          <p style={styles.contentText}>
            The text content for this chapter will be loaded from:
          </p>
          <span style={{...styles.contentText, ...styles.urlText}}>{textUrl}</span>
          {/* TODO: In the future, you will replace the text above 
            with a function that fetches and displays the content from textUrl
          */}
        </div>

      </div>
    </div>
  );
}

// 5. Converted StyleSheet to a plain JavaScript object for inline styles
// Note: 'flex: 1' doesn't work the same in web as RN. Added 'height: "100vh"'
// 'elevation' is not a web property, 'boxShadow' is used.
const styles: { [key: string]: React.CSSProperties } = {
  container: { 
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: '#eaf3fa', // Light blue background
  },
  headerBackground: { flex: 1 },
  headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
  backButton: {
    marginLeft: 16,
    marginTop: -4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    padding: 6,
    border: 'none',
    cursor: 'pointer'
  },
  scrollContainer: {
    padding: '24px 20px 40px 20px',
    overflowY: 'auto',
    flex: 1, // Make scroll area take remaining height
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  lessonNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    marginRight: 16,
    border: '2px solid #c7d2fe',
    flexShrink: 0,
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
    flex: 1, // Allow text to wrap
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#334155',
  },
  infoText: {
    fontSize: 16,
    color: '#475569',
    display: 'block',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    margin: '10px 0',
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
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 8,
    display: 'block',
  },
  contentText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: '1.5',
    display: 'block',
  },
  urlText: {
    color: '#3b82f6',
    marginTop: 8,
    fontStyle: 'italic',
    display: 'block',
    wordBreak: 'break-all',
  }
};

