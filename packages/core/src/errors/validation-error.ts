export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationErrorOptions {
  message: string;
  issues: ValidationIssue[];
}

export class ValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(options: ValidationErrorOptions) {
    super(options.message);
    this.name = "ValidationError";
    this.issues = options.issues;
  }
}
