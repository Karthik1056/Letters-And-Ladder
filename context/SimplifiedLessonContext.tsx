import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure of a Lesson Block (Paragraph, Dialogue, Poem)
// This matches the output of your parseLesson function
type LessonBlock = {
  type: "paragraph" | "dialogue" | "poem";
  content: string;
};

interface SimplifiedLessonContextType {
  // Check if we already have data for a specific URL/Lesson ID
  isLessonCached: (key: string) => boolean;
  
  // Get the data for a specific URL
  getSimplifiedLesson: (key: string) => LessonBlock[] | undefined;
  
  // Save the data coming from the AI
  storeSimplifiedLesson: (key: string, blocks: LessonBlock[]) => void;
  
  // Optional: Clear memory if needed
  clearCache: () => void;
}

const SimplifiedLessonContext = createContext<SimplifiedLessonContextType | undefined>(undefined);

export const SimplifiedLessonProvider = ({ children }: { children: ReactNode }) => {
  // We store data like: { "https://github.com/lesson1.txt": [blocks...], "lesson2": [blocks...] }
  const [cache, setCache] = useState<Record<string, LessonBlock[]>>({});

  const storeSimplifiedLesson = (key: string, blocks: LessonBlock[]) => {
    setCache((prev) => ({
      ...prev,
      [key]: blocks,
    }));
  };

  const getSimplifiedLesson = (key: string) => {
    return cache[key];
  };

  const isLessonCached = (key: string) => {
    return !!cache[key] && cache[key].length > 0;
  };

  const clearCache = () => {
    setCache({});
  };

  return (
    <SimplifiedLessonContext.Provider value={{ isLessonCached, getSimplifiedLesson, storeSimplifiedLesson, clearCache }}>
      {children}
    </SimplifiedLessonContext.Provider>
  );
};

// Custom Hook for easy usage
export const useSimplifiedLesson = () => {
  const context = useContext(SimplifiedLessonContext);
  if (!context) {
    throw new Error('useSimplifiedLesson must be used within a SimplifiedLessonProvider');
  }
  return context;
};