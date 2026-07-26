import { useChama } from "@/context/chama-context";
import { can, type Permission, type Role } from "@/lib/permissions";

export function usePermissions() {
  const { active } = useChama();
  const role = (active?.role ?? null) as Role | null;
  return {
    role,
    can: (permission: Permission) => can(role, permission),
    isChair: role === "chairperson",
  };
}
