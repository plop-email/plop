import { ContentHeader } from "@/components/layout/content-header";
import { SecondaryMenu } from "@/components/settings/secondary-menu";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-0">
      <ContentHeader
        secondary={
          <div className="flex flex-col gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Manage your profile, security, and notification preferences.
            </p>
            <SecondaryMenu
              items={[
                { title: "General", href: "/settings/account/general" },
                { title: "Security", href: "/settings/account/security" },
                {
                  title: "Notifications",
                  href: "/settings/account/notifications",
                },
              ]}
            />
          </div>
        }
      >
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            Account settings
          </h1>
        </div>
      </ContentHeader>
      <main className="container mx-auto px-4 py-8">{props.children}</main>
    </div>
  );
}
