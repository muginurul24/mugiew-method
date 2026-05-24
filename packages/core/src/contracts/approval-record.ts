import { z, ZodError } from "zod";

import { ValidationError } from "../errors/validation-error.js";

export const CURRENT_APPROVAL_RECORD_SCHEMA_VERSION = 1;

export const APPROVAL_ARTIFACT_KEYS = [
  "PRD",
  "confidence-report",
  "ambiguity-report"
] as const;

export const approvalArtifactVersionsSchema = z.object({
  PRD: z.string().min(1),
  "confidence-report": z.string().min(1),
  "ambiguity-report": z.string().min(1)
});

export const approvalRecordSchema = z.object({
  schemaVersion: z.literal(CURRENT_APPROVAL_RECORD_SCHEMA_VERSION),
  approvedAt: z.string().min(1),
  approvedArtifactVersions: approvalArtifactVersionsSchema
});

export type ApprovalArtifactKey = (typeof APPROVAL_ARTIFACT_KEYS)[number];
export type ApprovalArtifactVersions = z.infer<
  typeof approvalArtifactVersionsSchema
>;
export type ApprovalRecord = z.infer<typeof approvalRecordSchema>;

export function parseApprovalRecord(data: unknown): ApprovalRecord {
  try {
    return approvalRecordSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError({
        message: "Invalid approval record.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    throw error;
  }
}
