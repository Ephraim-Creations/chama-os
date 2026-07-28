export type Role = "chairperson" | "treasurer" | "secretary" | "member";

/** Every capability the app gates on. Keep names verb-less and area based. */
export type Permission =
  | "members.view"
  | "members.manage"
  | "members.invite"
  | "finance.view"
  | "finance.manage"
  | "finance.deduct"
  | "loans.view"
  | "loans.manage"
  | "loans.approve"
  | "investments.view"
  | "investments.manage"
  | "meetings.view"
  | "meetings.manage"
  | "minutes.manage"
  | "reports.view"
  | "documents.view"
  | "transparency.view"
  | "settings.manage"
  | "billing.manage";

const MEMBER: Permission[] = [
  "members.view",
  "finance.view",
  "loans.view",
  "investments.view",
  "meetings.view",
  "reports.view",
  "documents.view",
  "transparency.view",
];

const SECRETARY: Permission[] = [
  ...MEMBER,
  "meetings.manage",
  "minutes.manage",
  "members.invite",
];

const TREASURER: Permission[] = [
  ...MEMBER,
  "finance.manage",
  "finance.deduct",
  "loans.manage",
  "investments.manage",
];

const CHAIRPERSON: Permission[] = [
  ...MEMBER,
  ...SECRETARY,
  ...TREASURER,
  "members.manage",
  "members.invite",
  "loans.approve",
  "settings.manage",
  "billing.manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  chairperson: Array.from(new Set(CHAIRPERSON)),
  treasurer: Array.from(new Set(TREASURER)),
  secretary: Array.from(new Set(SECRETARY)),
  member: MEMBER,
};

export const ROLE_LABELS: Record<Role, string> = {
  chairperson: "Chairperson",
  treasurer: "Treasurer",
  secretary: "Secretary",
  member: "Member",
};

export function can(role: Role | null | undefined, permission: Permission) {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
