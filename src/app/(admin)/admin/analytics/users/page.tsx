"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
type User = { user_id?: string; full_name?: string; email?: string; request_count?: number; total_cost_credits?: number; requests?: number; cost_credits?: number; credits?: number };
export default function UserAnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const query = useQuery({ queryKey: ["admin-analytics-users", period], queryFn: () => api.get<User[]>(`/v1/admin/analytics/users?period=${period}`) });
  const users = query.data ?? [];
  const max = Math.max(...users.map((user) => user.request_count ?? user.requests ?? 0), 1);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">User usage</h1><p className="mt-1 text-sm text-muted-foreground">Customer activity and credit consumption across Ngamia.</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="day">Today</option><option value="week">This week</option><option value="month">This month</option><option value="year">This year</option></select></div>
    <Card><CardHeader className="border-b"><CardTitle>Usage by user</CardTitle><CardDescription>Customer request and spend ranking</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent> : query.isError ? <CardContent className="py-6 text-sm text-destructive">User analytics could not be loaded.</CardContent> : users.length ? <><CardContent className="space-y-4 border-b pt-5">{users.slice(0, 10).map((user) => <div key={user.user_id}><div className="mb-1 flex justify-between text-xs"><span className="truncate">{user.full_name ?? user.email ?? user.user_id}</span><span className="tabular-nums text-muted-foreground">{(user.request_count ?? user.requests ?? 0).toLocaleString()}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${((user.request_count ?? user.requests ?? 0) / max) * 100}%` }} /></div></div>)}</CardContent><CardContent className="divide-y p-0">{users.map((user, index) => <div key={`${user.user_id}-${index}`} className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{(user.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.full_name ?? user.user_id ?? "Unknown user"}</p><p className="truncate text-xs text-muted-foreground">{user.email ?? user.user_id ?? ""}</p></div><div className="text-right"><Badge variant="outline">{(user.request_count ?? user.requests ?? 0).toLocaleString()} requests</Badge><p className="mt-1 text-xs tabular-nums text-muted-foreground">{(user.total_cost_credits ?? user.cost_credits ?? user.credits ?? 0).toLocaleString()} credits</p></div></div>)}</CardContent></> : <CardContent><div className="empty-state"><p className="empty-state-title">No user usage yet</p><p className="empty-state-description">Customer activity will appear here.</p></div></CardContent>}
    </Card>
  </div>;
}
