import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Wallet, HandCoins, CalendarDays, FileBarChart,
  Bell, Settings, LifeBuoy, Sprout, ShieldCheck, TrendingUp, MessageSquare,
  CreditCard, ClipboardList,
} from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChama } from "@/context/chama-context";

type Role = "chairperson" | "treasurer" | "secretary" | "member";

type NavItem = { title: string; url: string; icon: any; roles?: Role[] };

const primary: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Members", url: "/members", icon: Users },
  { title: "Contributions", url: "/contributions", icon: Wallet },
  { title: "Loans", url: "/loans", icon: HandCoins },
  { title: "Investments", url: "/investments", icon: TrendingUp },
  { title: "Feed", url: "/feed", icon: MessageSquare },
];

const governance: NavItem[] = [
  { title: "Meetings", url: "/meetings", icon: CalendarDays },
  { title: "Secretary desk", url: "/secretary", icon: ClipboardList, roles: ["secretary", "chairperson"] },
  { title: "Reports", url: "/reports", icon: FileBarChart, roles: ["treasurer", "chairperson"] },
  { title: "Transparency log", url: "/transparency", icon: ShieldCheck },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const secondary: NavItem[] = [
  { title: "Billing", url: "/billing", icon: CreditCard, roles: ["chairperson"] },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help Center", url: "/help", icon: LifeBuoy },
];

function visible(items: NavItem[], role: Role | null) {
  if (!role) return items.filter((i) => !i.roles);
  return items.filter((i) => !i.roles || i.roles.includes(role));
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");
  const { active } = useChama();
  const role = (active?.role ?? null) as Role | null;

  const sections: Array<[string, NavItem[]]> = [
    ["Main", visible(primary, role)],
    ["Governance", visible(governance, role)],
    ["System", visible(secondary, role)],
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sprout className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-base font-bold text-sidebar-foreground">Chama-OS</div>
              <div className="text-xs text-sidebar-foreground/60">Transparent records</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {sections.map(([label, items]) => (
          <SidebarGroup key={label}>
            <SidebarGroupLabel className="text-sidebar-foreground/50">{label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className="h-11 text-[15px] data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-semibold hover:bg-sidebar-accent"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="rounded-xl bg-sidebar-accent p-3 text-sidebar-foreground">
            <div className="text-xs font-medium opacity-70">{active?.name ?? "Your chama"}</div>
            <div className="mt-1 text-[11px] opacity-60">
              {active?.role === "chairperson"
                ? "Invite members from the Members page."
                : "Contact your chairperson to invite others."}
            </div>
          </div>
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-accent text-sidebar-foreground">
            <Users className="h-4 w-4" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
