
import { View, Text,  Pressable} from "react-native";
import { Link, Stack, router } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <View className="items-center justify-center w-24 h-24 rounded-full bg-indigo-50">
          <Text className="text-4xl">🧭</Text>
        </View>

        <Text className="mt-6 text-2xl font-bold text-gray-900">Page not found</Text>
        <Text className="mt-2 text-base text-center text-gray-500">
          The screen you're looking for doesn't exist or may have been moved.
        </Text>

        <Pressable
          onPress={() => router.replace("/")}
          className="mt-8 w-full max-w-[240px] items-center rounded-full bg-indigo-600 py-4"
        >
          <Text className="font-semibold text-white">Go to Home</Text>
        </Pressable>

      
      </View>
    </>
  );
}