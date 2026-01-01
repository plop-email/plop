"use client";

import { createClient } from "@plop/supabase/client";
import { Button } from "@plop/ui/button";
import { Input } from "@plop/ui/input";
import { Label } from "@plop/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAuthErrorMessage } from "@/utils/auth-error-messages";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type VerifyType = "email" | "recovery";

type ResendKind = "signup" | "recovery";

type OtpVerificationFormProps = {
  defaultEmail?: string | null;
  verifyType: VerifyType;
  onSuccessPath: string;
  resendKind: ResendKind;
  resendRedirectTo: string;
  submitLabel?: string;
};

function normalizeOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export function OtpVerificationForm({
  defaultEmail,
  verifyType,
  onSuccessPath,
  resendKind,
  resendRedirectTo,
  submitLabel = "Verify code",
}: OtpVerificationFormProps) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const normalizedOtp = useMemo(() => normalizeOtp(otp), [otp]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!email) {
      setError("Enter the email you used to sign up.");
      return;
    }

    if (normalizedOtp.length < OTP_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setIsVerifying(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: normalizedOtp,
      type: verifyType,
    });

    if (error) {
      setError(getAuthErrorMessage(error));
      setIsVerifying(false);
      return;
    }

    router.push(onSuccessPath);
    router.refresh();
  };

  const handleResend = async () => {
    setError(null);
    setStatus(null);

    if (!email) {
      setError("Enter the email you used to sign up.");
      return;
    }

    setIsResending(true);

    if (resendKind === "signup") {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: resendRedirectTo,
        },
      });

      if (error) {
        setError(getAuthErrorMessage(error));
        setIsResending(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resendRedirectTo,
      });

      if (error) {
        setError(getAuthErrorMessage(error));
        setIsResending(false);
        return;
      }
    }

    setStatus("We sent a fresh code to your email.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setIsResending(false);
  };

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp-email">Email</Label>
        <Input
          id="otp-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp-code">Verification code</Label>
        <Input
          id="otp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={normalizedOtp}
          onChange={(e) => setOtp(normalizeOtp(e.target.value))}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (!text) return;
            e.preventDefault();
            setOtp(normalizeOtp(text));
          }}
          className="text-center tracking-[0.4em] text-lg"
          required
        />
        <p className="text-xs text-muted-foreground">
          Paste the 6-digit code from your email or use the link instead.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying ? "Verifying..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : isResending
              ? "Resending..."
              : "Resend code"}
        </Button>
      </div>
    </form>
  );
}
