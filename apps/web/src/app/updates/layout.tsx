import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#0B0D0F] text-white">
      <Header />
      {children}
      <Footer />
    </main>
  );
}
