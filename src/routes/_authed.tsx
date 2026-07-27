import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { getAccessStatus } from "@/lib/access.functions";
import { getMyProfile } from "@/lib/profile.functions";

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

  // Access gate: platform admin goes to the admin console, brand new people go
  // through onboarding, everyone else must have been added to a chama.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void Promise.all([getAccessStatus(), getMyProfile()])
      .then(([s, p]) => {
        if (cancelled) return;
        if (s.isPlatformAdmin) {
          navigate({ to: "/admin", replace: true });
          return;
        }
        const ok = s.memberships > 0 || s.canCreateChama;
        if (!ok) {
          setAllowed(false);
          navigate({ to: "/no-access", replace: true });
          return;
        }
        if (!p.onboarded || (s.memberships === 0 && s.canCreateChama)) {
          setAllowed(false);
          navigate({ to: "/onboarding", replace: true });
          return;
        }
        setAllowed(true);
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
