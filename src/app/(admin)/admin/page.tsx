"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowUpRight, Boxes, CreditCard, ShieldCheck, Users, Wallet, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
import { useAdminUsers, useAdminPayments } from "@/lib/api/hooks/admin";

type Overview = Record<string, number | string | undefined>;
type ActivityItem = { id?: string; event_type?: string; model_code?: string; provider?: string; status?: string; created_at?: string };

const value = (data: Overview | undefined, ...keys: string[]) => keys.map((key) => data?.[key]).find((item) => item !== undefined) ?? 0;
const cards: { label: string; key: string[]; hint: string; icon: LucideIcon; href: string }[] = [
  { label: "Total requests", key: ["total_requests", "requests"], hint: "Gateway traffic", icon: Activity, href: "/admin/activity" },
  { label: "Unique users", key: ["unique_users", "active_users"], hint: "Across the platform", icon: Users, href: "/admin/users" },
  { label: "Credits used", key: ["total_credits", "credits_used"], hint: "Model consumption", icon: Wallet, href: "/admin/analytics/models" },
  { label: "Revenue", key: ["revenue", "total_revenue"], hint: "Platform revenue", icon: CreditCard, href: "/admin/analytics/profit" },
];

export default function AdminIndex() {
  const overview = useQuery({ queryKey: ["admin-analytics-overview"], queryFn: () => api.get<Overview>("/v1/admin/analytics/overview") });
  const users = useAdminUsers({ limit: 5 });
  const payments = useAdminPayments({ limit: 5 });
  const activity = useQuery({ queryKey: ["admin-activity", "overview"], queryFn: () => api.get<ActivityItem[]>("/v1/admin/activity?limit=5") });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1><p className="mt-1 text-sm text-muted-foreground">Live operational signals from the Ngamia admin API.</p></div>
        <Badge variant="outline" className="gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Admin console</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          const metric = value(overview.data, ...item.key);
          return <Link href={item.href} key={item.label} className="group">
            <Card className="h-full bg-gradient-to-b from-primary/[0.035] to-card shadow-xs transition-shadow group-hover:shadow-md">
              <CardHeader>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">{overview.isLoading ? <Skeleton className="h-8 w-24" /> : typeof metric === "number" ? metric.toLocaleString() : metric}</CardTitle>
                <CardAction><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></span></CardAction>
              </CardHeader>
              <CardFooter className="justify-between text-xs text-muted-foreground"><span>{item.hint}</span><ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></CardFooter>
            </Card>
          </Link>;
        })}
      </div>

      {overview.isError && <Card className="border-destructive/30 bg-destructive/[0.03] p-4 text-sm text-destructive">Analytics could not be loaded. Check the admin API connection.</Card>}

      <div className="grid gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader className="border-b"><CardTitle>Recent activity</CardTitle><CardDescription>Latest events and gateway signals</CardDescription><CardAction><Link href="/admin/activity" className="text-xs font-medium text-muted-foreground hover:text-foreground">View all</Link></CardAction></CardHeader>
          <CardContent className="divide-y p-0">
            {activity.isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex items-center gap-3 p-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-8 flex-1" /></div>) : (activity.data ?? []).slice(0, 5).map((event, index) => <div key={event.id ?? index} className="flex items-center gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"><Activity className="h-4 w-4 text-muted-foreground" /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{event.event_type ?? event.model_code ?? "Platform event"}</p><p className="truncate text-xs text-muted-foreground">{event.provider ?? "Ngamia gateway"} · {event.status ?? "recorded"}</p></div>
              <time className="hidden text-xs text-muted-foreground sm:block">{event.created_at ? new Date(event.created_at).toLocaleString() : "—"}</time>
            </div>)}
            {!activity.isLoading && !activity.isError && !activity.data?.length && <div className="empty-state"><div className="empty-state-icon"><Activity className="h-5 w-5" /></div><p className="empty-state-title">No recent activity</p><p className="empty-state-description">Platform events will appear here.</p></div>}
            {activity.isError && <p className="p-5 text-sm text-destructive">Activity could not be loaded.</p>}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="border-b"><CardTitle>Quick access</CardTitle><CardDescription>Common platform operations</CardDescription></CardHeader>
          <CardContent className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              ["Manage users", "Review accounts and access", Users, "/admin/users"],
              ["Model catalog", "Availability and provider settings", Boxes, "/admin/catalog"],
              ["Payments", "Review deposits and settlement", CreditCard, "/admin/payments"],
              ["Security", "Protect administrator access", ShieldCheck, "/admin/security"],
            ].map(([title, description, Icon, href]) => {
              const ItemIcon = Icon as LucideIcon;
              return <Link key={title as string} href={href as string} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"><span className="flex h-9 w-9 items-center justify-center rounded-md border bg-background"><ItemIcon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title as string}</span><span className="block truncate text-xs text-muted-foreground">{description as string}</span></span><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></Link>;
            })}
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader className="border-b"><CardTitle>Recently joined</CardTitle><CardDescription>Newest customer accounts</CardDescription><CardAction><Link href="/admin/users" className="text-xs font-medium text-muted-foreground hover:text-foreground">View all</Link></CardAction></CardHeader>
          <CardContent className="divide-y p-0">
            {users.isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="flex items-center gap-3 p-4"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-8 flex-1" /></div>) : (users.data ?? []).slice(0, 5).map((user) => <div key={user.id} className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{(user.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.full_name ?? "Ngamia user"}</p><p className="truncate text-xs text-muted-foreground">{user.email ?? user.phone_number ?? "—"}</p></div><Badge variant="outline" className="capitalize">{user.status}</Badge></div>)}
            {!users.isLoading && !users.data?.length && <div className="empty-state"><div className="empty-state-icon"><Users className="h-5 w-5" /></div><p className="empty-state-title">No users found</p></div>}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="border-b"><CardTitle>Recent payments</CardTitle><CardDescription>Latest customer transactions</CardDescription><CardAction><Link href="/admin/payments" className="text-xs font-medium text-muted-foreground hover:text-foreground">View all</Link></CardAction></CardHeader>
          <CardContent className="divide-y p-0">
            {payments.isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-8 w-full" /></div>) : (payments.data ?? []).slice(0, 5).map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate text-sm font-medium">{payment.user?.full_name ?? "Customer payment"}</p><p className="truncate font-mono text-xs text-muted-foreground">{payment.provider_reference ?? payment.id}</p></div><div className="shrink-0 text-right"><p className="text-sm font-medium tabular-nums">{payment.amount_tzs.toLocaleString()} TZS</p><Badge variant={payment.status === "completed" ? "secondary" : payment.status === "failed" ? "destructive" : "outline"} className="mt-1 capitalize">{payment.status}</Badge></div></div>)}
            {!payments.isLoading && !payments.data?.length && <div className="empty-state"><div className="empty-state-icon"><CreditCard className="h-5 w-5" /></div><p className="empty-state-title">No payments yet</p></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
