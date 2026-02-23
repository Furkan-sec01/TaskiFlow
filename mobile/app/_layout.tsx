import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* app/index.tsx */}
      <Stack.Screen name="index" />

      {/* app/login.tsx */}
      <Stack.Screen name="login" />

      {/* app/register.tsx */}
      <Stack.Screen name="register" />

      {/* app/(tabs)/_layout.tsx */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}