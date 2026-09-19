"use client";
import { UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAdminProfile } from "@/lib/api/client";
export default function ProfilePage() {
  const profile = getAdminProfile();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Administrator profile</h1>
        <p className="text-sm text-muted-foreground">Your current admin identity and access level.</p>
      </div>
      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {(profile?.full_name ?? profile?.email ?? "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold">{profile?.full_name ?? "Administrator"}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email ?? "Email unavailable"}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{profile?.role ?? "admin"}</p>
          </div>
          <UserRound className="ml-auto h-5 w-5 text-muted-foreground" />
        </div>
      </Card>
    </div>
  );
}
