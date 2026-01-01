import { Heading, Section, Text } from "@react-email/components";
import PrimaryButton from "../components/PrimaryButton";
import Wrapper from "../components/Wrapper";

export type WelcomeEmailProps = {
  baseUrl: string;
  name?: string | null;
};

export default function WelcomeEmail({ baseUrl, name }: WelcomeEmailProps) {
  return (
    <Wrapper previewText="Welcome to Plop" baseUrl={baseUrl}>
      <Heading className="m-0 text-[22px] font-semibold">
        Welcome to Plop
      </Heading>

      <Section className="mt-[16px]">
        <Text className="m-0 text-[14px] leading-[22px]">
          Hi {name || "there"},
        </Text>
        <Text className="m-0 mt-[12px] text-[14px] leading-[22px]">
          Thanks for trying Plop. You can start routing and storing inbound
          email right away from your dashboard.
        </Text>
      </Section>

      <Section className="mt-[24px] text-center">
        <PrimaryButton href={baseUrl}>Open Plop</PrimaryButton>
      </Section>
    </Wrapper>
  );
}

WelcomeEmail.subjects = {
  en: "Welcome to Plop",
};
