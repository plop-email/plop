import { Link, Section, Text } from "@react-email/components";
import { emailTheme } from "./Wrapper";

type UrlCopyProps = {
  url: string;
};

export default function UrlCopy({ url }: UrlCopyProps) {
  return (
    <Section
      className="mb-[20px] px-[16px] py-[12px]"
      style={{ backgroundColor: emailTheme.secondary }}
    >
      <Text className="m-0 text-[12px]" style={{ color: emailTheme.muted }}>
        Copy and paste this URL into your browser:
      </Text>
      <Link
        href={url}
        className="text-[12px] break-all underline"
        style={{ color: emailTheme.foreground }}
      >
        {url}
      </Link>
    </Section>
  );
}
