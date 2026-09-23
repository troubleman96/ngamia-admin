"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Activity, BarChart3, Bell, Boxes, Building2, ChevronRight, CreditCard,
  LayoutDashboard, LogOut, Menu, Moon, Search, Settings2, ShieldCheck,
  Sun, TrendingUp, UserRound, Users, Wallet, X, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearTokens, getAdminProfile } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const groups = [
  { label: "Workspace", items: [["/admin", "Overview", LayoutDashboard]] },
  { label: "Analytics", items: [["/admin/analytics/overview", "Overview", BarChart3], ["/admin/analytics/models", "Model usage", TrendingUp], ["/admin/analytics/users", "User usage", UserRound], ["/admin/analytics/profit", "Profit", Wallet]] },
  { label: "Management", items: [["/admin/users", "Users", Users], ["/admin/workspaces", "Workspaces", Building2], ["/admin/payments", "Payments", CreditCard], ["/admin/catalog", "Model catalog", Boxes]] },
  { label: "System", items: [["/admin/requests", "Requests", Activity], ["/admin/activity", "Activity", Activity], ["/admin/notifications", "Broadcasts", Bell], ["/admin/security", "Security", ShieldCheck], ["/admin/settings", "Settings", Settings2], ["/admin/profile", "Profile", UserRound]] },
] as const;
const pages: { href: string; label: string; Icon: LucideIcon }[] = groups.flatMap((group) =>
  group.items.map(([href, label, Icon]) => ({ href, label, Icon }))
);

function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Admin navigation" className="space-y-6">{groups.map((group) => <section key={group.label}>
    <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{group.label}</h2>
    <div className="space-y-0.5">{group.items.map(([href, label, Icon]) => {
      const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
      return <Link key={href} href={href} onClick={close} aria-current={active ? "page" : undefined} className={cn("group flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm")}>
        <Icon className={cn("h-4 w-4 shrink-0", active && "text-foreground")} strokeWidth={1.8} />
        <span className="flex-1 truncate">{label}</span>{active && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
      </Link>;
    })}</div>
  </section>)}</nav>;
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm sm:flex">
    <Link href="/admin" className="text-muted-foreground hover:text-foreground">Ngamia Admin</Link>
    {segments.slice(1).map((segment, index) => {
      const href = `/${segments.slice(0, index + 2).join("/")}`;
      const label = segment.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
      const current = index === segments.length - 2;
      return <span key={href} className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />{current ? <span className="font-medium text-foreground">{label}</span> : <Link href={href} className="text-muted-foreground hover:text-foreground">{label}</Link>}</span>;
    })}
  </nav>;
}

function Sidebar({ mobile = false, close }: { mobile?: boolean; close?: () => void }) {
  return <aside className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", !mobile && "fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-sidebar-border lg:flex")}>
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-5">
      <Image src="/logo-512.png" alt="Ngamia" width={30} height={30} className="rounded-md" />
      <div className="min-w-0"><p className="truncate text-sm font-semibold tracking-tight">Ngamia</p><p className="text-[10px] text-muted-foreground">Platform administration</p></div>
      {mobile && <Button type="button" variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={close} aria-label="Close navigation"><X className="h-4 w-4" /></Button>}
    </div>
    <div className="flex-1 overflow-y-auto px-3 py-5"><Navigation close={close} /></div>
    <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">Ngamia control plane</div>
  </aside>;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const profile = getAdminProfile();
  const title = profile?.full_name ?? profile?.email ?? "Administrator";
  const initials = title.trim().charAt(0).toUpperCase() || "A";
  return <div className="min-h-dvh bg-background text-foreground">
    <Sidebar />
    <div className="min-h-dvh lg:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu className="h-4 w-4" /></Button>
          <Breadcrumbs />
          <span className="truncate text-sm font-semibold sm:hidden">Ngamia Admin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative hidden w-52 md:block"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pages…" aria-label="Search admin pages" className="h-8 border-transparent bg-muted/70 pl-8 text-xs shadow-none focus-visible:border-input" />{search && <div className="absolute right-0 top-10 z-30 w-64 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg">{pages.filter((page) => page.label.toLowerCase().includes(search.toLowerCase())).map(({ href, label, Icon }) => <Link key={href} href={href} onClick={() => setSearch("")} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted"><Icon className="h-4 w-4 text-muted-foreground" />{label}</Link>)}{!pages.some((page) => page.label.toLowerCase().includes(search.toLowerCase())) && <p className="px-2.5 py-2 text-xs text-muted-foreground">No matching pages</p>}</div>}</div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
          <Link href="/admin/profile" className="ml-1 flex h-8 items-center gap-2 rounded-md px-1.5 hover:bg-muted" title={title}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{initials}</span><span className="hidden max-w-28 truncate text-xs font-medium sm:block">{profile?.full_name ?? "Admin"}</span></Link>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Sign out" onClick={() => { clearTokens(); router.replace("/login"); }}><LogOut className="h-4 w-4" /><span className="sr-only">Sign out</span></Button>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 [&>div>h1]:text-2xl [&>div>div>h1]:text-2xl">{children}</main>
      {open && <div className="fixed inset-0 z-50 bg-black/35 lg:hidden" onClick={() => setOpen(false)}><div className="h-full w-[min(84vw,280px)] shadow-xl" onClick={(event) => event.stopPropagation()}><Sidebar mobile close={() => setOpen(false)} /></div></div>}
    </div>
  </div>;
}
