import { Heading, Section, Text } from "npm:@react-email/components@0.0.22";
import Divider from "./components/Divider.tsx";
import OtpCode from "./components/OtpCode.tsx";
import PrimaryButton from "./components/PrimaryButton.tsx";
import SecurityNote from "./components/SecurityNote.tsx";
import UrlCopy from "./components/UrlCopy.tsx";
import Wrapper from "./components/Wrapper.tsx";

export type ResetPasswordEmailProps = {
  baseUrl: string;
  url: string;
  name: string;
  otp?: string | null;
};

export function ResetPasswordEmail({
  baseUrl,
  url,
  name,
  otp,
}: ResetPasswordEmailProps) {
  return (
    <Wrapper
      previewText={
        otp ? `Your Plop password reset code: ${otp}` : "Reset your password"
      }
      baseUrl={baseUrl}
    >
      <Heading className="m-0 text-[22px] font-semibold">
        Reset your password
      </Heading>

      <Section className="mt-[16px]">
        <Text className="m-0 text-[14px] leading-[22px]">Hi {name},</Text>
        <Text className="m-0 mt-[12px] text-[14px] leading-[22px]">
          Use the code below or the button to reset your Plop password.
        </Text>
      </Section>

      <Section className="mt-[20px]">
        <OtpCode otp={otp} />
      </Section>

      <Divider />

      <Section className="mb-[20px] text-center">
        <PrimaryButton href={url}>Reset password</PrimaryButton>
      </Section>

      <UrlCopy url={url} />
      <SecurityNote />
    </Wrapper>
  );
}

ResetPasswordEmail.subjects = {
  en: "Reset your Plop password",
};

export default ResetPasswordEmail;
