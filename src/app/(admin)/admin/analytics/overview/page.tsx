"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, Coins, CreditCard, Users, type LucideIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";

type Overview = Record<string, number | string | undefined>;
type Point = { bucket: string; requests: number; tokens: number; credits: number };
const metric = (data: Overview | undefined, ...keys: string[]) => keys.map((key) => data?.[key]).find((value) => value !== undefined) ?? 0;
const definitions: [string, string[], LucideIcon][] = [["Requests", ["total_requests", "requests"], Activity], ["Unique users", ["unique_users", "active_users"], Users], ["Credits used", ["total_credits", "credits_used"], Coins], ["Revenue", ["revenue", "total_revenue"], CreditCard]];

export default function AnalyticsOverviewPage() {
  const [period, setPeriod] = useState("month");
  const query = useQuery({ queryKey: ["admin-analytics-overview", period], queryFn: () => api.get<Overview>(`/v1/admin/analytics/overview?period=${period}`) });
  const timeline = useQuery({ queryKey: ["admin-analytics-timeline", period], queryFn: () => api.get<Point[]>(`/v1/admin/analytics/timeline?period=${period}`) });
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">Analytics overview</h1><p className="mt-1 text-sm text-muted-foreground">Platform health and commercial performance.</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="day">Today</option><option value="week">This week</option><option value="month">This month</option><option value="year">This year</option></select></div>
    {query.isError && <Card className="border-destructive/30"><CardContent className="flex items-center gap-3 py-4 text-sm text-destructive"><Activity className="h-4 w-4" /> Analytics could not be loaded. Check the admin API connection.</CardContent></Card>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{definitions.map(([label, keys, Icon]) => { const value = metric(query.data, ...keys); return <Card key={label} className="bg-gradient-to-b from-primary/[0.035] to-card shadow-xs"><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-2xl font-semibold tabular-nums">{query.isLoading ? <Skeleton className="h-8 w-24" /> : typeof value === "number" ? value.toLocaleString() : value}</CardTitle><CardAction><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></span></CardAction></CardHeader><CardContent className="text-xs text-muted-foreground">Current aggregate reported by the admin API</CardContent></Card>; })}</div>
    <Card><CardHeader className="border-b"><CardTitle>Usage trends</CardTitle><CardDescription>Requests and credits tracked by {period}</CardDescription></CardHeader><CardContent className="pt-6">{timeline.isLoading ? <Skeleton className="h-64 w-full" /> : timeline.data?.length ? <div className="grid gap-6 lg:grid-cols-[1fr_260px]"><div className="flex h-64 items-end gap-1 rounded-lg bg-muted/30 p-4">{timeline.data.map((point) => { const max = Math.max(...timeline.data.map((item) => item.requests), 1); const height = Math.max((point.requests / max) * 100, 3); return <div key={point.bucket} className="group flex h-full flex-1 items-end" title={`${point.requests.toLocaleString()} requests`}><div className="w-full rounded-t-sm bg-primary/75 transition-all group-hover:bg-primary" style={{ height: `${height}%` }} /></div> })}</div><div className="space-y-3"><div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Request volume</div><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">Total requests</p><p className="mt-1 text-2xl font-semibold tabular-nums">{timeline.data.reduce((sum, item) => sum + item.requests, 0).toLocaleString()}</p><p className="mt-3 text-xs text-muted-foreground">{timeline.data.reduce((sum, item) => sum + item.credits, 0).toLocaleString()} credits tracked</p></div></div></div> : <div className="flex flex-col items-center py-12 text-center"><BarChart3 className="mb-3 h-8 w-8 text-muted-foreground" /><p className="text-sm font-medium">No request activity for this period</p><p className="mt-1 text-sm text-muted-foreground">New gateway requests will appear here automatically.</p></div>}</CardContent></Card>
  </div>;
}
