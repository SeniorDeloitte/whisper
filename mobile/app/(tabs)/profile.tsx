import { Ionicons } from "@expo/vector-icons";
import { Text, ScrollView, Pressable } from "react-native";
import { useAuth } from "@clerk/expo";

export default function ProfileTab() {
  const { signOut } = useAuth();
  return (
    <ScrollView
      className="bg-surface"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="items-center justify-center flex-1"
    >
      <Pressable
        onPress={() => signOut()}
        className="flex-row items-center gap-2 bg-red-500 p-2 rounded-lg"
      >
        <Ionicons name="log-out" size={24} color="white" />
        <Text className="text-white">Logout</Text>
      </Pressable>
    </ScrollView>
  );
}
