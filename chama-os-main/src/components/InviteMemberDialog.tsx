import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { inviteMember } from "@/lib/invites.functions";

type Props = {
  chamaId: string;
  trigger?: React.ReactNode;
  onInvited?: () => void;
};

export function InviteMemberDialog({ chamaId, trigger, onInvited }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "treasurer" | "secretary" | "chairperson">("member");
  const [busy, setBusy] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const invite = useServerFn(inviteMember);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await invite({ data: { chamaId, email, role } });
      const link = `${window.location.origin}/login?invite=${res.token}`;
      setLastLink(link);
      toast.success(res.alreadyExisted ? "Invite already pending — link copied below." : "Invite created.");
      setEmail("");
      onInvited?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send invite");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!lastLink) return;
    await navigator.clipboard.writeText(lastLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setLastLink(null); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="h-11 rounded-xl font-semibold">
            <Mail className="mr-2 h-4 w-4" /> Invite member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            They'll see this chama after signing in with the same Google email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="chairperson">Chairperson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lastLink && (
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Email sending is coming soon. Share this link with them for now:
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-background px-2 py-1.5 text-xs">{lastLink}</code>
                <Button type="button" variant="outline" size="sm" onClick={copy} className="h-8">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {busy ? "Inviting…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
