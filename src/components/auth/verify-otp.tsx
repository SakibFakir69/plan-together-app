

// VerifyOtpScreen.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { verifyOtpSchema } from "@/validation/auth/validation.auth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

type Props = {
  email: string; // or phone — shown as "Sent to xxx"
  onVerified?: () => void;
  onBack?: () => void;
};

export default function VerifyOtpScreen({ email, onVerified, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const code = digits.join("");

  const submit = useCallback(
    async (finalCode: string) => {
      const parsed = verifyOtpSchema.safeParse({ otp: finalCode });
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }
      setError(null);
      setIsSubmitting(true);
      Keyboard.dismiss();
      try {
        const res = await fetch("https://YOUR_API/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: finalCode }),
        });
        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(result.message || "Invalid or expired code");
          setDigits(Array(OTP_LENGTH).fill(""));
          inputs.current[0]?.focus();
          return;
        }

        onVerified?.();
      } catch {
        setError("Network error. Try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, onVerified]
  );

  const handleChange = (text: string, index: number) => {
    // handle paste of full code into one box
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const next = Array(OTP_LENGTH).fill("");
      pasted.forEach((d, i) => (next[i] = d));
      setDigits(next);
      setError(null);
      if (pasted.length === OTP_LENGTH) {
        submit(pasted.join(""));
      } else {
        inputs.current[pasted.length]?.focus();
      }
      return;
    }

    const clean = text.replace(/\D/g, "");
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError(null);

    if (clean && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    const joined = next.join("");
    if (joined.length === OTP_LENGTH) {
      submit(joined);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      await fetch("https://YOUR_API/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDigits(Array(OTP_LENGTH).fill(""));
      setError(null);
      setResendCooldown(RESEND_SECONDS);
      inputs.current[0]?.focus();
    } catch {
      setError("Couldn't resend code. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between w-full h-16 px-4 border-b border-gray-200">
        <Pressable onPress={onBack} className="items-center justify-center w-10 h-10 rounded-full">
          <Text className="text-lg text-indigo-600">‹</Text>
        </Pressable>
        <Text className="text-lg font-bold text-indigo-600">PlanTogether</Text>
        <View className="w-10 h-10" />
      </View>

      <View className="flex-1 px-4 py-6">
        <View className="space-y-2">
          <Text className="text-2xl font-bold text-gray-900">Verify your email</Text>
          <Text className="text-base text-gray-500">
            Enter the 6-digit code we sent to{" "}
            <Text className="font-semibold text-gray-700">{email}</Text>
          </Text>
        </View>

        <View className="flex-row justify-between gap-2 mt-8">
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => (inputs.current[i] = r)}
              value={d}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={i === 0 ? OTP_LENGTH : 1} // allow paste-into-first-box
              textAlign="center"
              className={`h-14 w-12 rounded-xl border text-xl font-bold ${
                error
                  ? "border-red-400 bg-red-50"
                  : d
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300"
              }`}
              editable={!isSubmitting}
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && (
          <Text className="mt-3 text-sm text-center text-red-500">{error}</Text>
        )}

        <Pressable
          onPress={() => submit(code)}
          disabled={isSubmitting || code.length !== OTP_LENGTH}
          className="flex-row items-center justify-center w-full gap-2 py-4 mt-8 bg-indigo-600 rounded-full disabled:opacity-50"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-semibold text-white">Verify</Text>
          )}
        </Pressable>

        <View className="flex-row items-center justify-center gap-1 mt-6">
          <Text className="text-sm text-gray-500">Didn't get the code?</Text>
          <Pressable onPress={handleResend} disabled={resendCooldown > 0 || resending}>
            <Text
              className={`text-sm font-semibold ${
                resendCooldown > 0 ? "text-gray-400" : "text-indigo-600"
              }`}
            >
              {resending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}