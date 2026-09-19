"use client";

import { useState } from "react";
import { ExternalLink, Search, Users } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminUsers,
} from "@/lib/api/hooks/admin";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended: "bg-red-500/10 text-red-600 dark:text-red-400",
  deleted: "bg-muted text-muted-foreground",
};

const ROLE_STYLES: Record<string, string> = {
  user: "bg-secondary text-secondary-foreground",
  admin: "bg-primary/10 text-primary",
  super_admin: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useAdminUsers({
    limit: 100,
    search: search || undefined,
  });

  return (

      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-2xl font-semibold tracking-tight">Users</h1><p className="mt-1 text-sm text-muted-foreground">Manage customer accounts and access.</p></div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="pl-9"
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Joined</th>
                      <th className="px-4 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-accent/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{user.full_name}</div>
                          {user.email && (
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              ROLE_STYLES[user.role as keyof typeof ROLE_STYLES] ??
                              "bg-secondary text-secondary-foreground"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <Badge
                            className={
                              STATUS_STYLES[user.status as keyof typeof STATUS_STYLES] ??
                              "bg-secondary text-secondary-foreground"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                          {formatRelativeTime(user.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users className="h-5 w-5" />
                </div>
                <p className="empty-state-title">No users found</p>
                <p className="empty-state-description">
                  Try adjusting your search.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

  );
}
