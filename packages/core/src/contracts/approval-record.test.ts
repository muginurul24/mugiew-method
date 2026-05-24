import { describe, expect, it } from "vitest";

import { ValidationError } from "../errors/validation-error.js";
import { parseApprovalRecord } from "./approval-record.js";

describe("approval record contract", () => {
  it("parses a valid approval record", () => {
    expect(
      parseApprovalRecord({
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: "mtime:1:size:1",
          "confidence-report": "mtime:2:size:2",
          "ambiguity-report": "mtime:3:size:3"
        }
      })
    ).toEqual({
      schemaVersion: 1,
      approvedAt: "2026-05-24T00:00:00.000Z",
      approvedArtifactVersions: {
        PRD: "mtime:1:size:1",
        "confidence-report": "mtime:2:size:2",
        "ambiguity-report": "mtime:3:size:3"
      }
    });
  });

  it("rejects missing approved artifact versions", () => {
    expect(() =>
      parseApprovalRecord({
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z"
      })
    ).toThrow(ValidationError);
  });

  it("rejects missing required artifact keys", () => {
    expect(() =>
      parseApprovalRecord({
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: "mtime:1:size:1",
          "confidence-report": "mtime:2:size:2"
        }
      })
    ).toThrow(ValidationError);
  });

  it("rejects wrong schema version", () => {
    expect(() =>
      parseApprovalRecord({
        schemaVersion: 2,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: "mtime:1:size:1",
          "confidence-report": "mtime:2:size:2",
          "ambiguity-report": "mtime:3:size:3"
        }
      })
    ).toThrow(ValidationError);
  });
});
