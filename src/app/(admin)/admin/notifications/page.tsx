"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Mail, MessageSquare, Sparkles, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";

type Broadcast = { id?: string; subject?: string; channels?: string[]; audience?: string; sent_count?: number; failed_count?: number };
const channelIcons = { in_app: Bell, email: Mail, sms: Smartphone };

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [channels, setChannels] = useState<string[]>(["in_app"]);
  const [drafting, setDrafting] = useState(false);
  const logs = useQuery({ queryKey: ["admin-broadcasts"], queryFn: () => api.get<Broadcast[]>("/v1/admin/notifications/broadcasts") });
  const send = useMutation({ mutationFn: () => api.post("/v1/admin/notifications/broadcast", { subject, message, audience, channels }), onSuccess: () => { setSubject(""); setMessage(""); qc.invalidateQueries({ queryKey: ["admin-broadcasts"] }); } });
  const toggle = (channel: string) => setChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);
  const draftWithNgamia = async () => {
    setDrafting(true);
    try {
      const result = await api.post<{ choices?: Array<{ message?: { content?: string }; text?: string }> }>("/v1/chat/completions", {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "system", content: "Write concise, trustworthy marketing announcements for Ngamia, an African AI API platform. Return exactly two lines: SUBJECT: ... and MESSAGE: ... Use {{first_name}} when natural. Do not invent prices or claims." }, { role: "user", content: "Draft a product announcement highlighting the Ngamia API, reliable usage tracking, and mobile-money top-ups. Keep the message under 300 characters." }],
        temperature: 0.7,
      });
      const content = result.choices?.[0]?.message?.content ?? result.choices?.[0]?.text ?? "";
      const subjectMatch = content.match(/SUBJECT:\s*(.+)/i);
      const messageMatch = content.match(/MESSAGE:\s*([\s\S]+)/i);
      if (subjectMatch) setSubject(subjectMatch[1].trim());
      if (messageMatch) setMessage(messageMatch[1].trim());
      if (!subjectMatch && !messageMatch) setMessage(content.trim());
    } finally { setDrafting(false); }
  };

  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold tracking-tight">Broadcasts</h1><p className="mt-1 text-sm text-muted-foreground">Send operational messages across Ngamia channels.</p></div>
    <div className="grid gap-4 xl:grid-cols-2">
      <Card><CardHeader className="border-b"><CardTitle>Compose broadcast</CardTitle><CardDescription>Use {'{{first_name}}'} to personalize the message.</CardDescription></CardHeader><CardContent className="pt-5">
        <form onSubmit={(event) => { event.preventDefault(); send.mutate(); }} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={160} /></div>
          <div className="flex items-center justify-between gap-3"><Label htmlFor="message">Message</Label><Button type="button" variant="outline" size="sm" onClick={() => void draftWithNgamia()} disabled={drafting}><Sparkles className="mr-1.5 h-3.5 w-3.5" />{drafting ? "Drafting…" : "Draft with Ngamia"}</Button></div><textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} required rows={6} className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30" />
          <div className="space-y-2"><Label htmlFor="audience">Audience</Label><select id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="all">All users</option><option value="active">Active users</option><option value="specific">Specific users</option></select></div>
          <fieldset className="space-y-2"><legend className="text-sm font-medium">Channels</legend><div className="flex flex-wrap gap-2">{(["in_app", "email", "sms"] as const).map((channel) => { const Icon = channelIcons[channel]; const selected = channels.includes(channel); return <Button key={channel} type="button" variant={selected ? "default" : "outline"} size="sm" aria-pressed={selected} onClick={() => toggle(channel)}><Icon className="mr-1.5 h-3.5 w-3.5" />{channel.replace("_", " ")}</Button>; })}</div></fieldset>
          <div className="flex items-center gap-3"><Button type="submit" disabled={send.isPending || !channels.length}>{send.isPending ? "Sending…" : "Send broadcast"}</Button>{send.isSuccess && <span role="status" className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Broadcast submitted</span>}{send.isError && <span role="alert" className="text-sm text-destructive">Broadcast failed. Check the API response.</span>}</div>
        </form>
      </CardContent></Card>

      <Card><CardHeader className="border-b"><CardTitle>Broadcast history</CardTitle><CardDescription>Recent delivery totals</CardDescription></CardHeader>
        {logs.isLoading ? <CardContent className="space-y-3 py-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent> : logs.isError ? <CardContent className="py-6 text-sm text-destructive">Broadcast history could not be loaded.</CardContent> : (logs.data ?? []).length ? <CardContent className="divide-y p-0">{(logs.data ?? []).map((item, index) => <div key={item.id ?? index} className="space-y-2 p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{item.subject ?? "Untitled broadcast"}</p><Badge variant="outline" className="capitalize">{item.audience ?? "all users"}</Badge></div><p className="text-xs capitalize text-muted-foreground">{(item.channels ?? []).join(" · ").replaceAll("_", " ") || "No channels"}</p><p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{item.sent_count ?? 0}</span> sent <span className="px-1">·</span><span className="font-medium text-foreground">{item.failed_count ?? 0}</span> failed</p></div>)}</CardContent> : <CardContent><div className="empty-state"><div className="empty-state-icon"><MessageSquare className="h-5 w-5" /></div><p className="empty-state-title">No broadcasts sent</p><p className="empty-state-description">Submitted messages will appear here.</p></div></CardContent>}
      </Card>
    </div>
  </div>;
}
