import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "npm:@react-email/components@0.0.22";
import type { ReactNode } from "npm:react@18.3.1";
import { Logo } from "./Logo.tsx";

export const emailTheme = {
  background: "#ffffff",
  foreground: "#0b0b0b",
  muted: "#6b7280",
  border: "#e5e7eb",
  primary: "#0b0b0b",
  secondary: "#f3f4f6",
} as const;

export default function Wrapper({
  children,
  previewText,
  baseUrl,
}: {
  children: ReactNode;
  previewText?: string;
  baseUrl: string;
}) {
  return (
    <Html>
      <Head />
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Tailwind>
        <Body
          className="mx-auto my-0 w-full font-sans"
          style={{
            backgroundColor: emailTheme.background,
            color: emailTheme.foreground,
          }}
        >
          <Container
            className="mx-auto my-[40px] max-w-[520px] border border-solid p-[32px]"
            style={{
              backgroundColor: emailTheme.background,
              borderColor: emailTheme.border,
            }}
          >
            <Section className="mb-[24px] text-center">
              <Logo baseUrl={baseUrl} />
            </Section>

            {children}

            <Section
              className="mt-[32px] border-t border-solid pt-[16px] text-center"
              style={{ borderColor: emailTheme.border }}
            >
              <Text
                className="m-0 text-[12px] leading-[18px]"
                style={{ color: emailTheme.muted }}
              >
                <Link
                  href="https://plop.email"
                  className="underline"
                  style={{ color: emailTheme.foreground }}
                >
                  plop.email
                </Link>
                {" | "}
                <Link
                  href="https://docs.plop.email"
                  className="underline"
                  style={{ color: emailTheme.foreground }}
                >
                  Docs
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
