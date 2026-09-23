"use client";
import { useQuery } from "@tanstack/react-query";
import { Activity, CircleAlert, Coins, Gauge, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";

type Event = { id?: string; event_type?: string; provider?: string; model_code?: string; status?: string; cost_credits?: number; created_at?: string };
type Overview = { total_requests?: number; unique_users?: number; total_tokens?: number; total_credits?: number; credits_used?: number };

export default function ActivityPage() {
  const query = useQuery({ queryKey: ["admin-activity"], queryFn: () => api.get<Event[]>("/v1/admin/activity?limit=50") });
  const summary = useQuery({ queryKey: ["admin-activity-summary"], queryFn: () => api.get<Overview>("/v1/admin/analytics/overview") });
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Operational activity</h1><p className="mt-1 text-sm text-muted-foreground">Recent platform events and usage signals.</p></div>
    <div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="flex items-center gap-3 p-4"><Gauge className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Requests tracked</p><p className="text-lg font-semibold tabular-nums">{summary.data?.total_requests?.toLocaleString() ?? "—"}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><Users className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Active users</p><p className="text-lg font-semibold tabular-nums">{summary.data?.unique_users?.toLocaleString() ?? "—"}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><Coins className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Credits used</p><p className="text-lg font-semibold tabular-nums">{(summary.data?.total_credits ?? summary.data?.credits_used)?.toLocaleString() ?? "—"}</p></div></CardContent></Card></div>
    <Card><CardHeader className="border-b"><CardTitle>Activity log</CardTitle><CardDescription>Latest gateway calls and platform events</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent> : query.isError ? <CardContent className="py-8 text-sm text-destructive">Unable to load activity. Check the admin API connection.</CardContent> : (query.data ?? []).length ? <CardContent className="divide-y p-0">{(query.data ?? []).map((event, i) => <div key={event.id ?? i} className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted"><Activity className="h-4 w-4 text-muted-foreground" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{event.event_type ?? event.model_code ?? "Platform event"}</p><p className="truncate text-xs text-muted-foreground">{event.provider ?? "Ngamia gateway"}{event.cost_credits !== undefined && ` · ${event.cost_credits.toLocaleString()} credits`}</p></div><Badge variant={event.status === "completed" ? "secondary" : event.status === "failed" ? "destructive" : "outline"} className="capitalize">{event.status ?? "recorded"}</Badge><time className="hidden whitespace-nowrap text-xs text-muted-foreground md:block">{event.created_at ? new Date(event.created_at).toLocaleString() : "—"}</time></div>)}</CardContent> : <CardContent><div className="empty-state"><div className="empty-state-icon"><CircleAlert className="h-5 w-5" /></div><p className="empty-state-title">No activity yet</p><p className="empty-state-description">Recorded platform events will show here.</p></div></CardContent>}
    </Card>
  </div>;
}
