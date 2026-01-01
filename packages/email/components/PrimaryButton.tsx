import { Button } from "@react-email/components";
import type { ReactNode } from "react";
import { emailTheme } from "./Wrapper";

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
};

export default function PrimaryButton({ href, children }: PrimaryButtonProps) {
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
