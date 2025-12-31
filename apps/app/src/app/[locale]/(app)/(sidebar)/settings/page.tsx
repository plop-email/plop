import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
};

export default async function Page() {
  redirect("/settings/team/general");
}
