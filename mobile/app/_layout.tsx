import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0D0D0F" },
            }}
          >
            <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
