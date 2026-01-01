import { Section, Text } from "@react-email/components";
import { emailTheme } from "./Wrapper";

type OtpCodeProps = {
  otp?: string | null;
};

export default function OtpCode({ otp }: OtpCodeProps) {
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
