"use client";

import { createClient } from "@plop/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@plop/ui/dropdown-menu";
import { cn } from "@plop/ui/cn";
import { Check, Laptop, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserAvatar } from "./user-avatar";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { data: user } = useCurrentUser();
  const { theme, setTheme } = useTheme();

  if (!user) {
    return null;
  }

  const supabase = createClient();
  const displayName = user.fullName || user.email || "User";
  const activeTheme = theme ?? "system";
  const themeItems = [
    { label: "System", value: "system", icon: Laptop },
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
  ] as const;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className={cn(
            " outline-none focus-visible:ring-2 focus-visible:ring-primary",
            className,
          )}
        >
          <UserAvatar
            name={displayName}
            email={user.email}
            src={user.avatarUrl}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56 p-2">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="">
          <Link href="/settings/account/general">
            <Settings className="mr-2 size-4" />
            Account settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            {activeTheme === "dark" ? (
              <Moon className="size-4" />
            ) : activeTheme === "light" ? (
              <Sun className="size-4" />
            ) : (
              <Laptop className="size-4" />
            )}
            <span className="flex-1">Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel className="text-xs font-medium uppercase text-muted-foreground">
              Theme
            </DropdownMenuLabel>
            {themeItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTheme === item.value;
              return (
                <DropdownMenuItem
                  key={item.value}
                  className="gap-2"
                  onSelect={() => setTheme(item.value)}
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{item.label}</span>
                  {isActive ? <Check className="size-4" /> : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className=""
          onSelect={() => {
            void supabase.auth.signOut();
          }}
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
