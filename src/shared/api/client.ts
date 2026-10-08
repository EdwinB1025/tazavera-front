/**
 * The request client and its `401` recovery chain (design.md D2, D3 and D5;
 * spec "Keeping the session alive"). The dependency is inverted (design.md
 * D2): this module never imports the session — it receives the current tokens,
 * a refresh call and what to do when nothing can recover the session, and
 * `src/features/auth` fills that surface once when it initializes.
 */
import type { TokenGrant } from "./tokens";

/** The configuration surface `src/features/auth` fills at startup (design.md D2). */
type ClientSeam = {
  /** The grant held in memory, or `null` when there is none. */
  getTokens: () => TokenGrant | null;
  /** Obtains a fresh grant. Concurrent recoveries share one call (single-flight). */
  refresh: () => Promise<unknown>;
  /** Called when nothing can recover the session; silent re-authentication lives there. */
  onUnrecoverable: () => void;
};

let seam: ClientSeam | null = null;

/** The one refresh in flight, if any (design.md D2 single-flight). */
let recovering: Promise<unknown> | null = null;

/** Fills the seam; `src/features/auth` calls it once at startup (design.md D2). */
export function configureClient(next: ClientSeam): void {
  seam = next;
}

/**
 * The sign-out request of design.md D5 (`POST /logout`): it is sent with the
 * token, but its `401` — "the token is already dead" — and any transport
 * failure end at the caller. The local sign-out completes regardless of the
 * response, and a refresh or silent re-authentication here would revive the
 * very session the request is ending.
 */
const SIGN_OUT_PATH = "/logout";

/**
 * An authenticated request to `GET /user` and the like: it carries
 * `Authorization: Bearer <access token>` (design.md D5). A `401` provokes
 * exactly one refresh and one retry before the injected recovery is called —
 * except on the sign-out request, which is never recovered (design.md D5).
 */
export async function request(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  let response = await send(path, init);
  if (response.status !== 401 || path === SIGN_OUT_PATH) {
    return response;
  }
  try {
    await recover();
  } catch {
    configured().onUnrecoverable();
    return response;
  }
  response = await send(path, init);
  if (response.status === 401) {
    configured().onUnrecoverable();
  }
  return response;
}

/**
 * The request option of the reference reads (`GET /taxonomies`, `GET /coffees`):
 * a server cache refreshed at most every hour (backlog R30). The one place the
 * one-hour value lives.
 */
export const REFERENCE_READ_INIT: RequestInit = { next: { revalidate: 3600 } };

/** A public request: sent without credentials (spec: "Public endpoints need no session"). */
export function publicRequest(path: string, init?: RequestInit): Promise<Response> {
  const url = `${apiUrl()}${path}`;
  return init === undefined ? fetch(url) : fetch(url, init);
}

/** One request with the current grant attached (design.md D5). */
function send(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const accessToken = configured().getTokens()?.access_token;
  if (accessToken !== undefined) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return fetch(`${apiUrl()}${path}`, { ...init, headers });
}

/**
 * One refresh shared by every request that failed with `401` at the same time
 * (design.md D2: a second grant with a rotated refresh token would fail).
 */
function recover(): Promise<unknown> {
  if (!recovering) {
    const flight = configured().refresh();
    recovering = flight;
    const settled = () => {
      recovering = null;
    };
    flight.then(settled, settled);
  }
  return recovering;
}

function configured(): ClientSeam {
  if (!seam) {
    throw new Error("the API client is not configured");
  }
  return seam;
}

/** `{NEXT_PUBLIC_API_URL}` (design.md Context), read per call like every env value here. */
function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}
