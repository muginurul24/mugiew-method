export class ProjectRootNotFoundError extends Error {
  constructor(startDirectory: string) {
    super(`Unable to detect project root from ${startDirectory}`);
    this.name = "ProjectRootNotFoundError";
  }
}
