import { z, ZodError } from "zod";

import { ValidationError } from "../errors/validation-error.js";

export const CURRENT_AMBIGUITY_REPORT_SCHEMA_VERSION = 1;

export const AMBIGUITY_CATEGORIES = [
  "blocking-ambiguity",
  "non-blocking-ambiguity",
  "assumption"
] as const;

export const AMBIGUITY_OWNERS = ["user", "ai", "system"] as const;
export const AMBIGUITY_STATUSES = ["open", "resolved"] as const;
export const ASSUMPTION_CONFIRMATION_STATES = [
  "unconfirmed",
  "confirmed"
] as const;

export const ambiguityCategorySchema = z.enum(AMBIGUITY_CATEGORIES);
export const ambiguityOwnerSchema = z.enum(AMBIGUITY_OWNERS);
export const ambiguityStatusSchema = z.enum(AMBIGUITY_STATUSES);
export const assumptionConfirmationStateSchema = z.enum(
  ASSUMPTION_CONFIRMATION_STATES
);

const ambiguityBaseSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  impact: z.string().min(1),
  owner: ambiguityOwnerSchema,
  status: ambiguityStatusSchema,
  resolution: z.string()
});

export const blockingAmbiguitySchema = ambiguityBaseSchema.extend({
  category: z.literal("blocking-ambiguity"),
  blockingReason: z.string().min(1)
});

export const nonBlockingAmbiguitySchema = ambiguityBaseSchema.extend({
  category: z.literal("non-blocking-ambiguity"),
  defaultHandlingStrategy: z.string().min(1)
});

export const assumptionSchema = ambiguityBaseSchema.extend({
  category: z.literal("assumption"),
  confirmationState: assumptionConfirmationStateSchema
});

export const ambiguitySchema = z.discriminatedUnion("category", [
  blockingAmbiguitySchema,
  nonBlockingAmbiguitySchema,
  assumptionSchema
]);

export const ambiguityReportSchema = z.object({
  schemaVersion: z.literal(CURRENT_AMBIGUITY_REPORT_SCHEMA_VERSION),
  updatedAt: z.string().min(1),
  ambiguities: z.array(ambiguitySchema)
});

export type AmbiguityCategory = z.infer<typeof ambiguityCategorySchema>;
export type AmbiguityOwner = z.infer<typeof ambiguityOwnerSchema>;
export type AmbiguityStatus = z.infer<typeof ambiguityStatusSchema>;
export type AssumptionConfirmationState = z.infer<
  typeof assumptionConfirmationStateSchema
>;
export type Ambiguity = z.infer<typeof ambiguitySchema>;
export type AmbiguityReport = z.infer<typeof ambiguityReportSchema>;

export function parseAmbiguityReport(data: unknown): AmbiguityReport {
  try {
    return ambiguityReportSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError({
        message: "Invalid ambiguity report.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    throw error;
  }
}
