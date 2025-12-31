import { redirect } from "next/navigation";

export default function Page({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug ?? [];
  redirect(`/${slug.join("/")}`);
}
