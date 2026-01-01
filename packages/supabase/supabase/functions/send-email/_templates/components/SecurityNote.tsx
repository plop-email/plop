import { Text } from "npm:@react-email/components@0.0.22";
import { emailTheme } from "./Wrapper.tsx";

export default function SecurityNote({
  text = "If you did not request this email, you can ignore it.",
}: {
  text?: string;
}) {
  return (
    <Text className="m-0 text-[12px]" style={{ color: emailTheme.muted }}>
      {text}
    </Text>
  );
}
