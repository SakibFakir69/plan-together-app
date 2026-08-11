
// ForgotPasswordFlow.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordValues,
  resetPasswordSchema,
  ResetPasswordValues,
  getPasswordStrength,
} from "@/validation/auth/validation.auth";

type Step = "forgot" | "reset" | "success";

export default function ForgotPasswordFlow({
  // token would normally come from a deep link (e.g. yourapp://reset?token=xyz)
  resetToken,
  onGoToLogin,
}: {
  resetToken?: string;
  onGoToLogin?: () => void;
}) {
  const [step, setStep] = useState<Step>("forgot");
  const [tokenExpired, setTokenExpired] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="PlanTogether"
        onBack={step === "reset" ? () => setStep("forgot") : undefined}
      />
      <View className="flex-1 px-4 py-6">
        {step === "forgot" && (
          <ForgotStep
            sent={sent}
            onSent={() => setSent(true)}
            onDevSkip={() => setStep("reset")} // remove in production; demo parity with HTML "Move to Reset" link
          />
        )}
        {step === "reset" && (
          <ResetStep
            tokenExpired={tokenExpired}
            resetToken={resetToken}
            onExpired={() => setTokenExpired(true)}
            onRequestNewLink={() => {
              setStep("forgot");
              setSent(false);
              setTokenExpired(false);
            }}
            onSuccess={() => setStep("success")}
          />
        )}
        {step === "success" && <SuccessStep onGoToLogin={onGoToLogin} />}
      </View>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View className="flex-row items-center justify-between w-full h-16 px-4 border-b border-gray-200">
      <Pressable
        onPress={onBack}
        className="items-center justify-center w-10 h-10 rounded-full"
        disabled={!onBack}
      >
        {onBack && <Text className="text-lg text-indigo-600">‹</Text>}
      </Pressable>
      <Text className="text-lg font-bold text-indigo-600">{title}</Text>
      <View className="w-10 h-10" />
    </View>
  );
}

