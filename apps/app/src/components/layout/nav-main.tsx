"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@plop/ui/sidebar";
import { useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@plop/ui/tooltip";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    shortTitle?: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const isActiveMenuItem = useCallback(
    (href: string | null) => {
      return href
        ? pathname === href || pathname.startsWith(`${href}/`)
        : false;
    },
    [pathname],
  );
  const showTooltip = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[state=collapsed]/sidebar:hidden">
        Workspace
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <TooltipProvider delayDuration={120}>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = isActiveMenuItem(item.url);
              const menuButton = (
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="min-w-0 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-2"
                >
                  <Link href={item.url} title={item.title}>
                    {item.icon ? (
                      <item.icon className="size-4 shrink-0" />
                    ) : null}
                    <span className="truncate group-data-[state=collapsed]/sidebar:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              );

              return (
                <SidebarMenuItem key={item.title}>
                  {showTooltip ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                      <TooltipContent side="right" align="center">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    menuButton
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </TooltipProvider>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
