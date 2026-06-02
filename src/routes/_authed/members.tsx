import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Filter, MoreVertical, Copy, Check, Loader2, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { members as mockMembers, ksh } from "@/lib/mock-data";
import { useChama } from "@/context/chama-context";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import { listChamaInvites, revokeInvite } from "@/lib/invites.functions";

export const Route = createFileRoute("/_authed/members")({
  component: MembersPage,
});

type Invite = {
  id: string; email: string; role: string; status: string; token: string; created_at: string;
};

const roleColor: Record<string, string> = {
  Chairperson: "bg-navy/10 text-navy hover:bg-navy/10",
  Treasurer: "bg-primary/10 text-primary hover:bg-primary/10",
  Secretary: "bg-info/10 text-info hover:bg-info/10",
  Member: "bg-muted text-muted-foreground hover:bg-muted",
};
const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success hover:bg-success/10",
  Pending: "bg-warning/15 text-warning hover:bg-warning/15",
  Defaulter: "bg-destructive/10 text-destructive hover:bg-destructive/10",
};

function MembersPage() {
  const { active } = useChama();
  const isChair = active?.role === "chairperson";
  const list = useServerFn(listChamaInvites);
  const revoke = useServerFn(revokeInvite);
  const [invites, setInvites] = useState<Invite[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refresh = async () => {
    if (!active || !isChair) return;
    try {
      const rows = (await list({ data: { chamaId: active.id } })) as Invite[];
      setInvites(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load invites");
    }
  };

  useEffect(() => { void refresh(); }, [active?.id, isChair]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyLink = async (inv: Invite) => {
    const link = `${window.location.origin}/login?invite=${inv.token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const onRevoke = async (id: string) => {
    setBusyId(id);
    try {
      await revoke({ data: { inviteId: id } });
      toast.success("Invite revoked");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke");
    } finally {
      setBusyId(null);
    }
  };

  const pending = (invites ?? []).filter((i) => i.status === "pending");

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Members"
        description={isChair ? "Invite members by email and assign their role." : "Members of your chama."}
        actions={
          isChair && active ? (
            <InviteMemberDialog chamaId={active.id} onInvited={refresh} />
          ) : (
            <Badge variant="outline" className="h-9 rounded-xl px-3">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Only the chairperson can invite
            </Badge>
          )
        }
      />

      {isChair && (
        <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Pending invitations</h2>
            <p className="text-sm text-muted-foreground">
              People you've invited who haven't signed in yet. Email delivery is coming soon — share the link with them in the meantime.
            </p>
          </div>
          {invites === null ? (
            <div className="grid place-items-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : pending.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No pending invitations. Invite your first member above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Role</TableHead>
                  <TableHead className="text-foreground">Invited</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((inv) => (
                  <TableRow key={inv.id} className="text-[15px]">
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 capitalize">
                        {inv.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={() => copyLink(inv)}>
                          {copiedId === inv.id ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                          {copiedId === inv.id ? "Copied" : "Copy link"}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={busyId === inv.id}
                          onClick={() => onRevoke(inv.id)}
                        >
                          {busyId === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, phone or email…" className="h-11 rounded-xl pl-10 text-[15px]" />
          </div>
          <Button variant="outline" className="h-11 rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-foreground">Member</TableHead>
                <TableHead className="text-foreground">Role</TableHead>
                <TableHead className="text-foreground">Contact</TableHead>
                <TableHead className="text-right text-foreground">Savings</TableHead>
                <TableHead className="text-right text-foreground">Loans</TableHead>
                <TableHead className="text-right text-foreground">Attendance</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMembers.map((m) => (
                <TableRow key={m.id} className="text-[15px]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={roleColor[m.role]}>{m.role}</Badge></TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{m.phone}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{ksh(m.savings)}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.loans}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.attendance}%</TableCell>
                  <TableCell><Badge className={statusColor[m.status]}>{m.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">
          {isChair
            ? "Demo data shown. Real members appear here once they accept their invitations."
            : "Demo data shown for preview purposes."}
        </div>
      </div>

    </div>
  );
}

