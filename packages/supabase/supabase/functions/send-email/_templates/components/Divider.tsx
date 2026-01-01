import { Hr, Text } from "npm:@react-email/components@0.0.22";
import { emailTheme } from "./Wrapper.tsx";

export default function Divider({ text = "or" }: { text?: string }) {
  return (
    <div className="my-[24px]">
      <Hr style={{ borderColor: emailTheme.border }} />
      <Text
        className="m-0 pt-[8px] text-center text-[12px] uppercase tracking-[2px]"
        style={{ color: emailTheme.muted }}
      >
        {text}
      </Text>
    </div>
  );
}
