"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";

type Status = { enabled?: boolean };
type Setup = { secret?: string; uri?: string; otpauth_url?: string; qr_payload?: string };

export default function SecurityPage() {
  const qc = useQueryClient();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const status = useQuery({ queryKey: ["admin-totp-status"], queryFn: () => api.get<Status>("/v1/admin/mfa/totp/status") });
  const begin = useMutation({ mutationFn: () => api.post<Setup>("/v1/admin/mfa/totp/setup"), onSuccess: setSetup });
  const enable = useMutation({ mutationFn: () => api.post("/v1/admin/mfa/totp/confirm", { code }), onSuccess: () => { setSetup(null); setCode(""); qc.invalidateQueries({ queryKey: ["admin-totp-status"] }); } });
  const disable = useMutation({ mutationFn: () => api.delete("/v1/admin/mfa/totp/"), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-totp-status"] }) });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Security &amp; MFA</h1>
        <p className="text-sm text-muted-foreground">Protect administrator access with an authenticator app.</p>
      </div>
      <Card className="max-w-2xl p-6">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-1 h-6 w-6 text-primary" />
          <div className="flex-1">
            <h2 className="font-semibold">Authenticator app</h2>
            <p className="mt-1 text-sm text-muted-foreground">Status: {status.isLoading ? "Loading…" : status.data?.enabled ? "Enabled" : "Not enabled"}</p>
            {status.data?.enabled ? (
              <Button type="button" variant="destructive" className="mt-5" onClick={() => disable.mutate()} disabled={disable.isPending}>Disable MFA</Button>
            ) : setup ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm">Scan this QR code with Google Authenticator, Authy, or 1Password. The account will be labeled <strong>NGAMIA ADMIN</strong>.</p>
                {(setup.qr_payload ?? setup.otpauth_url ?? setup.uri) && <div className="flex justify-center rounded-lg border bg-white p-5"><QRCodeSVG value={setup.qr_payload ?? setup.otpauth_url ?? setup.uri ?? ""} size={220} includeMargin /></div>}
                <div><p className="mb-1 text-xs font-medium text-muted-foreground">Manual setup key</p><code className="block break-all rounded bg-muted p-3 text-xs">{setup.secret}</code></div>
                <div className="flex gap-2">
                  <Input inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" />
                  <Button type="button" onClick={() => enable.mutate()} disabled={code.length !== 6 || enable.isPending}>Enable MFA</Button>
                </div>
              </div>
            ) : (
              <Button type="button" className="mt-5" onClick={() => begin.mutate()} disabled={begin.isPending}>{begin.isPending ? "Preparing…" : "Set up MFA"}</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
