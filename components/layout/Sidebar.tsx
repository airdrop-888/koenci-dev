"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, LayoutDashboard, Settings, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-zinc-950 px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-black">
          <KeyRound className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold text-zinc-50 tracking-tight">Koenci Dev</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800/50 text-zinc-50"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", isActive ? "text-zinc-50" : "text-zinc-400")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <div className="rounded-md bg-zinc-900 border border-zinc-800 p-4">
          <h4 className="text-sm font-medium text-zinc-50">Free Tier</h4>
          <p className="mt-1 text-xs text-zinc-400">
            0 / 3 Projects used
          </p>
          <div className="mt-3 h-1 w-full rounded-full bg-zinc-800">
            <div className="h-1 w-0 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </aside>
  );
}
