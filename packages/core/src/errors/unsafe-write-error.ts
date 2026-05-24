export interface UnsafeWriteErrorOptions {
  targetPath: string;
}

export class UnsafeWriteError extends Error {
  readonly targetPath: string;

  constructor(options: UnsafeWriteErrorOptions) {
    super(
      `Refusing to overwrite existing file without explicit overwrite option: ${options.targetPath}`
    );
    this.name = "UnsafeWriteError";
    this.targetPath = options.targetPath;
  }
}
