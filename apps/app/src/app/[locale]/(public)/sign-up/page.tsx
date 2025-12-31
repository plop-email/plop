import { createClient } from "@plop/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { GoogleSignin } from "@/components/google-signin";
import { SignUpForm } from "@/components/sign-up-form";
import {
  PREFERRED_AUTH_COOKIE_NAME,
  parsePreferredAuthCookie,
} from "@/utils/preferred-auth-cookie";

export const metadata = {
  title: "Sign Up",
};

export default async function Page() {
  // Redirect to home if already authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const preferred = parsePreferredAuthCookie(
    cookieStore.get(PREFERRED_AUTH_COOKIE_NAME)?.value,
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center">
          <Image src="/logo.png" alt="plop" width={120} height={120} priority />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to get started.
          </p>
        </div>

        <SignUpForm preferredAuthMethod={preferred} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignin
          label="Sign up with Google"
          showLastUsed={preferred === "google"}
        />
      </div>
    </div>
  );
}
