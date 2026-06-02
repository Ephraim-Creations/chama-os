import { Bell, Search, ChevronDown, Check, Users, LogOut, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useChama } from "@/context/chama-context";
import { ThemeToggle } from "@/components/ThemeToggle";

const roleLabels: Record<string, string> = {
  chairperson: "Chairperson", treasurer: "Treasurer", secretary: "Secretary", member: "Member",
};

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { chamas, active, setActiveId } = useChama();

  const fullName = (user?.user_metadata?.full_name as string) || user?.email || "Member";
  const firstName = fullName.split(" ")[0];
  const initials = initialsOf(fullName) || "?";

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
          <DropdownMenuItem asChild><Link to="/app/create"><Plus className="mr-2 h-4 w-4" /> Create a new chama</Link></DropdownMenuItem>
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

      <Button variant="ghost" size="icon" asChild className="relative h-11 w-11">
        <Link to="/notifications" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 rounded-full bg-destructive p-0 px-1 text-[10px] text-destructive-foreground">
            3
          </Badge>
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-11 items-center gap-2 rounded-xl px-2 hover:bg-muted">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>
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
          <DropdownMenuItem asChild><Link to="/app">Switch chama</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/help">Help Center</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
