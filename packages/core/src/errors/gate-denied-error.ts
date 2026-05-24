export interface GateDeniedErrorOptions {
  message: string;
  failedConditions: string[];
}

export class GateDeniedError extends Error {
  readonly failedConditions: string[];
  readonly exitCode = 3;

  constructor(options: GateDeniedErrorOptions) {
    super(options.message);
    this.name = "GateDeniedError";
    this.failedConditions = options.failedConditions;
  }
}
