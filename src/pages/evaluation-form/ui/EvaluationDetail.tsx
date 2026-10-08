"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import type { EvaluationItem, OfferingDetail, TaxonomyNode } from "@/shared/api";
import { getMyEvaluation } from "@/entities/evaluation";
import { fetchOffering } from "@/entities/offering";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/ui";
import { EvaluationForm } from "./EvaluationForm";
import type { EvaluationFormTexts } from "./EvaluationForm";
import { LoadFailure } from "./LoadFailure";

// ─── UI-specific types (declared before the component) ───

export type EvaluationDetailTexts = EvaluationFormTexts & {
  loadErrorMessage: string;
  retryLabel: string;
};

export type EvaluationDetailProps = {
  locale: string;
  ulid: string;
  /** The `GET /taxonomies` tree, read on the server (design.md D1). */
  taxonomies: TaxonomyNode[];
  texts: EvaluationDetailTexts;
};

type DetailState =
  | { state: "loading" }
  | { state: "not-found" }
  | { state: "error" }
  | { state: "success"; evaluation: EvaluationItem; offering: OfferingDetail | null };

const PLACEHOLDER_CLASSES = ["animate-pulse", "bg-surface-section", "rounded-field"].join(" ");

/** The evaluation, then its offering (the key comes from the evaluation). */
async function loadDetail(ulid: string): Promise<DetailState> {
  const result = await getMyEvaluation(ulid);
  if (!result.ok) {
    return result.kind === "not-found" ? { state: "not-found" } : { state: "error" };
  }
  // A `null` id is a deleted offering: nothing to request (design.md D17).
  if (result.data.offeringId === null) {
    return { state: "success", evaluation: result.data, offering: null };
  }
  const offering = await fetchOffering(result.data.offeringId ?? "");
  return offering.ok
    ? { state: "success", evaluation: result.data, offering: offering.data }
    : { state: "error" };
}

/**
 * The `/{ulid}` content (design.md D1, D11; spec "Evaluation form"): the
 * evaluation and its offering load on the client — the evaluation needs the
 * token and the offering's key comes from it. Loading shows a placeholder; an
 * unknown evaluation, or another user's, is the 404 page; any other failure
 * shows the failure message with a retry. A loaded open evaluation fills the
 * form for editing, a closed one its read-only presentation.
 */
export function EvaluationDetail({
  locale,
  ulid,
  taxonomies,
  texts,
}: EvaluationDetailProps): ReactNode {
  const [attempt, setAttempt] = useState(0);
  const key = `${ulid}:${attempt}`;
  const [loaded, setLoaded] = useState<{ key: string; detail: DetailState } | null>(null);
  const detail: DetailState = loaded?.key === key ? loaded.detail : { state: "loading" };

  useEffect(() => {
    let current = true;
    loadDetail(ulid).then((next) => {
      if (current) setLoaded({ key, detail: next });
    });
    return () => {
      current = false;
    };
  }, [ulid, key]);

  if (detail.state === "not-found") {
    notFound();
  }
  if (detail.state === "loading") {
    return (
      <Card aria-busy="true">
        <CardContent>
          <div className={cn(PLACEHOLDER_CLASSES, "h-6 w-2/3")} />
          <div className={cn(PLACEHOLDER_CLASSES, "mt-4 h-4 w-1/2")} />
        </CardContent>
      </Card>
    );
  }
  if (detail.state === "error") {
    return (
      <LoadFailure
        message={texts.loadErrorMessage}
        retryLabel={texts.retryLabel}
        onRetry={() => setAttempt((count) => count + 1)}
      />
    );
  }
  return (
    <EvaluationForm
      locale={locale}
      offering={detail.offering}
      taxonomies={taxonomies}
      texts={texts}
      evaluation={detail.evaluation}
    />
  );
}
