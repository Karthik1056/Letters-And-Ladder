import { Stack } from 'expo-router';
import React from 'react';

export default function ScreensLayout() {
  return (
    <Stack>
      <Stack.Screen name="MainPage" options={{ headerShown: true }} />
      <Stack.Screen name="SelectionPage" options={{ headerShown: true }} />
      <Stack.Screen name="ChapterList" options={{ headerShown: true }} />
      <Stack.Screen name="profile" options={{ headerShown: true }} />
      <Stack.Screen name="ChapterDetail" options={{ headerShown: true }} />
      

    </Stack>
  );
}
