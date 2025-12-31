import { redirect } from "next/navigation";

export const metadata = {
  title: "Incoming emails",
};

export default async function Page() {
  redirect("/inbox");
}
