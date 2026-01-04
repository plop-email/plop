"use client";

import { createClient } from "@plop/supabase/client";
import { Button } from "@plop/ui/button";
import { cn } from "@plop/ui/cn";
import { Input } from "@plop/ui/input";
import { Label } from "@plop/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import {
  type PreferredAuthMethod,
  setPreferredAuthCookie,
} from "@/utils/preferred-auth-cookie";
import { getAuthErrorMessage } from "@/utils/auth-error-messages";
import {
  parseTrialPlanCookie,
  setTrialPlanCookie,
} from "@/utils/trial-plan-cookie";
import { clearOnboardingState } from "@/utils/onboarding-storage";

type SignUpFormProps = {
  preferredAuthMethod?: PreferredAuthMethod | null;
};

export function SignUpForm({ preferredAuthMethod }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [planParam] = useQueryState("plan", parseAsString);
  const supabase = createClient();

  useEffect(() => {
    const plan = parseTrialPlanCookie(planParam);
    if (plan) {
      setTrialPlanCookie(plan);
    }
  }, [planParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/confirm`,
      },
    });

    if (error) {
      setError(getAuthErrorMessage(error));
      setIsLoading(false);
      return;
    }

    // Clear any stale onboarding state from previous sessions
    clearOnboardingState();
    setPreferredAuthCookie("password");
    router.push(`/sign-up-success?email=${encodeURIComponent(email)}`);
  };

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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 6 characters
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className={cn(
          "w-full",
          preferredAuthMethod === "password" && "justify-between",
        )}
        disabled={isLoading}
      >
        <span>{isLoading ? "Creating account..." : "Create account"}</span>
        {preferredAuthMethod === "password" && (
          <span className="text-xs text-muted-foreground">Last used</span>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
