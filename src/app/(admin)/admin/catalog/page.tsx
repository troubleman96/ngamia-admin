"use client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";

type Model = { id?: string; code?: string; name?: string; provider?: string; status?: string; active?: boolean; input_price?: number; output_price?: number };
export default function CatalogPage() {
  const query = useQuery({ queryKey: ["admin-catalog"], queryFn: () => api.get<Model[]>("/v1/admin/models") });
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Model catalog</h1><p className="mt-1 text-sm text-muted-foreground">Availability, providers, and model pricing.</p></div>
    <Card><CardHeader className="border-b"><CardTitle>Available models</CardTitle><CardDescription>Models configured for the Ngamia gateway</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</CardContent> : query.isError ? <CardContent className="py-6 text-sm text-destructive">The model catalog could not be loaded.</CardContent> : (query.data ?? []).length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">Model</th><th className="px-5 py-3 font-medium">Provider</th><th className="px-5 py-3 font-medium">Input price</th><th className="px-5 py-3 font-medium">Output price</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody>{(query.data ?? []).map((model, i) => <tr key={model.id ?? model.code ?? i} className="border-b last:border-0 transition-colors hover:bg-muted/40"><td className="px-5 py-3"><p className="font-medium">{model.name ?? model.code ?? "Unnamed model"}</p>{model.code && model.name && <p className="font-mono text-xs text-muted-foreground">{model.code}</p>}</td><td className="px-5 py-3 text-muted-foreground">{model.provider ?? "Unknown provider"}</td><td className="px-5 py-3 tabular-nums">{model.input_price?.toLocaleString() ?? "—"}</td><td className="px-5 py-3 tabular-nums">{model.output_price?.toLocaleString() ?? "—"}</td><td className="px-5 py-3"><Badge variant={model.active === false || model.status === "inactive" ? "outline" : "secondary"} className="capitalize">{model.status ?? (model.active === false ? "inactive" : "active")}</Badge></td></tr>)}</tbody></table></div> : <CardContent><div className="empty-state"><p className="empty-state-title">No models available</p><p className="empty-state-description">Configured model inventory will appear here.</p></div></CardContent>}
    </Card>
  </div>;
}
