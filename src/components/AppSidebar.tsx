import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Wallet, HandCoins, CalendarDays, FileBarChart,
  Bell, Settings, LifeBuoy, Sprout, ShieldCheck, TrendingUp, MessageSquare,
  CreditCard, ClipboardList, Inbox, UserRound, Scissors,
} from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChama } from "@/context/chama-context";
import { getAccessStatus } from "@/lib/access.functions";
import { ROLE_LABELS, can, type Permission, type Role } from "@/lib/permissions";

type NavItem = { title: string; url: string; icon: any; perm?: Permission };

const SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
      { title: "My stats", url: "/member", icon: UserRound },
    ],
  },

  {
    label: "Members",
    items: [
      { title: "All members", url: "/members", icon: Users, perm: "members.view" },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Contributions", url: "/contributions", icon: Wallet, perm: "finance.view" },
      { title: "Deductions", url: "/deductions", icon: Scissors, perm: "finance.view" },
      { title: "Loans", url: "/loans", icon: HandCoins, perm: "loans.view" },
      { title: "Investments", url: "/investments", icon: TrendingUp, perm: "investments.view" },
    ],
  },
  {
    label: "Meetings",
    items: [
      { title: "Calendar & meetings", url: "/meetings", icon: CalendarDays, perm: "meetings.view" },
      { title: "Minutes desk", url: "/secretary", icon: ClipboardList, perm: "minutes.manage" },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Financial reports", url: "/reports", icon: FileBarChart, perm: "reports.view" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Announcements", url: "/feed", icon: MessageSquare },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Transparency",
    items: [
      { title: "Activity log", url: "/transparency", icon: ShieldCheck, perm: "transparency.view" },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Billing", url: "/billing", icon: CreditCard, perm: "billing.manage" },
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Help center", url: "/help", icon: LifeBuoy },
    ],
  },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");
  const { active } = useChama();
  const role = (active?.role ?? null) as Role | null;

  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  useEffect(() => {
    void getAccessStatus()
      .then((s) => setIsPlatformAdmin(s.isPlatformAdmin))
      .catch(() => undefined);
  }, []);

  const sections = SECTIONS.map((s) => ({
    label: s.label,
    items: s.items.filter((i) => !i.perm || can(role, i.perm)),
  })).filter((s) => s.items.length > 0);

  if (isPlatformAdmin) {
    sections.push({
      label: "Platform",
      items: [{ title: "Platform admin", url: "/admin", icon: Inbox }],
    });
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border group-data-[collapsible=icon]:p-1">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-2 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:rounded-lg">
            <Sprout className="h-5 w-5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-base font-bold text-sidebar-foreground">Chama-OS</div>
              <div className="truncate text-xs text-sidebar-foreground/60">
                {role ? ROLE_LABELS[role] : "Transparent records"}
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 group-data-[collapsible=icon]:px-0">
        {sections.map((section) => (
          <SidebarGroup key={section.label} className="group-data-[collapsible=icon]:p-1">
            <SidebarGroupLabel className="text-sidebar-foreground/50">{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={section.label + item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className="h-11 text-[15px] data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-semibold hover:bg-sidebar-accent group-data-[collapsible=icon]:!h-9 group-data-[collapsible=icon]:!w-9 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-0"
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                      >
                        <item.icon className="h-5 w-5 shrink-0 group-data-[collapsible=icon]:h-[18px] group-data-[collapsible=icon]:w-[18px]" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl bg-sidebar-accent p-3 text-sidebar-foreground">
          <div className="truncate text-xs font-medium opacity-70">{active?.name ?? "Your chama"}</div>
          <div className="mt-1 text-[11px] opacity-60">
            {role === "chairperson"
              ? "Invite members from the Members page."
              : "Contact your chairperson to invite others."}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
