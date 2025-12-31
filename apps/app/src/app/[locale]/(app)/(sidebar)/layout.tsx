import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SidebarInset, SidebarProvider } from "@plop/ui/sidebar";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { TrialLockModal } from "@/components/billing/trial-lock-modal";

export default async function Layout(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  try {
    const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());
    if (!user) redirect("/login");

    const membership = await queryClient.fetchQuery(
      trpc.team.membership.queryOptions(),
    );
    if (!membership) redirect("/teams/create");

    return (
      <HydrateClient>
        <SidebarProvider
          open={false}
          keyboardShortcut={null}
          className="h-svh overflow-hidden"
        >
          <AppSidebar />
          <SidebarInset className="h-svh min-h-0">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
              <div className="flex-1">{props.children}</div>
              <Footer />
            </div>
            <MobileBottomNav />
          </SidebarInset>
          <OnboardingModal />
          <TrialLockModal />
        </SidebarProvider>
      </HydrateClient>
    );
  } catch {
    redirect("/login");
  }
}
