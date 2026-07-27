import { z } from "zod";

export const chamaTypes = [
  "investment", "welfare", "sacco", "table_banking",
  "women", "men", "youth", "church", "community",
] as const;

export const chamaRoles = ["chairperson", "treasurer", "secretary", "member"] as const;

export const findSimilarChamasSchema = z.object({
  name: z.string().min(2).max(120),
  location: z.string().max(200).optional().nullable(),
});

const rulesSchema = z.object({
  contribution_amount: z.number().min(0).max(10_000_000).default(0),
  contribution_frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"]).default("monthly"),
  late_penalty: z.number().min(0).max(1_000_000).default(0),
  meeting_cadence: z.enum(["weekly", "biweekly", "monthly", "quarterly"]).default("monthly"),
  meeting_day: z.string().max(40).default(""),
  quorum_percent: z.number().min(1).max(100).default(50),
  loan_approval_threshold: z.number().min(1).max(100).default(50),
  currency: z.string().min(2).max(8).default("KES"),
  description: z.string().max(500).default(""),
  founded_year: z.number().int().min(1900).max(2100).optional().nullable(),
  joining_fee: z.number().min(0).max(10_000_000).default(0),
  loan_interest_rate: z.number().min(0).max(100).default(0),
  loan_max_multiplier: z.number().min(0).max(20).default(3),
}).partial();

const inviteSeedSchema = z.object({
  email: z.string().email().max(255),
  role: z.enum(chamaRoles).default("member"),
});

export const createChamaSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(chamaTypes),
  location: z.string().max(200).optional().nullable(),
  rules: rulesSchema.optional(),
  invites: z.array(inviteSeedSchema).max(50).optional(),
});

export const joinChamaByCodeSchema = z.object({
  code: z.string().min(4).max(32).regex(/^[A-Za-z0-9_-]+$/),
});

export const setMemberRoleSchema = z.object({
  chamaId: z.string().uuid(),
  membershipId: z.string().uuid(),
  role: z.enum(chamaRoles),
});

export type FindSimilarChamasInput = z.infer<typeof findSimilarChamasSchema>;
export type CreateChamaInput = z.infer<typeof createChamaSchema>;
export type JoinChamaByCodeInput = z.infer<typeof joinChamaByCodeSchema>;
export type SetMemberRoleInput = z.infer<typeof setMemberRoleSchema>;