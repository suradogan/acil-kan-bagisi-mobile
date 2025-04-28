import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Doğrudan ana sayfaya yönlendir
  return <Redirect href="/(tabs)/home" />;
}
