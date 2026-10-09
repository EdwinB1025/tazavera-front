import { request } from "@/shared/api";
import { readFieldErrors } from "@/shared/lib/field-errors";
import type {
  ApiResult,
  EvaluationCreateBody,
  EvaluationItem,
  EvaluationPageMeta,
  EvaluationUpdateBody,
} from "@/shared/api";

/**
 * The signed-in specialist's evaluations (design.md's endpoint table, D1):
 * the six `/user/evaluations` operations, on the client through the add-auth
 * `request` client. Each call reports the shared result, with `403`, `404`
 * and `409` as their own kinds, so the screens pick the catalog message of
 * design.md's error table; the API `message` strings never reach the
 * presentation (unify-api-result-shape design.md D2).
 */

export type EvaluationCallResult<T> = ApiResult<T, "forbidden" | "not-found" | "conflict">;

/** A create or update: a `422` carries its field messages (show-field-validation-errors D4). */
export type EvaluationWriteResult<T> = ApiResult<
  T,
  "forbidden" | "not-found" | "conflict" | "validation"
>;

/** The failure kind of a non-2xx status. */
function failureKind(status: number): "forbidden" | "not-found" | "conflict" | "error" {
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  return status === 409 ? "conflict" : "error";
}

export type EvaluationPage = { data: EvaluationItem[]; meta: EvaluationPageMeta };

async function call<T>(
  path: string,
  init: RequestInit | undefined,
  read: ((payload: Record<string, unknown>) => T) | null,
): Promise<EvaluationCallResult<T>> {
  try {
    const response = init ? await request(path, init) : await request(path);
    if (!response.ok) {
      return { ok: false, kind: failureKind(response.status) };
    }
    if (!read) {
      // Close and delete answer only a `message`, which is never shown.
      return { ok: true, data: null as T };
    }
    const payload = await response.json();
    return { ok: true, data: read(payload ?? {}) };
  } catch {
    return { ok: false, kind: "error" };
  }
}

function json(method: "POST" | "PUT", body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  };
}

const item = (payload: Record<string, unknown>) => payload.data as EvaluationItem;

/** A create or update: `call`'s mapping, with a `422` read for its field messages. */
async function write(path: string, init: RequestInit): Promise<EvaluationWriteResult<EvaluationItem>> {
  try {
    const response = await request(path, init);
    if (response.status === 422) {
      return { ok: false, kind: "validation", errors: await readFieldErrors(response) };
    }
    if (!response.ok) return { ok: false, kind: failureKind(response.status) };
    return { ok: true, data: item((await response.json()) ?? {}) };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/**
 * `GET /user/evaluations` with the serialized request query, its sort pair
 * and `page` included (design.md endpoint 1; add-evaluation-facets D1).
 */
export function listMyEvaluations(query: string): Promise<EvaluationCallResult<EvaluationPage>> {
  return call(
    `/user/evaluations?${query}`,
    undefined,
    (payload) => ({
      data: (payload.data as EvaluationItem[] | undefined) ?? [],
      meta: (payload.meta as EvaluationPageMeta | undefined) ?? {},
    }),
  );
}

/** `GET /user/evaluations/{evaluation}`; `404` for an unknown or another user's. */
export function getMyEvaluation(ulid: string): Promise<EvaluationCallResult<EvaluationItem>> {
  return call(`/user/evaluations/${ulid}`, undefined, item);
}

/** `POST /user/evaluations`. */
export function createAnEvaluation(
  body: EvaluationCreateBody,
): Promise<EvaluationWriteResult<EvaluationItem>> {
  return write("/user/evaluations", json("POST", body));
}

/** `PUT /user/evaluations/{evaluation_ulid}`; the body carries no `offeringId`. */
export function updateAnEvaluation(
  ulid: string,
  body: EvaluationUpdateBody,
): Promise<EvaluationWriteResult<EvaluationItem>> {
  return write(`/user/evaluations/${ulid}`, json("PUT", body));
}

/** `PATCH /user/evaluations/{evaluation_ulid}/close`, no body. */
export function closeAnEvaluation(ulid: string): Promise<EvaluationCallResult<null>> {
  return call(`/user/evaluations/${ulid}/close`, { method: "PATCH" }, null);
}

/** `DELETE /user/evaluations/{evaluation_ulid}`, no body. */
export function deleteAnEvaluation(ulid: string): Promise<EvaluationCallResult<null>> {
  return call(`/user/evaluations/${ulid}`, { method: "DELETE" }, null);
}
