import Image from "next/image";
import { GoogleSignin } from "@/components/google-signin";
import { LoginForm } from "@/components/login-form";
import {
  PREFERRED_AUTH_COOKIE_NAME,
  parsePreferredAuthCookie,
} from "@/utils/preferred-auth-cookie";
import { cookies } from "next/headers";

export const metadata = {
  title: "Login",
};

export default async function Page() {
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
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your dashboard.
          </p>
        </div>

        <LoginForm preferredAuthMethod={preferred} />

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

        <div className="flex justify-center">
          <GoogleSignin
            label="Sign in with Google"
            showLastUsed={preferred === "google"}
          />
        </div>
      </div>
    </div>
  );
}
