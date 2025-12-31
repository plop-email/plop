"use client";

import { Sidebar, SidebarContent, SidebarHeader } from "@plop/ui/sidebar";
import { Logo } from "./logo";
import { NavMain } from "./nav-main";
import { navItems } from "./nav-items";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-2">
        <div className="flex w-full items-center justify-center">
          <Logo withLabel={false} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
    </Sidebar>
  );
}
