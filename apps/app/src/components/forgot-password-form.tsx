"use client";

import { createClient } from "@plop/supabase/client";
import { Button } from "@plop/ui/button";
import { Input } from "@plop/ui/input";
import { Label } from "@plop/ui/label";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OtpVerificationForm } from "./OtpVerificationForm";
import { getAuthErrorMessage } from "@/utils/auth-error-messages";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") {
      return "/api/auth/confirm?next=/update-password";
    }
    return `${window.location.origin}/api/auth/confirm?next=/update-password`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setError(getAuthErrorMessage(error));
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            We sent a reset link and a 6-digit code to your email.
          </p>
        </div>

        <OtpVerificationForm
          defaultEmail={email}
          verifyType="recovery"
          onSuccessPath="/update-password"
          resendKind="recovery"
          resendRedirectTo={redirectTo}
          submitLabel="Continue"
        />

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
