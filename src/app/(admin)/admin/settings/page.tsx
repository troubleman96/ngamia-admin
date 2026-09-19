"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSettings, useUpsertAdminSetting } from "@/lib/api/hooks/admin";

const SETTING_DEFS: Record<
  string,
  { label: string; description: string; type: "number" }
> = {
  tzs_to_credit_rate: {
    label: "TZS → credit rate",
    description: "Credits earned per 1 TZS on top-up.",
    type: "number",
  },
  otp_ttl_seconds: {
    label: "OTP expiry (seconds)",
    description: "How long a verification code stays valid.",
    type: "number",
  },
  default_low_balance_threshold: {
    label: "Low balance threshold",
    description: "Default credits before a low-balance alert is sent.",
    type: "number",
  },
  auth_rate_limit_per_minute: {
    label: "Auth rate limit / min",
    description: "Max auth requests per user per minute.",
    type: "number",
  },
};

export default function AdminSettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const upsert = useUpsertAdminSetting();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const handleSave = (key: string) => {
    const raw = drafts[key];
    if (raw === undefined) return;
    const value = Number(raw);
    upsert.mutate(
      { key, value },
      {
        onSuccess: () => {
          toast.success("Setting saved");
          setDrafts((d) => {
            const next = { ...d };
            delete next[key];
            return next;
          });
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (

      <div className="space-y-5">
        <div><h1 className="text-2xl font-semibold tracking-tight">Platform settings</h1><p className="mt-1 text-sm text-muted-foreground">Manage system values used across Ngamia services.</p></div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(SETTING_DEFS).map(([key, def]) => {
              const current = data?.[key];
              const draftValue =
                drafts[key] ?? (current !== undefined ? String(current) : "");
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                      {def.label}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {def.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">{key}</Label>
                      <Input
                        type="number"
                        value={draftValue}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [key]: e.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSave(key)}
                      disabled={upsert.isPending}
                    >
                      Save
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

  );
}
