import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import React from 'react';

export default function Index() {
  const { user } = useAuth();

  // If the user is authenticated, redirect to the main app screens
  if (user) {
    return <Redirect href="/MainPage" />;
  }

  // If the user is not authenticated, redirect to the authentication flow.
  // The AuthProvider handles the initial loading state, so we don't need a loading check here.
  return <Redirect href="/welcome" />;
}
