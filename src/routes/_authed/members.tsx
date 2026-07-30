import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Copy, Check, Loader2, X, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ksh, initialsOf } from "@/lib/mock-data";
import { useChama } from "@/context/chama-context";
import { useSnapshot } from "@/hooks/use-snapshot";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import { listChamaInvites, revokeInvite } from "@/lib/invites.functions";
import { setMemberRole } from "@/lib/chama.functions";

import { ROLE_LABELS } from "@/lib/permissions";

export const Route = createFileRoute("/_authed/members")({
  component: MembersPage,
});

type Invite = {
  id: string; email: string; role: string; status: string; token: string; created_at: string;
};

const roleColor: Record<string, string> = {
  chairperson: "bg-navy/10 text-navy hover:bg-navy/10",
  treasurer: "bg-primary/10 text-primary hover:bg-primary/10",
  secretary: "bg-info/10 text-info hover:bg-info/10",
  member: "bg-muted text-muted-foreground hover:bg-muted",
};

function MembersPage() {
  const { active } = useChama();
  const isChair = active?.role === "chairperson";
  const { snapshot, loading, refresh } = useSnapshot();
  const list = useServerFn(listChamaInvites);
  const revoke = useServerFn(revokeInvite);
  const changeRole = useServerFn(setMemberRole);
  const resetPin = useServerFn(resetMemberPin);

  const [invites, setInvites] = useState<Invite[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const refreshInvites = async () => {
    if (!active || !isChair) return;
    try {
      const rows = (await list({ data: { chamaId: active.id } })) as Invite[];
      setInvites(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load invites");
    }
  };

  useEffect(() => { void refreshInvites(); }, [active?.id, isChair]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyLink = async (inv: Invite) => {
    await navigator.clipboard.writeText(`${window.location.origin}/login?invite=${inv.token}`);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const onRevoke = async (id: string) => {
    setBusyId(id);
    try {
      await revoke({ data: { inviteId: id } });
      toast.success("Invite revoked");
      await refreshInvites();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke");
    } finally {
      setBusyId(null);
    }
  };

  const onRoleChange = async (membershipId: string, role: string) => {
    if (!active) return;
    setBusyId(membershipId);
    try {
      await changeRole({ data: { chamaId: active.id, membershipId, role: role as any } });
      toast.success("Role updated");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role");
    } finally {
      setBusyId(null);
    }
  };

  const onResetPin = async (memberUserId: string) => {
    if (!active) return;
    setBusyId(memberUserId);
    try {
      await resetPin({ data: { chamaId: active.id, memberUserId } });
      toast.success("PIN cleared — they can set a new one at sign-in");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset PIN");
    } finally {
      setBusyId(null);
    }
  };

  const pending = (invites ?? []).filter((i) => i.status === "pending");
  const members = useMemo(() => {
    const rows = snapshot?.members ?? [];
    const q = query.trim().toLowerCase();
    return q ? rows.filter((m) => m.displayName.toLowerCase().includes(q)) : rows;
  }, [snapshot, query]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Members"
        description={isChair ? "Invite members by email and assign their role." : "Members of your chama."}
        actions={
          isChair && active ? (
            <InviteMemberDialog chamaId={active.id} onInvited={refreshInvites} />
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
              People you've invited who haven't signed in yet. They receive an email with a link to set their password.
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
                      <Badge className="bg-primary/10 capitalize text-primary hover:bg-primary/10">{inv.role}</Badge>
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
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="h-11 rounded-xl pl-10 text-[15px]"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Invite people by email — they join automatically when they sign in."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-foreground">Member</TableHead>
                  <TableHead className="text-foreground">Role</TableHead>
                  <TableHead className="text-right text-foreground">Savings</TableHead>
                  <TableHead className="text-right text-foreground">Entries</TableHead>
                  <TableHead className="text-right text-foreground">Active loans</TableHead>
                  {isChair && <TableHead className="text-right text-foreground">Security</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id} className="text-[15px]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                            {initialsOf(m.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{m.displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            Joined {new Date(m.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isChair && m.role !== "chairperson" ? (
                        <Select
                          value={m.role}
                          disabled={busyId === m.id}
                          onValueChange={(v) => onRoleChange(m.id, v)}
                        >
                          <SelectTrigger className="h-10 w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="treasurer">Treasurer</SelectItem>
                            <SelectItem value="secretary">Secretary</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={roleColor[m.role]}>{ROLE_LABELS[m.role]}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{ksh(m.savings)}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.contributions}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.activeLoans}</TableCell>
                    {isChair && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-lg"
                          disabled={busyId === m.userId}
                          onClick={() => onResetPin(m.userId)}
                        >
                          {busyId === m.userId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><KeyRound className="mr-1.5 h-3.5 w-3.5" /> Reset PIN</>
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
