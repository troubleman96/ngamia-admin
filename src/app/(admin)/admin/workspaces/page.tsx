"use client";
import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkspacesPage() {
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1><p className="mt-1 text-sm text-muted-foreground">Workspace inventory and administration.</p></div>
    <Card>
      <CardHeader className="border-b"><CardTitle>Workspace operations</CardTitle><CardDescription>Platform-wide workspace inventory</CardDescription></CardHeader>
      <CardContent className="flex items-start gap-4 py-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"><Info className="h-5 w-5 text-muted-foreground" /></span>
        <div><h2 className="text-sm font-medium">Admin inventory is not available</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">The API currently exposes customer-scoped workspace endpoints only. A platform-wide admin inventory endpoint is needed before this screen can display workspace data.</p></div>
      </CardContent>
    </Card>
  </div>;
}
