"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
type Model = { model_code?: string; provider?: string; request_count?: number; total_tokens?: number; total_cost_credits?: number };
export default function ModelAnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const query = useQuery({ queryKey: ["admin-analytics-models", period], queryFn: () => api.get<Model[]>(`/v1/admin/analytics/models?period=${period}`) });
  const models = query.data ?? [];
  const max = Math.max(...models.map((model) => model.request_count ?? 0), 1);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">Model usage</h1><p className="mt-1 text-sm text-muted-foreground">Compare request volume and credit consumption by model.</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="day">Today</option><option value="week">This week</option><option value="month">This month</option><option value="year">This year</option></select></div>
    <Card><CardHeader className="border-b"><CardTitle>Usage by model</CardTitle><CardDescription>Model-level request and credit consumption</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent> : query.isError ? <CardContent className="py-6 text-sm text-destructive">Model analytics could not be loaded.</CardContent> : models.length ? <><CardContent className="space-y-4 border-b pt-5">{models.slice(0, 10).map((model) => <div key={model.model_code}><div className="mb-1 flex justify-between text-xs"><span className="truncate">{model.model_code}</span><span className="tabular-nums text-muted-foreground">{(model.request_count ?? 0).toLocaleString()}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${((model.request_count ?? 0) / max) * 100}%` }} /></div></div>)}</CardContent><CardContent className="divide-y p-0">{models.map((model, index) => <div key={`${model.model_code}-${index}`} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium">{model.model_code ?? "Unknown model"}</p><p className="text-xs text-muted-foreground">{model.provider ?? "Unknown provider"} · {(model.total_tokens ?? 0).toLocaleString()} tokens</p></div><Badge variant="outline" className="w-fit">{(model.request_count ?? 0).toLocaleString()} requests</Badge><p className="text-sm font-medium tabular-nums sm:text-right">{(model.total_cost_credits ?? 0).toLocaleString()} credits</p></div>)}</CardContent></> : <CardContent><div className="empty-state"><p className="empty-state-title">No model usage yet</p><p className="empty-state-description">Model request totals will appear when usage is recorded.</p></div></CardContent>}
    </Card>
  </div>;
}
