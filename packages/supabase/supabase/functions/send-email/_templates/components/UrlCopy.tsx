import { Link, Section, Text } from "npm:@react-email/components@0.0.22";
import { emailTheme } from "./Wrapper.tsx";

export default function UrlCopy({ url }: { url: string }) {
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
