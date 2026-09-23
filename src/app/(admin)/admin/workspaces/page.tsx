"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Workspace = { id: string; user_id: string; name: string; slug: string; created_at: string };

export default function WorkspacesPage() {
  const query = useQuery({ queryKey: ["admin-workspaces"], queryFn: () => api.get<Workspace[]>("/v1/admin/workspaces?limit=100") });
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1><p className="mt-1 text-sm text-muted-foreground">Workspace inventory and administration.</p></div>
    <Card>
      <CardHeader className="border-b"><CardTitle>Workspace operations</CardTitle><CardDescription>Platform-wide workspace inventory</CardDescription></CardHeader>
      {query.isLoading ? <CardContent className="py-8 text-sm text-muted-foreground">Loading workspace inventory…</CardContent> : query.isError ? <CardContent className="py-8 text-sm text-destructive">Workspace inventory could not be loaded.</CardContent> : <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">Workspace</th><th className="px-5 py-3 font-medium">Owner</th><th className="px-5 py-3 font-medium">Slug</th><th className="px-5 py-3 font-medium">Created</th></tr></thead><tbody>{(query.data ?? []).map((workspace) => <tr key={workspace.id} className="border-b last:border-0"><td className="px-5 py-3 font-medium">{workspace.name}</td><td className="px-5 py-3 font-mono text-xs text-muted-foreground">{workspace.user_id}</td><td className="px-5 py-3 text-muted-foreground">{workspace.slug}</td><td className="px-5 py-3 text-muted-foreground">{new Date(workspace.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>{!query.data?.length && <div className="empty-state"><p className="empty-state-title">No workspaces found</p></div>}</CardContent>}
    </Card>
  </div>;
}
