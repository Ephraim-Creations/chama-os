import { useEffect, useState } from "react";
import { Search, ChevronDown, Check, Users, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useChama } from "@/context/chama-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsBell } from "@/components/NotificationsBell";


const roleLabels: Record<string, string> = {
  chairperson: "Chairperson", treasurer: "Treasurer", secretary: "Secretary", member: "Member",
};


export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { chamas, active, setActiveId } = useChama();
  const [profile, setProfile] = useState<{ full_name: string | null; display_name: string | null; avatar_url: string | null } | null>(null);




  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    const loadProfile = () => {
      void supabase
        .from("profiles")
        .select("full_name, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled && data) setProfile(data);
        });
    };
    loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => {
      cancelled = true;
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, [user?.id]);

  const fullName =
    profile?.display_name?.trim() ||
    profile?.full_name?.trim() ||
    (user?.user_metadata?.full_name as string) ||
    user?.email ||
    "Member";
  const firstName = fullName.split(" ")[0];


  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="h-10 w-10" />

      {/* Chama switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-11 max-w-[260px] items-center gap-2 rounded-xl border border-border bg-card px-3 hover:bg-muted">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="hidden min-w-0 text-left leading-tight md:block">
              <div className="truncate text-sm font-semibold text-foreground">{active?.name ?? "Select chama"}</div>
              <div className="text-[11px] text-muted-foreground">{active ? roleLabels[active.role] : "—"}</div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Your chamas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {chamas.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setActiveId(c.id)} className="gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">{roleLabels[c.role]}</div>
              </div>
              {active?.id === c.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/create-chama"><Plus className="mr-2 h-4 w-4" /> Create a new chama</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden flex-col leading-tight md:flex">
        <div className="text-sm font-semibold text-foreground">Habari, {firstName} 👋</div>
        <div className="text-xs text-muted-foreground">{active?.location ?? ""}</div>
      </div>

      <div className="relative ml-auto hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members, loans, contributions…"
          className="h-11 rounded-xl border-border bg-muted/50 pl-10 text-[15px]"
        />
      </div>

      <ThemeToggle />

      <NotificationsBell />


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-11 items-center gap-2 rounded-xl px-2 hover:bg-muted">
            <UserAvatar name={fullName} path={profile?.avatar_url} className="h-9 w-9" />
            <div className="hidden text-left leading-tight md:block">
              <div className="text-sm font-semibold text-foreground">{fullName}</div>
              <div className="text-xs text-muted-foreground">{active ? roleLabels[active.role] : ""}</div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/settings">Profile & Settings</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/dashboard">Switch chama</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/help">Help Center</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
