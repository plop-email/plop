import { Section, Text } from "npm:@react-email/components@0.0.22";
import { emailTheme } from "./Wrapper.tsx";

export default function OtpCode({ otp }: { otp?: string | null }) {
  if (!otp) return null;

  return (
    <Section
      className="mb-[24px] px-[16px] py-[12px] text-center"
      style={{ backgroundColor: emailTheme.secondary }}
    >
      <Text
        className="m-0 text-[12px] uppercase tracking-[2px]"
        style={{ color: emailTheme.muted }}
      >
        One-time code
      </Text>
      <Text
        className="m-0 text-[28px] font-semibold tracking-[6px]"
        style={{ color: emailTheme.foreground }}
      >
        {otp}
      </Text>
    </Section>
  );
}
