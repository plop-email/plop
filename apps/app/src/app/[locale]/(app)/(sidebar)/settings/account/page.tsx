import { redirect } from "next/navigation";

export const metadata = {
  title: "Account settings",
};

export default function Page() {
  redirect("/settings/account/general");
}
