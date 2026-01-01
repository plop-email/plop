import Image from "next/image";
import Link from "next/link";
import { VerifyEmailOtpForm } from "@/components/VerifyEmailOtpForm";

export const metadata = {
  title: "Verify your email",
};

type SearchParams = {
  email?: string;
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const defaultEmail =
    typeof resolvedSearchParams?.email === "string"
      ? resolvedSearchParams.email
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center">
          <Image src="/logo.png" alt="plop" width={120} height={120} priority />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link and a 6-digit code. Use whichever is
            easiest to finish creating your account.
          </p>
        </div>

        <VerifyEmailOtpForm defaultEmail={defaultEmail} />

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
