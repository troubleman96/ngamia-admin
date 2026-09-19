"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPayments, type AdminPayment } from "@/lib/api/hooks/admin";
import { formatCredits, formatRelativeTime } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, "secondary" | "outline" | "destructive"> = {
  completed: "secondary",
  pending: "outline",
  failed: "destructive",
  expired: "outline",
};

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data: payments, isLoading } = useAdminPayments({
    limit: 100,
    status,
  });

  return (
    <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-2xl font-semibold tracking-tight">Payments</h1><p className="mt-1 text-sm text-muted-foreground">Review customer deposits and settlement status.</p></div>
          <div className="flex gap-1.5">
            {[undefined, "pending", "completed", "failed"].map((s) => (
              <Button
                key={s ?? "all"}
                size="sm"
                variant={status === s ? "default" : "ghost"}
                onClick={() => setStatus(s)}
                className="h-8 text-xs capitalize"
              >
                {s ?? "All"}
              </Button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b"><CardTitle>Payment history</CardTitle><CardDescription>Recent transactions across Ngamia</CardDescription></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Reference</th>
                      <th className="px-5 py-3 font-medium">Customer / amount</th>
                      <th className="hidden px-5 py-3 font-medium sm:table-cell">Date</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: AdminPayment) => (
                      <tr key={p.id} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                        <td className="px-5 py-3 font-mono text-xs">
                          {p.provider_reference ?? p.id}
                        </td>
                        <td className="px-5 py-3 font-medium">
                          <div>{formatCredits(p.amount_tzs)} TZS</div>
                          {p.user && <div className="text-xs font-normal text-muted-foreground">{p.user.full_name}</div>}
                        </td>
                        <td className="hidden px-5 py-3 text-xs text-muted-foreground sm:table-cell">
                          {formatRelativeTime(p.created_at)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant={
                              STATUS_VARIANTS[p.status] ??
                              (p.status === "completed" ? "secondary" : "outline")
                            }
                            className="capitalize"
                          >
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <CreditCard className="h-5 w-5" />
                </div>
                <p className="empty-state-title">No payments</p>
                <p className="empty-state-description">
                  No payments match the selected filter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
