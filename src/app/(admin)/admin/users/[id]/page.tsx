"use client";

import { use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUser, useUpdateAdminUser } from "@/lib/api/hooks/admin";
import { formatCredits, formatRelativeTime } from "@/lib/utils";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading } = useAdminUser(id);
  const updateUser = useUpdateAdminUser(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div><div className="empty-state">User not found.</div></div>
    );
  }

  const handleStatus = (status: string) =>
    updateUser.mutate(
      { status },
      { onError: (err) => console.error(err.message) }
    );

  return (
      <div><div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" render={<Link href="/admin/users" />}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                {user.full_name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{user.email}</span>
                <span>·</span>
                <Badge className="bg-primary/10 text-primary">{user.role}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {user.status !== "suspended" && (
              <Button variant="destructive" size="sm" onClick={() => handleStatus("suspended")}>
                Suspend
              </Button>
            )}
            {user.status === "suspended" && (
              <Button size="sm" onClick={() => handleStatus("active")}>
                Reactivate
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.balance ? (
                <div className="text-2xl font-semibold tracking-tight">
                  {formatCredits(user.balance.balance)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    credits
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unavailable</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="capitalize">{user.status}</Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                Joined {formatRelativeTime(user.created_at)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Email</span>
                <span className={user.email_verified ? "text-green-600" : "text-muted-foreground"}>
                  {user.email_verified ? "Verified" : "Unverified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phone</span>
                <span className={user.phone_verified ? "text-green-600" : "text-muted-foreground"}>
                  {user.phone_verified ? "Verified" : "Unverified"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {user.api_keys && user.api_keys.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">API keys</CardTitle>
              <CardDescription className="text-sm">
                {user.api_keys.length} active / total
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {user.api_keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {key.key_prefix}...{key.last_used_at ? ` · used ${formatRelativeTime(key.last_used_at)}` : ""}
                    </p>
                  </div>
                  <Badge variant={key.status === "active" ? "secondary" : "destructive"}>
                    {key.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {user.recent_activity && user.recent_activity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {user.recent_activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{a.model_code ?? a.provider ?? "gateway call"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(a.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs">{a.cost_credits.toFixed(4)} cr</span>
                    <Badge variant={a.status === "completed" ? "secondary" : "destructive"}>
                      {a.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {user.recent_payments && user.recent_payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Recent payments
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {user.recent_payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium">{formatCredits(p.amount_tzs)} TZS</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(p.created_at)}
                    </span>
                    <Badge variant={p.status === "completed" ? "secondary" : "outline"}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div></div>
  );
}