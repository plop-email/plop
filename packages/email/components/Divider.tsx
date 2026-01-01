import { Hr, Text } from "@react-email/components";
import { emailTheme } from "./Wrapper";

type DividerProps = {
  text?: string;
};

export default function Divider({ text = "or" }: DividerProps) {
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
