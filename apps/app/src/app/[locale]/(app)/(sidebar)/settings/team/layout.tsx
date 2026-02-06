import { ContentHeader } from "@/components/layout/content-header";
import { SecondaryMenu } from "@/components/settings/secondary-menu";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-0">
      <ContentHeader
        secondary={
          <div className="flex flex-col gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Control your team workspace, members, and billing details.
            </p>
            <SecondaryMenu
              items={[
                { title: "General", href: "/settings/team/general" },
                { title: "Members", href: "/settings/team/members" },
                { title: "API keys", href: "/settings/team/api-keys" },
                { title: "Webhooks", href: "/settings/team/webhooks" },
                { title: "Billing", href: "/settings/team/billing" },
              ]}
            />
          </div>
        }
      >
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            Team settings
          </h1>
        </div>
      </ContentHeader>
      <main className="container mx-auto px-4 py-8">{props.children}</main>
    </div>
  );
}
