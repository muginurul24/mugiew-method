export interface MissingInstallationErrorOptions {
  projectRoot: string;
}

export class MissingInstallationError extends Error {
  readonly projectRoot: string;
  readonly suggestedAction = "Run `mugiew-method install` first.";

  constructor(options: MissingInstallationErrorOptions) {
    super(`Mugiew Method is not installed in ${options.projectRoot}.`);
    this.name = "MissingInstallationError";
    this.projectRoot = options.projectRoot;
  }
}