function ForgotStep({
  sent,
  onSent,
  onDevSkip,
}: {
  sent: boolean;
  onSent: () => void;
  onDevSkip: () => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await fetch("https://YOUR_API/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // Always show the same confirmation regardless of whether the email
      // exists, to avoid leaking which emails are registered.
      onSent();
    } catch {
      // fail silently in UI to match the same non-enumeration behavior,
      // but you may want to show a generic network-error toast here
      onSent();
    }
  };

  return (
    <View className="space-y-6">
      <View className="space-y-2">
        <Text className="text-2xl font-bold text-gray-900">Forgot Password?</Text>
        <Text className="text-base text-gray-500">
          No worries. Enter your email address and we'll send you a link to reset it.
        </Text>
      </View>

      <View className="space-y-4">
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
                editable={!sent}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className={`h-14 w-full rounded-xl border border-gray-300 px-4 ${
                  sent ? "opacity-50" : ""
                }`}
              />
            )}
          />
          {errors.email && (
            <Text className="mt-1 text-sm text-red-500">{errors.email.message}</Text>
          )}
        </View>

        {sent && (
          <View className="flex-row items-start gap-3 p-4 bg-gray-100 border border-gray-200 rounded-xl">
            <Text className="text-gray-500">ℹ️</Text>
            <Text className="flex-1 text-sm leading-snug text-gray-600">
              If that email exists, we sent a link to reset your password. Please check your
              inbox.
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || sent}
          className={`w-full flex-row items-center justify-center gap-2 rounded-full py-4 ${
            sent ? "bg-emerald-600" : "bg-indigo-600"
          } disabled:opacity-70`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-semibold text-white">{sent ? "Sent!" : "Send Link"}</Text>
          )}
        </Pressable>

        {__DEV__ && (
          <Pressable onPress={onDevSkip} className="items-center pt-6">
            <Text className="text-sm text-indigo-600">Demo: Move to Reset Screen</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ResetStep({
  tokenExpired,
  resetToken,
  onExpired,
  onRequestNewLink,
  onSuccess,
}: {
  tokenExpired: boolean;
  resetToken?: string;
  onExpired: () => void;
  onRequestNewLink: () => void;
  onSuccess: () => void;
}) {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const newPassword = watch("newPassword") || "";
  const strength = getPasswordStrength(newPassword);
  const strengthColor =
    strength.label === "Strong"
      ? "bg-emerald-500"
      : strength.label === "Fair"
      ? "bg-amber-500"
      : "bg-red-500";

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      const res = await fetch("https://YOUR_API/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: data.newPassword }),
      });

      if (res.status === 400 || res.status === 410) {
        onExpired();
        return;
      }
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setError("confirmPassword", { message: result.message || "Something went wrong" });
        return;
      }

      onSuccess();
    } catch {
      setError("confirmPassword", { message: "Network error. Try again." });
    }
  };

  return (
    <View className="space-y-6">
      <View className="space-y-2">
        <Text className="text-2xl font-bold text-gray-900">Reset Password</Text>
        <Text className="text-base text-gray-500">
          Almost there. Choose a strong new password for your account.
        </Text>
      </View>

      {tokenExpired && (
        <View className="flex-row items-center gap-3 p-4 border border-red-200 rounded-xl bg-red-50">
          <Text className="text-red-600">⚠️</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-red-700">Token Expired</Text>
            <Text className="text-sm text-red-600 opacity-80">
              This reset link is no longer valid. Please request a new one.
            </Text>
          </View>
        </View>
      )}

      <View className="space-y-4">
        <View>
          <Text className="mb-1 ml-1 text-xs font-semibold text-gray-500">New Password</Text>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!tokenExpired}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                className="w-full px-4 border border-gray-300 h-14 rounded-xl"
              />
            )}
          />
          {errors.newPassword && (
            <Text className="mt-1 text-sm text-red-500">{errors.newPassword.message}</Text>
          )}
        </View>

        <View>
          <Text className="mb-1 ml-1 text-xs font-semibold text-gray-500">
            Confirm New Password
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!tokenExpired}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                className="w-full px-4 border border-gray-300 h-14 rounded-xl"
              />
            )}
          />
          {errors.confirmPassword && (
            <Text className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</Text>
          )}
        </View>

        {!!newPassword && (
          <View className="flex-row items-center gap-2 p-3 bg-gray-100 rounded-lg">
            <View className="flex-1 h-1 overflow-hidden bg-gray-300 rounded-full">
              <View
                className={`h-full ${strengthColor}`}
                style={{ width: `${strength.score * 100}%` }}
              />
            </View>
            <Text className="text-xs font-semibold text-gray-600">{strength.label}</Text>
          </View>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || tokenExpired}
          className="flex-row items-center justify-center w-full gap-2 py-4 mt-2 bg-indigo-600 rounded-full disabled:opacity-50"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-semibold text-white">Save Password</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={onRequestNewLink} className="items-center pt-4">
        <Text className="text-sm text-gray-500">Request new link</Text>
      </Pressable>
    </View>
  );
}

function SuccessStep({ onGoToLogin }: { onGoToLogin?: () => void }) {
  return (
    <View className="items-center justify-center flex-1 gap-6 py-16">
      <View className="items-center justify-center w-24 h-24 rounded-full bg-emerald-100">
        <Text className="text-4xl">✅</Text>
      </View>
      <View className="items-center gap-2 px-8">
        <Text className="text-xl font-bold text-gray-900">Password Updated</Text>
        <Text className="text-base text-center text-gray-500">
          Your password has been reset successfully. You can now log in to your account.
        </Text>
      </View>
      <Pressable
        onPress={onGoToLogin}
        className="w-full max-w-[240px] items-center rounded-full bg-indigo-600 py-4"
      >
        <Text className="font-semibold text-white">Go to Login</Text>
      </Pressable>
    </View>
  );
}