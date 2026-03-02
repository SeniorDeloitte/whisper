import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-2xl font-bold text-center">
        Edit app/index.tsx to edit this screen.
      </Text>
      <Text className="text-lg font-bold text-center mt-4 text-red-500">
        Open up app/index.tsx to start working on your app!
      </Text>
    </View>
  );
}
