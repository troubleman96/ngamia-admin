"use client";
import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, Coins, CreditCard, Users, type LucideIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";

type Overview = Record<string, number | string | undefined>;
const metric = (data: Overview | undefined, ...keys: string[]) => keys.map((key) => data?.[key]).find((value) => value !== undefined) ?? 0;
const definitions: [string, string[], LucideIcon][] = [["Requests", ["total_requests", "requests"], Activity], ["Unique users", ["unique_users", "active_users"], Users], ["Credits used", ["total_credits", "credits_used"], Coins], ["Revenue", ["revenue", "total_revenue"], CreditCard]];

export default function AnalyticsOverviewPage() {
  const query = useQuery({ queryKey: ["admin-analytics-overview"], queryFn: () => api.get<Overview>("/v1/admin/analytics/overview") });
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold tracking-tight">Analytics overview</h1><p className="mt-1 text-sm text-muted-foreground">Platform health and commercial performance.</p></div>
    {query.isError && <Card className="border-destructive/30"><CardContent className="flex items-center gap-3 py-4 text-sm text-destructive"><Activity className="h-4 w-4" /> Analytics could not be loaded. Check the admin API connection.</CardContent></Card>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{definitions.map(([label, keys, Icon]) => { const value = metric(query.data, ...keys); return <Card key={label} className="bg-gradient-to-b from-primary/[0.035] to-card shadow-xs"><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-2xl font-semibold tabular-nums">{query.isLoading ? <Skeleton className="h-8 w-24" /> : typeof value === "number" ? value.toLocaleString() : value}</CardTitle><CardAction><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></span></CardAction></CardHeader><CardContent className="text-xs text-muted-foreground">Current aggregate reported by the admin API</CardContent></Card>; })}</div>
    <Card><CardHeader className="border-b"><CardTitle>Usage trends</CardTitle><CardDescription>Request activity over time</CardDescription></CardHeader><CardContent className="py-12"><div className="mx-auto flex max-w-md flex-col items-center text-center"><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted"><BarChart3 className="h-5 w-5 text-muted-foreground" /></span><p className="text-sm font-medium">Time-series analytics are not available</p><p className="mt-1 text-sm text-muted-foreground">The current API returns aggregate totals. A time-bucket endpoint is needed to display trends.</p></div></CardContent></Card>
  </div>;
}
