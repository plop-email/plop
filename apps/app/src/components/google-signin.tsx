"use client";

import { createClient } from "@plop/supabase/client";
import { Button } from "@plop/ui/button";
import { cn } from "@plop/ui/cn";
import { clearOnboardingState } from "@/utils/onboarding-storage";

type GoogleSigninProps = {
  label?: string;
  showLastUsed?: boolean;
  className?: string;
  next?: string;
  isSignup?: boolean;
};

export function GoogleSignin({
  label = "Continue with Google",
  showLastUsed = false,
  className,
  next,
  isSignup = false,
}: GoogleSigninProps) {
  const supabase = createClient();

  const handleSignin = () => {
    // Only clear onboarding state for new signups, not returning user logins
    if (isSignup) {
      clearOnboardingState();
    }

    const redirectTo = new URL("/api/auth/callback", window.location.origin);
    redirectTo.searchParams.set("provider", "google");
    if (next) {
      redirectTo.searchParams.set("next", next);
    }

    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <Button
      onClick={handleSignin}
      type="button"
      variant="outline"
      className={cn(
        "w-full font-mono",
        showLastUsed ? "justify-between" : "justify-center",
        className,
      )}
    >
      <span>{label}</span>
      {showLastUsed && (
        <span className="text-xs text-muted-foreground">Last used</span>
      )}
    </Button>
  );
}
