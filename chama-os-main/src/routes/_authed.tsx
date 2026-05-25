import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { useChama } from "@/context/chama-context";

export const Route = createFileRoute("/_authed")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <ChamaGate>
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
    </ChamaGate>
  );
}

function ChamaGate({ children }: { children: React.ReactNode }) {
  const { active, loading } = useChama();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !active) navigate({ to: "/app" });
  }, [loading, active, navigate]);
  if (loading || !active) return null;
  return <>{children}</>;
}
