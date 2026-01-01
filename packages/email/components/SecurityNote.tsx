import { Text } from "@react-email/components";
import { emailTheme } from "./Wrapper";

type SecurityNoteProps = {
  text?: string;
};

export default function SecurityNote({
  text = "If you did not request this email, you can ignore it.",
}: SecurityNoteProps) {
  return (
    <Text className="m-0 text-[12px]" style={{ color: emailTheme.muted }}>
      {text}
    </Text>
  );
}
