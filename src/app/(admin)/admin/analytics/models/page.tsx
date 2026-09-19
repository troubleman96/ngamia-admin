"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
type Model = { model_code?: string; provider?: string; requests?: number; request_count?: number; cost_credits?: number; credits?: number };
export default function ModelAnalyticsPage() {
  const query = useQuery({ queryKey: ["admin-analytics-models"], queryFn: () => api.get<Model[]>("/v1/admin/analytics/models") });
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Model usage</h1><p className="mt-1 text-sm text-muted-foreground">Compare request volume and credit consumption by model.</p></div>
    <Card><CardHeader className="border-b"><CardTitle>Usage by model</CardTitle><CardDescription>Model-level request and credit consumption</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent> : query.isError ? <CardContent className="py-6 text-sm text-destructive">Model analytics could not be loaded.</CardContent> : (query.data ?? []).length ? <CardContent className="divide-y p-0">{(query.data ?? []).map((model, index) => <div key={`${model.model_code}-${index}`} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium">{model.model_code ?? "Unknown model"}</p><p className="text-xs text-muted-foreground">{model.provider ?? "Unknown provider"}</p></div><Badge variant="outline" className="w-fit">{(model.requests ?? model.request_count ?? 0).toLocaleString()} requests</Badge><p className="text-sm font-medium tabular-nums sm:text-right">{(model.cost_credits ?? model.credits ?? 0).toLocaleString()} credits</p></div>)}</CardContent> : <CardContent><div className="empty-state"><p className="empty-state-title">No model usage yet</p><p className="empty-state-description">Model request totals will appear when usage is recorded.</p></div></CardContent>}
    </Card>
  </div>;
}
