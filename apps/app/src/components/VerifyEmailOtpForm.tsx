"use client";

import { useMemo } from "react";
import { OtpVerificationForm } from "./OtpVerificationForm";

type VerifyEmailOtpFormProps = {
  defaultEmail?: string | null;
};

export function VerifyEmailOtpForm({ defaultEmail }: VerifyEmailOtpFormProps) {
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/api/auth/confirm";
    return `${window.location.origin}/api/auth/confirm`;
  }, []);

  return (
    <OtpVerificationForm
      defaultEmail={defaultEmail}
      verifyType="email"
      onSuccessPath="/"
      resendKind="signup"
      resendRedirectTo={redirectTo}
      submitLabel="Confirm email"
    />
  );
}
