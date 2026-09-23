"use client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";

type Model = { id?: string; model_code?: string; display_name?: string; provider_id?: string; modality?: string; enabled?: boolean; code?: string; name?: string; provider?: string; status?: string; active?: boolean };
type Provider = { id: string; display_name: string; code: string };
export default function CatalogPage() {
  const query = useQuery({ queryKey: ["admin-catalog"], queryFn: () => api.get<Model[]>("/v1/admin/models") });
  const providers = useQuery({ queryKey: ["admin-providers"], queryFn: () => api.get<Provider[]>("/v1/admin/providers/") });
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Model catalog</h1><p className="mt-1 text-sm text-muted-foreground">Availability, providers, and model pricing.</p></div>
    <Card><CardHeader className="border-b"><CardTitle>Available models</CardTitle><CardDescription>Models configured for the Ngamia gateway</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</CardContent> : query.isError ? <CardContent className="py-6 text-sm text-destructive">The model catalog could not be loaded.</CardContent> : (query.data ?? []).length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">Model</th><th className="px-5 py-3 font-medium">Provider</th><th className="px-5 py-3 font-medium">Modality</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody>{(query.data ?? []).map((model, i) => { const code = model.model_code ?? model.code; const label = model.display_name ?? model.name ?? code; const enabled = model.enabled ?? model.active ?? model.status !== "inactive"; const provider = providers.data?.find((item) => item.id === model.provider_id); return <tr key={model.id ?? code ?? i} className="border-b last:border-0 transition-colors hover:bg-muted/40"><td className="px-5 py-3"><p className="font-medium">{label ?? "Unnamed model"}</p>{code && label !== code && <p className="font-mono text-xs text-muted-foreground">{code}</p>}</td><td className="px-5 py-3"><p>{model.provider ?? provider?.display_name ?? "—"}</p><p className="font-mono text-xs text-muted-foreground">{provider?.code ?? model.provider_id ?? ""}</p></td><td className="px-5 py-3 capitalize text-muted-foreground">{model.modality ?? "—"}</td><td className="px-5 py-3"><Badge variant={enabled ? "secondary" : "outline"} className="capitalize">{enabled ? "active" : "inactive"}</Badge></td></tr>; })}</tbody></table></div> : <CardContent><div className="empty-state"><p className="empty-state-title">No models available</p><p className="empty-state-description">Configured model inventory will appear here.</p></div></CardContent>}
    </Card>
  </div>;
}
