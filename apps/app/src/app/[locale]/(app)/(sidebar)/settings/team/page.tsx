import { redirect } from "next/navigation";

export const metadata = {
  title: "Team settings",
};

export default function Page() {
  redirect("/settings/team/general");
}
