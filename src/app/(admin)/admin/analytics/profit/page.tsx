"use client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
type Profit = { model_code?: string; provider?: string; revenue?: number; upstream_cost?: number; profit?: number; margin_percent?: number };
export default function ProfitPage() {
  const query = useQuery({ queryKey: ["admin-analytics-profit"], queryFn: () => api.get<{ by_model?: Profit[] } | Profit[]>("/v1/admin/analytics/profit") });
  const rows = Array.isArray(query.data) ? query.data : query.data?.by_model ?? [];
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Profit report</h1><p className="mt-1 text-sm text-muted-foreground">Revenue, upstream cost, and margin by model.</p></div>
    <Card><CardHeader className="border-b"><CardTitle>Model profitability</CardTitle><CardDescription>Financial performance based on recorded usage</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent> : query.isError ? <CardContent className="py-6 text-sm text-destructive">Profit data could not be loaded.</CardContent> : rows.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">Model</th><th className="px-5 py-3 font-medium">Revenue</th><th className="px-5 py-3 font-medium">Upstream cost</th><th className="px-5 py-3 font-medium">Profit</th><th className="px-5 py-3 font-medium">Margin</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.model_code}-${index}`} className="border-b last:border-0 transition-colors hover:bg-muted/40"><td className="px-5 py-3"><p className="font-medium">{row.model_code ?? "Unknown model"}</p><p className="text-xs text-muted-foreground">{row.provider ?? ""}</p></td><td className="px-5 py-3 tabular-nums">{(row.revenue ?? 0).toLocaleString()}</td><td className="px-5 py-3 tabular-nums text-muted-foreground">{(row.upstream_cost ?? 0).toLocaleString()}</td><td className="px-5 py-3 font-medium tabular-nums">{(row.profit ?? ((row.revenue ?? 0) - (row.upstream_cost ?? 0))).toLocaleString()}</td><td className="px-5 py-3"><Badge variant="outline">{row.margin_percent ?? "—"}%</Badge></td></tr>)}</tbody></table></div> : <CardContent><div className="empty-state"><p className="empty-state-title">No profitability data</p><p className="empty-state-description">Model-level revenue and costs will appear after usage is recorded.</p></div></CardContent>}
    </Card>
  </div>;
}
