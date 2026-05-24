import type {
  Ambiguity,
  AmbiguityCategory,
  AssumptionConfirmationState
} from "@mugiew-method/core";

export type DiscoveryItemClassificationHint =
  | "blocking"
  | "non-blocking"
  | "assumption";

export type DiscoveryItemRisk =
  | "contradiction"
  | "security"
  | "deployment"
  | "data-loss"
  | "unknown-required-decision"
  | "best-practice-default"
  | "implementation-detail"
  | "assumption";

export interface DiscoveryItem {
  source: string;
  text: string;
  owner?: "user" | "ai" | "system";
  classificationHint?: DiscoveryItemClassificationHint;
  risk?: DiscoveryItemRisk;
  impact?: string;
  resolution?: string;
  blockingReason?: string;
  defaultHandlingStrategy?: string;
  confirmationState?: AssumptionConfirmationState;
}

export interface ClassifyDiscoveryItemsOptions {
  idPrefix?: string;
}

export function classifyDiscoveryItems(
  items: DiscoveryItem[],
  options: ClassifyDiscoveryItemsOptions = {}
): Ambiguity[] {
  const idPrefix = options.idPrefix ?? "AMB";

  return items.map((item, index) =>
    classifyDiscoveryItem(item, `${idPrefix}-${String(index + 1).padStart(3, "0")}`)
  );
}

function classifyDiscoveryItem(item: DiscoveryItem, id: string): Ambiguity {
  const category = determineCategory(item);
  const base = {
    id,
    source: item.source,
    impact: item.impact ?? item.text,
    owner: item.owner ?? "user",
    status: "open" as const,
    resolution: item.resolution ?? ""
  };

  if (category === "blocking-ambiguity") {
    return {
      ...base,
      category,
      blockingReason:
        item.blockingReason ??
        "This item blocks approval or execution because a required decision is unresolved."
    };
  }

  if (category === "non-blocking-ambiguity") {
    return {
      ...base,
      category,
      defaultHandlingStrategy:
        item.defaultHandlingStrategy ??
        "Use documented best practice and record the chosen default."
    };
  }

  return {
    ...base,
    category,
    confirmationState: item.confirmationState ?? "unconfirmed"
  };
}

function determineCategory(item: DiscoveryItem): AmbiguityCategory {
  if (item.classificationHint === "blocking") {
    return "blocking-ambiguity";
  }

  if (item.classificationHint === "non-blocking") {
    return "non-blocking-ambiguity";
  }

  if (item.classificationHint === "assumption") {
    return "assumption";
  }

  if (item.risk === "assumption") {
    return "assumption";
  }

  if (
    item.risk === "best-practice-default" ||
    item.risk === "implementation-detail"
  ) {
    return "non-blocking-ambiguity";
  }

  return "blocking-ambiguity";
}
