
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/validation/auth/validation.auth";

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...payload } = data;

      const res = await fetch("https://YOUR_API/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.field) {
          setError(result.field as keyof RegisterFormValues, { message: result.message });
        } else {
          setError("email", { message: result.message || "Registration failed" });
        }
        return;
      }

      onSuccess?.();
    } catch {
      setError("email", { message: "Network error. Try again." });
    }
  };

  const fields: {
    name: keyof RegisterFormValues;
    label: string;
    placeholder: string;
    secure?: boolean;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "words";
  }[] = [
    { name: "name", label: "Name", placeholder: "Jane Doe", autoCapitalize: "words" },
    { name: "email", label: "Email", placeholder: "jane@example.com", keyboardType: "email-address", autoCapitalize: "none" },
    { name: "username", label: "Username (optional)", placeholder: "janedoe", autoCapitalize: "none" },
    { name: "phone", label: "Phone (optional)", placeholder: "+8801XXXXXXXXX", keyboardType: "phone-pad" },
    { name: "password", label: "Password", placeholder: "••••••••", secure: true },
    { name: "confirmPassword", label: "Confirm Password", placeholder: "••••••••", secure: true },
  ];

  return (
    <View className="w-full space-y-4 px-4">
      {fields.map((f) => (
        <View key={f.name}>
          <Text className="mb-1 text-sm font-medium text-gray-700">{f.label}</Text>
          <Controller
            control={control}
            name={f.name}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={f.placeholder}
                secureTextEntry={f.secure}
                keyboardType={f.keyboardType ?? "default"}
                autoCapitalize={f.autoCapitalize ?? "sentences"}
                className="w-full rounded-lg border border-gray-300 px-3 py-3"
              />
            )}
          />
          {errors[f.name] && (
            <Text className="mt-1 text-sm text-red-500">{errors[f.name]?.message as string}</Text>
          )}
        </View>
      ))}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="w-full items-center rounded-full bg-indigo-600 py-3 disabled:opacity-50"
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-medium text-white">Create account</Text>
        )}
      </Pressable>
    </View>
  );
}
