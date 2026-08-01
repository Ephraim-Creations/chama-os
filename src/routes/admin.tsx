import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard, Building2, Tags, Megaphone, Inbox, ArrowLeft, CreditCard, MessageSquare, Mail, BarChart3, LifeBuoy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getAccessStatus } from "@/lib/access.functions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Platform admin — Chama-OS" },
      { name: "description", content: "Manage chamas, pricing and announcements across Chama-OS." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/chamas", label: "Groups", icon: Building2 },
  { to: "/admin/applications", label: "Applications", icon: Inbox },
  { to: "/admin/pricing", label: "Pricing", icon: Tags },
  { to: "/admin/billing", label: "Billing", icon: CreditCard },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void getAccessStatus()
      .then((s) => !cancelled && setIsAdmin(s.isPlatformAdmin))
      .catch(() => !cancelled && setIsAdmin(false));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || isAdmin === null) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">Platform admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is for the Chama-OS team. Your chama tools live in your dashboard.
          </p>
          <Button asChild className="mt-5 h-11 rounded-xl font-semibold">
            <Link to="/dashboard">Go to my dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              Admin
            </span>
            <span className="text-base font-bold text-foreground">Chama-OS platform</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="h-9 rounded-lg">
              <Link to="/dashboard">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> App
              </Link>
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-4 pb-2 md:px-8">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
