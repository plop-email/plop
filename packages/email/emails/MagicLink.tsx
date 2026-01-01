import { Heading, Section, Text } from "@react-email/components";
import Divider from "../components/Divider";
import OtpCode from "../components/OtpCode";
import PrimaryButton from "../components/PrimaryButton";
import SecurityNote from "../components/SecurityNote";
import UrlCopy from "../components/UrlCopy";
import Wrapper from "../components/Wrapper";

export type MagicLinkEmailProps = {
  baseUrl: string;
  url: string;
  name: string;
  otp?: string | null;
};

export default function MagicLinkEmail({
  baseUrl,
  url,
  name,
  otp,
}: MagicLinkEmailProps) {
  return (
    <Wrapper
      previewText={otp ? `Your Plop login code: ${otp}` : "Sign in to Plop"}
      baseUrl={baseUrl}
    >
      <Heading className="m-0 text-[22px] font-semibold">Sign in</Heading>

      <Section className="mt-[16px]">
        <Text className="m-0 text-[14px] leading-[22px]">Hi {name},</Text>
        <Text className="m-0 mt-[12px] text-[14px] leading-[22px]">
          Use the code below or the button to continue signing in to Plop.
        </Text>
      </Section>

      <Section className="mt-[20px]">
        <OtpCode otp={otp} />
      </Section>

      <Divider />

      <Section className="mb-[20px] text-center">
        <PrimaryButton href={url}>Continue to Plop</PrimaryButton>
      </Section>

      <UrlCopy url={url} />
      <SecurityNote />
    </Wrapper>
  );
}

MagicLinkEmail.subjects = {
  en: "Sign in to Plop",
};
