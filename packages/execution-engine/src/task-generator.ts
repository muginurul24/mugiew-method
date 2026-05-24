import { type TaskFile, parseTaskFile } from "@mugiew-method/core";

export interface TaskConcernInput {
  title: string;
  concern: string;
  sourcePrdIds: string[];
  acceptanceCriteria: string[];
  validationCommands: string[];
  expectedFilesOrAreas: string[];
  rollbackNotes: string;
  dependencies?: string[];
}

export interface GenerateTasksFromConcernsOptions {
  idPrefix?: string;
  concerns: TaskConcernInput[];
}

export function generateTasksFromConcerns(
  options: GenerateTasksFromConcernsOptions
): TaskFile[] {
  const idPrefix = options.idPrefix ?? "TASK";

  return options.concerns.map((concern, index) =>
    parseTaskFile({
      id: `${idPrefix}-${String(index + 1).padStart(3, "0")}`,
      title: concern.title,
      concern: concern.concern,
      sourcePrdIds: concern.sourcePrdIds,
      dependencies: concern.dependencies ?? [],
      acceptanceCriteria: concern.acceptanceCriteria,
      validationCommands: concern.validationCommands,
      expectedFilesOrAreas: concern.expectedFilesOrAreas,
      rollbackNotes: concern.rollbackNotes
    })
  );
}
