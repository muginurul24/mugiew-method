import { z, ZodError } from "zod";

import { ValidationError } from "../errors/validation-error.js";

export const taskFileSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    concern: z.string().min(1),
    sourcePrdIds: z.array(z.string().min(1)).min(1),
    dependencies: z.array(z.string().min(1)),
    acceptanceCriteria: z.array(z.string().min(1)).min(1),
    validationCommands: z.array(z.string().min(1)).min(1),
    expectedFilesOrAreas: z.array(z.string().min(1)).min(1),
    rollbackNotes: z.string().min(1)
  })
  .strict();

export type TaskFile = z.infer<typeof taskFileSchema>;

export function parseTaskFile(data: unknown): TaskFile {
  try {
    return taskFileSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError({
        message: "Invalid task file.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    throw error;
  }
}
