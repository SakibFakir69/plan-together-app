// LoginForm.tsx
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/validation/auth/validation.auth";

const LOCKOUT_SECONDS = 15 * 60;

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!lockedUntil) return;
    intervalRef.current = setInterval(() => {
      const secs = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(intervalRef.current!);
        setLockedUntil(null);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [lockedUntil]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await fetch("https://YOUR_API/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.status === 423) {
        // account locked
        setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000);
        setRemaining(LOCKOUT_SECONDS);
        return;
      }

      if (!res.ok) {
        setError("password", { message: result.message || "Invalid credentials" });
        return;
      }

      onSuccess?.();
    } catch {
      setError("email", { message: "Network error. Try again." });
    }
  };

  if (lockedUntil) {
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return (
      <View className="items-center w-full px-6 space-y-6">
        <View className="items-center justify-center w-40 h-40 border-8 border-red-100 rounded-full">
          <Text className="text-3xl font-bold text-red-600">
            {minutes}:{secs.toString().padStart(2, "0")}
          </Text>
          <Text className="text-xs font-semibold text-gray-500">MINUTES</Text>
        </View>
        <View className="items-center p-6 shadow-md rounded-3xl bg-white/70">
          <Text className="mb-1 text-lg font-semibold">Too many attempts</Text>
          <Text className="text-sm text-center text-gray-500">
            Your account has been locked for security. Please wait before trying again.
          </Text>
        </View>
        <View className="flex-row items-center justify-center w-full gap-2 py-4 bg-gray-200 rounded-full">
          <Text className="font-semibold text-gray-400">Login Disabled</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full px-4 space-y-5">
      <View>
        <Text className="mb-1 ml-1 text-xs font-semibold text-gray-500">Email Address</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="hello@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="w-full px-4 border border-gray-300 h-14 rounded-xl"
            />
          )}
        />
        {errors.email && (
          <Text className="mt-1 text-sm text-red-500">{errors.email.message}</Text>
        )}
      </View>

      <View>
        <Text className="mb-1 ml-1 text-xs font-semibold text-gray-500">Password</Text>
        <View className="relative justify-center">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="w-full px-4 pr-12 border border-gray-300 h-14 rounded-xl"
              />
            )}
          />
          <Pressable
            onPress={() => setShowPassword((s) => !s)}
            className="absolute right-4"
            hitSlop={10}
          >
            <Text className="text-xs text-indigo-600">{showPassword ? "Hide" : "Show"}</Text>
          </Pressable>
        </View>
        {errors.password && (
          <Text className="mt-1 text-sm text-red-500">{errors.password.message}</Text>
        )}
        <Pressable className="self-end mt-1">
          <Text className="text-xs font-semibold text-indigo-600">Forgot password?</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="flex-row items-center justify-center w-full gap-2 py-4 bg-indigo-600 rounded-full disabled:opacity-50"
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-semibold text-white">Sign In</Text>
        )}
      </Pressable>

      <View className="flex-row items-center gap-3 py-2">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="text-[10px] font-bold text-gray-400">OR CONTINUE WITH</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      <View className="flex-row gap-3">
        <Pressable className="flex-row items-center justify-center flex-1 h-12 gap-2 border border-gray-300 rounded-xl">
          <Text className="font-semibold">Google</Text>
        </Pressable>
        <Pressable className="flex-row items-center justify-center flex-1 h-12 gap-2 border border-gray-300 rounded-xl">
          <Text className="font-semibold">Apple</Text>
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-2">
        <Text className="text-sm text-gray-500">Don't have an account? </Text>
        <Pressable>
          <Text className="text-sm font-semibold text-indigo-600">Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}