import { BarChart3, Inbox, Mail, Settings } from "lucide-react";

export const navItems = [
  {
    title: "Incoming emails",
    shortTitle: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  { title: "Metrics", url: "/metrics", icon: BarChart3 },
  { title: "Mailboxes", url: "/mailboxes", icon: Mail },
  {
    title: "Team settings",
    shortTitle: "Settings",
    url: "/settings/team/general",
    icon: Settings,
  },
];
