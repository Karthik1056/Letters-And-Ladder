import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{}} />
      <Stack.Screen name="sign-in" options={{}} />
      <Stack.Screen name="sign-up" options={{}} />
    </Stack>
  );
}