import { Heading, Section, Text } from "npm:@react-email/components@0.0.22";
import Divider from "./components/Divider.tsx";
import OtpCode from "./components/OtpCode.tsx";
import PrimaryButton from "./components/PrimaryButton.tsx";
import SecurityNote from "./components/SecurityNote.tsx";
import UrlCopy from "./components/UrlCopy.tsx";
import Wrapper from "./components/Wrapper.tsx";

export type ConfirmEmailProps = {
  baseUrl: string;
  url: string;
  name: string;
  otp?: string | null;
  actionLabel?: string | null;
};

export function ConfirmEmail({
  baseUrl,
  url,
  name,
  otp,
  actionLabel,
}: ConfirmEmailProps) {
  const label = actionLabel || "Confirm your email";

  return (
    <Wrapper previewText="Confirm your Plop email" baseUrl={baseUrl}>
      <Heading className="m-0 text-[22px] font-semibold">{label}</Heading>

      <Section className="mt-[16px]">
        <Text className="m-0 text-[14px] leading-[22px]">Hi {name},</Text>
        <Text className="m-0 mt-[12px] text-[14px] leading-[22px]">
          Please confirm your email address to finish setting up Plop.
        </Text>
      </Section>

      <Section className="mt-[20px]">
        <OtpCode otp={otp} />
      </Section>

      <Divider text="continue" />

      <Section className="mb-[20px] text-center">
        <PrimaryButton href={url}>{label}</PrimaryButton>
      </Section>

      <UrlCopy url={url} />
      <SecurityNote />
    </Wrapper>
  );
}

ConfirmEmail.subjects = {
  en: "Confirm your email",
};

export default ConfirmEmail;
