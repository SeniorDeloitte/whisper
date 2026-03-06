import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";

function useAuthSocial() {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (loadingStrategy) return; 

    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({ 
        strategy,
        redirectUrl: Linking.createURL("/"),
      });
      
      if (!createdSessionId || !setActive) {
        const provider = strategy === "oauth_google" ? "Google" : "Apple";
        Alert.alert(
          "Sign-in incomplete",
          `${provider} sign-in did not complete. Please try again.`
        );
        return;
      }

      await setActive({ session: createdSessionId });
    } catch (error: any) {
      console.log("💥 Error in social auth:", error);
      if (error?.code !== 'ERR_REQUEST_CANCELED') {
        const provider = strategy === "oauth_google" ? "Google" : "Apple";
        Alert.alert("Error", `Failed to sign in with ${provider}. Please try again.`);
      }
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { handleSocialAuth, loadingStrategy };
}

export default useAuthSocial;