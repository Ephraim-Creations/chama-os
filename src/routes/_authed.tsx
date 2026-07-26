import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { getAccessStatus } from "@/lib/access.functions";

export const Route = createFileRoute("/_authed")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  // Access gate: you may be here only if a chair added you to a chama, or you
  // were approved to open one. Decided server-side from the JWT email claim.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void getAccessStatus()
      .then((s) => {
        if (cancelled) return;
        const ok = s.memberships > 0 || s.canCreateChama;
        setAllowed(ok);
        if (!ok) navigate({ to: "/no-access", replace: true });
      })
      .catch(() => {
        if (!cancelled) setAllowed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, pathname, navigate]);

  if (!user || allowed === null) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
