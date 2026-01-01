import { Button } from "npm:@react-email/components@0.0.22";
import type { ReactNode } from "npm:react@18.3.1";
import { emailTheme } from "./Wrapper.tsx";

export default function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button
      href={href}
      className="inline-block px-[24px] py-[12px] text-[14px] no-underline"
      style={{
        backgroundColor: emailTheme.primary,
        color: "#ffffff",
        fontWeight: 500,
      }}
    >
      {children}
    </Button>
  );
}
