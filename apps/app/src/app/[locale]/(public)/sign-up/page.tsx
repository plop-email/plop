import Image from "next/image";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata = {
  title: "Sign Up",
};

export default function Page() {
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

        <SignUpForm />
      </div>
    </div>
  );
}
