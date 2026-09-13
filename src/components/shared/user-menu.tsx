"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getEmailSnapshot() {
  return window.localStorage.getItem("ai-investment-agent-user");
}

function getNameSnapshot() {
  return window.localStorage.getItem("ai-investment-agent-name");
}

function getEmptySnapshot() {
  return null;
}

export function UserMenu() {
  const router = useRouter();
  const email = useSyncExternalStore(subscribe, getEmailSnapshot, getEmptySnapshot);
  const name = useSyncExternalStore(subscribe, getNameSnapshot, getEmptySnapshot);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="@user" />
            <AvatarFallback>{email ? email.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name || "Investor"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("ai-investment-agent-token");
              window.localStorage.removeItem("ai-investment-agent-user");
              window.localStorage.removeItem("ai-investment-agent-name");
            }
            router.replace("/login");
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
