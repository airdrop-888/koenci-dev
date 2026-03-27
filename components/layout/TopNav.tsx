"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Menu, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-zinc-950/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-zinc-400 hover:text-zinc-50">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          } />
          <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-zinc-950 border-zinc-800 p-0 text-zinc-50">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-black">
                <KeyRound className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Koenci Dev</span>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {/* Similar to Sidebar items */}
              <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors bg-zinc-800/50 text-zinc-50">
                <Menu className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/dashboard/projects" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50">
                <Menu className="h-4 w-4" />
                Projects
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb pseudo-implementation */}
        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-zinc-300 capitalize">
            {pathname.split("/").filter(Boolean).join(" / ").replace(/-/g, " ") || "Dashboard"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form className="hidden sm:block relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="w-64 rounded-full bg-zinc-900 border-zinc-800 pl-9 text-sm text-zinc-300 focus-visible:ring-emerald-500/50 focus-visible:ring-1 transition-all focus:w-72"
          />
        </form>
        
        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-50 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="h-9 w-9 rounded-full px-0 hover:bg-zinc-800">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>KD</AvatarFallback>
              </Avatar>
            </Button>
          } />
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal border-b border-zinc-800 py-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-zinc-50">Jane Developer</p>
                <p className="text-xs leading-none text-zinc-400">jane@example.com</p>
              </div>
            </DropdownMenuLabel>
            <div className="py-1">
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="py-1">
              <DropdownMenuItem className="text-rose-500 cursor-pointer focus:text-rose-400 focus:bg-rose-500/10">
                Log out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
