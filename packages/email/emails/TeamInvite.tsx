import { Heading, Section, Text } from "@react-email/components";
import PrimaryButton from "../components/PrimaryButton";
import SecurityNote from "../components/SecurityNote";
import UrlCopy from "../components/UrlCopy";
import Wrapper from "../components/Wrapper";

export type TeamInviteEmailProps = {
  baseUrl: string;
  url: string;
  teamName: string;
  invitedByName?: string | null;
  email?: string | null;
};

export default function TeamInviteEmail({
  baseUrl,
  url,
  teamName,
  invitedByName,
  email,
}: TeamInviteEmailProps) {
  return (
    <Wrapper previewText={`Join ${teamName} on Plop`} baseUrl={baseUrl}>
      <Heading className="m-0 text-[22px] font-semibold">
        You are invited to join {teamName}
      </Heading>

      <Section className="mt-[16px]">
        <Text className="m-0 text-[14px] leading-[22px]">
          {invitedByName
            ? `${invitedByName} invited you to join the ${teamName} team on Plop.`
            : `You have been invited to join the ${teamName} team on Plop.`}
        </Text>
        <Text className="m-0 mt-[12px] text-[14px] leading-[22px]">
          Sign in with {email || "your invited email"} to accept the invite.
        </Text>
      </Section>

      <Section className="mt-[24px] text-center">
        <PrimaryButton href={url}>Join the team</PrimaryButton>
      </Section>

      <UrlCopy url={url} />
      <SecurityNote text="If you were not expecting this invite, you can ignore it." />
    </Wrapper>
  );
}

TeamInviteEmail.subjects = {
  en: "You have been invited to join a team",
};
