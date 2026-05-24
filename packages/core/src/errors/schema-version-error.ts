export interface SchemaVersionErrorOptions {
  filePath: string;
  foundVersion: unknown;
  supportedVersion: number;
}

export class SchemaVersionError extends Error {
  readonly filePath: string;
  readonly foundVersion: unknown;
  readonly supportedVersion: number;

  constructor(options: SchemaVersionErrorOptions) {
    super(
      `Unsupported schema version in ${options.filePath}: found ${String(
        options.foundVersion
      )}, supported ${options.supportedVersion}`
    );
    this.name = "SchemaVersionError";
    this.filePath = options.filePath;
    this.foundVersion = options.foundVersion;
    this.supportedVersion = options.supportedVersion;
  }
}
