export const chama = {
  name: "Umoja Investment Chama",
  location: "Nairobi, Kenya",
  motto: "Pamoja tunajenga",
  inviteCode: "UMOJA-2026",
  monthlyContribution: 5000,
};

export const currentUser = {
  name: "Wanjiku Kamau",
  firstName: "Wanjiku",
  role: "Treasurer",
  avatar: "",
  initials: "WK",
};

export const ksh = (n: number) =>
  "Ksh " + n.toLocaleString("en-KE", { maximumFractionDigits: 0 });

export type Kpi = {
  key: string; label: string; value: number; trend: number; icon: string;
  isCount?: boolean; isPercent?: boolean;
};
export const kpis: Kpi[] = [
  { key: "savings", label: "Total Savings", value: 2_845_000, trend: 12.4, icon: "wallet" },
  { key: "monthly", label: "Monthly Contributions", value: 184_500, trend: 8.2, icon: "trending" },
  { key: "loans", label: "Active Loans", value: 7, trend: -3.1, icon: "loan", isCount: true },
  { key: "repay", label: "Loan Repayment Rate", value: 94, trend: 2.7, icon: "check", isPercent: true },
  { key: "members", label: "Total Members", value: 28, trend: 4, icon: "users", isCount: true },
  { key: "pending", label: "Pending Contributions", value: 32_000, trend: -15, icon: "clock" },
];

export const savingsGrowth = [
  { month: "Jul", savings: 1_650_000 },
  { month: "Aug", savings: 1_820_000 },
  { month: "Sep", savings: 2_010_000 },
  { month: "Oct", savings: 2_280_000 },
  { month: "Nov", savings: 2_510_000 },
  { month: "Dec", savings: 2_690_000 },
  { month: "Jan", savings: 2_845_000 },
];

export const contributionBreakdown = [
  { name: "Savings", value: 62, color: "var(--color-primary)" },
  { name: "Welfare", value: 18, color: "var(--color-info)" },
  { name: "Projects", value: 14, color: "var(--color-warning)" },
  { name: "Penalties", value: 6, color: "var(--color-destructive)" },
];

export const loanAnalytics = [
  { month: "Sep", active: 5, repaid: 2, outstanding: 320_000 },
  { month: "Oct", active: 6, repaid: 3, outstanding: 410_000 },
  { month: "Nov", active: 8, repaid: 3, outstanding: 520_000 },
  { month: "Dec", active: 7, repaid: 5, outstanding: 460_000 },
  { month: "Jan", active: 7, repaid: 6, outstanding: 380_000 },
];

export type Member = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  role: "Chairperson" | "Treasurer" | "Secretary" | "Member";
  savings: number;
  contributions: number;
  loans: number;
  attendance: number;
  status: "Active" | "Pending" | "Defaulter";
};

export const members: Member[] = [
  { id: "M001", name: "Wanjiku Kamau", initials: "WK", phone: "+254 712 345 678", email: "wanjiku@umoja.co.ke", role: "Treasurer", savings: 185_000, contributions: 24, loans: 1, attendance: 96, status: "Active" },
  { id: "M002", name: "Otieno Ochieng", initials: "OO", phone: "+254 722 112 233", email: "otieno@umoja.co.ke", role: "Chairperson", savings: 210_500, contributions: 24, loans: 0, attendance: 100, status: "Active" },
  { id: "M003", name: "Akinyi Adhiambo", initials: "AA", phone: "+254 733 998 776", email: "akinyi@umoja.co.ke", role: "Secretary", savings: 142_000, contributions: 23, loans: 1, attendance: 92, status: "Active" },
  { id: "M004", name: "Mwangi Njoroge", initials: "MN", phone: "+254 701 222 333", email: "mwangi@umoja.co.ke", role: "Member", savings: 98_500, contributions: 22, loans: 1, attendance: 88, status: "Active" },
  { id: "M005", name: "Chebet Kiprop", initials: "CK", phone: "+254 715 555 444", email: "chebet@umoja.co.ke", role: "Member", savings: 121_000, contributions: 24, loans: 0, attendance: 95, status: "Active" },
  { id: "M006", name: "Achieng Onyango", initials: "AO", phone: "+254 720 666 111", email: "achieng@umoja.co.ke", role: "Member", savings: 76_000, contributions: 20, loans: 1, attendance: 80, status: "Active" },
  { id: "M007", name: "Kipchoge Rotich", initials: "KR", phone: "+254 718 444 555", email: "kipchoge@umoja.co.ke", role: "Member", savings: 64_500, contributions: 18, loans: 0, attendance: 72, status: "Pending" },
  { id: "M008", name: "Njeri Wairimu", initials: "NW", phone: "+254 705 333 222", email: "njeri@umoja.co.ke", role: "Member", savings: 154_000, contributions: 24, loans: 1, attendance: 98, status: "Active" },
  { id: "M009", name: "Barasa Wekesa", initials: "BW", phone: "+254 729 111 000", email: "barasa@umoja.co.ke", role: "Member", savings: 42_000, contributions: 14, loans: 1, attendance: 60, status: "Defaulter" },
  { id: "M010", name: "Halima Mohamed", initials: "HM", phone: "+254 733 222 444", email: "halima@umoja.co.ke", role: "Member", savings: 132_000, contributions: 23, loans: 0, attendance: 94, status: "Active" },
];

export type Contribution = {
  id: string;
  member: string;
  initials: string;
  type: "Savings" | "Welfare" | "Project" | "Penalty";
  amount: number;
  date: string;
  status: "Confirmed" | "Pending";
};

export const recentContributions: Contribution[] = [
  { id: "C1029", member: "Otieno Ochieng", initials: "OO", type: "Savings", amount: 5000, date: "2026-05-21", status: "Confirmed" },
  { id: "C1028", member: "Akinyi Adhiambo", initials: "AA", type: "Welfare", amount: 1500, date: "2026-05-21", status: "Confirmed" },
  { id: "C1027", member: "Mwangi Njoroge", initials: "MN", type: "Savings", amount: 5000, date: "2026-05-20", status: "Confirmed" },
  { id: "C1026", member: "Chebet Kiprop", initials: "CK", type: "Project", amount: 2500, date: "2026-05-20", status: "Confirmed" },
  { id: "C1025", member: "Njeri Wairimu", initials: "NW", type: "Savings", amount: 5000, date: "2026-05-19", status: "Confirmed" },
  { id: "C1024", member: "Kipchoge Rotich", initials: "KR", type: "Savings", amount: 5000, date: "2026-05-19", status: "Pending" },
  { id: "C1023", member: "Halima Mohamed", initials: "HM", type: "Penalty", amount: 500, date: "2026-05-18", status: "Confirmed" },
  { id: "C1022", member: "Achieng Onyango", initials: "AO", type: "Savings", amount: 5000, date: "2026-05-18", status: "Confirmed" },
];

export type Loan = {
  id: string;
  borrower: string;
  initials: string;
  amount: number;
  interest: number;
  due: string;
  paid: number;
  status: "Active" | "Overdue" | "Repaid";
};

export const loans: Loan[] = [
  { id: "L0042", borrower: "Wanjiku Kamau", initials: "WK", amount: 80_000, interest: 8, due: "2026-08-15", paid: 35_000, status: "Active" },
  { id: "L0041", borrower: "Akinyi Adhiambo", initials: "AA", amount: 50_000, interest: 8, due: "2026-07-01", paid: 42_000, status: "Active" },
  { id: "L0040", borrower: "Mwangi Njoroge", initials: "MN", amount: 120_000, interest: 10, due: "2026-09-30", paid: 60_000, status: "Active" },
  { id: "L0039", borrower: "Achieng Onyango", initials: "AO", amount: 40_000, interest: 8, due: "2026-06-10", paid: 18_000, status: "Active" },
  { id: "L0038", borrower: "Njeri Wairimu", initials: "NW", amount: 60_000, interest: 8, due: "2026-06-20", paid: 30_000, status: "Active" },
  { id: "L0037", borrower: "Barasa Wekesa", initials: "BW", amount: 35_000, interest: 10, due: "2026-04-30", paid: 10_000, status: "Overdue" },
  { id: "L0036", borrower: "Otieno Ochieng", initials: "OO", amount: 90_000, interest: 8, due: "2026-03-10", paid: 90_000, status: "Repaid" },
];

export const meetings = [
  { id: "MT-031", title: "Monthly Members Meeting", date: "2026-05-28", time: "19:00", location: "KCB Hall, Nairobi", agenda: "Loan approvals, May contributions review", status: "Upcoming", attendees: 0 },
  { id: "MT-030", title: "Loan Committee Sitting", date: "2026-05-15", time: "18:30", location: "Online — Zoom", agenda: "Review of 3 new loan applications", status: "Completed", attendees: 6 },
  { id: "MT-029", title: "AGM 2026", date: "2026-04-20", time: "10:00", location: "Sarova Stanley", agenda: "Annual reports & elections", status: "Completed", attendees: 26 },
  { id: "MT-028", title: "Welfare Committee", date: "2026-04-05", time: "17:00", location: "Online — Zoom", agenda: "Member welfare allocation Q1", status: "Completed", attendees: 5 },
];

export const notifications = [
  { id: 1, type: "reminder", title: "May contribution due in 3 days", body: "Ksh 5,000 — Pay by 25th May", time: "2h ago", unread: true },
  { id: 2, type: "loan", title: "Loan L0037 is overdue", body: "Barasa Wekesa — Ksh 25,000 outstanding", time: "5h ago", unread: true },
  { id: 3, type: "meeting", title: "Monthly meeting scheduled", body: "28th May at KCB Hall, 7:00 PM", time: "1d ago", unread: true },
  { id: 4, type: "announce", title: "AGM minutes published", body: "Read the official minutes from April AGM", time: "3d ago", unread: false },
  { id: 5, type: "loan", title: "Loan repayment received", body: "Otieno Ochieng cleared L0036", time: "5d ago", unread: false },
];

export const topContributors = members
  .slice()
  .sort((a, b) => b.savings - a.savings)
  .slice(0, 5);
