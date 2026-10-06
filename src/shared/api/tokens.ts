/**
 * The token grants and the token memory (design.md D2, D3 and D5): the two
 * calls of `POST /oauth/token`, built and answered over `oauth4webapi`
 * (design.md D8), and the grant kept in module memory only (spec: "Credential
 * handling" — nothing here writes to `localStorage` or `sessionStorage`).
 */
import * as oauth from "oauth4webapi";

/**
 * UI-specific types of design.md D7: the shapes of `POST /oauth/token`, which
 * `src/shared/api/schema.ts` does not describe (the contract names the two
 * OAuth endpoints only in its `bearerAuth` security scheme). Kept inside
 * `src/shared/api`: exported from this module for the segment's own files and
 * never re-exported by `index.ts`.
 */

/** 200 of POST /oauth/token (RFC 6749 §5.1; the fields the contract's security scheme names). Kept inside `src/shared/api`. */
export type TokenGrant = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
};

/** Token error body (RFC 6749 §5.2). Kept inside `src/shared/api`. */
export type TokenGrantError = {
  error: string;
  error_description?: string;
};

/** The grant held in module memory (design.md D3). Never written to any storage. */
let tokens: TokenGrant | null = null;

/** The grant held in memory, or `null` before the first successful sign in. */
export function getTokens(): TokenGrant | null {
  return tokens;
}

/** Clears the token memory (spec: "After sign out": no trace of the session). */
export function clearTokens(): void {
  tokens = null;
}

/**
 * Exchanges the code of a completed authorization for the first grant
 * (design.md D5). The `state` of the response belongs to `src/features/auth`
 * (design.md D4), so the library's state check is skipped here.
 */
export async function exchangeCode(
  code: string,
  codeVerifier: string,
): Promise<void> {
  const as = authorizationServer();
  const client = oauthClient();
  const callbackParameters = oauth.validateAuthResponse(
    as,
    client,
    new URLSearchParams({ code }),
    oauth.skipStateCheck,
  );
  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    oauth.None(),
    callbackParameters,
    `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/callback`,
    codeVerifier,
    requestOptions(),
  );
  tokens = await keepGrant(response, (sent) =>
    oauth.processAuthorizationCodeResponse(as, client, sent),
  );
}

/**
 * Replaces the whole pair with a fresh one (design.md D3: the previous refresh
 * token is never reused).
 */
export async function refreshTokens(): Promise<void> {
  const current = tokens;
  if (!current) {
    throw new Error("no grant in memory to refresh");
  }
  const as = authorizationServer();
  const client = oauthClient();
  const response = await oauth.refreshTokenGrantRequest(
    as,
    client,
    oauth.None(),
    current.refresh_token,
    requestOptions(),
  );
  tokens = await keepGrant(response, (sent) =>
    oauth.processRefreshTokenResponse(as, client, sent),
  );
}

/** The hand-built authorization server (design.md D8: no discovery request). */
function authorizationServer(): oauth.AuthorizationServer {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return { issuer: base, token_endpoint: `${base}/oauth/token` };
}

/**
 * The options of both grant requests (design.md D8). Outside production the
 * library's `allowInsecureRequests` lets them reach an `http://` API (the local
 * API on `http://localhost:8000`); a production build keeps the library's
 * default and refuses any token endpoint that is not HTTPS.
 */
function requestOptions(): oauth.TokenEndpointRequestOptions {
  return process.env.NODE_ENV === "production"
    ? {}
    : { [oauth.allowInsecureRequests]: true };
}

/** The public client (design.md D5: it identifies itself with `client_id`, no secret). */
function oauthClient(): oauth.Client {
  return { client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? "" };
}

/**
 * Validates the token endpoint's answer with the library's response processing
 * (design.md D8) and keeps the 200 the endpoint sent (design.md D7: the grant
 * is the body of `POST /oauth/token`). The library folds `token_type` to lower
 * case while processing, so the kept grant is read from the response itself.
 */
async function keepGrant(
  response: Response,
  process: (response: Response) => Promise<unknown>,
): Promise<TokenGrant> {
  const sent = response.clone();
  try {
    await process(response);
  } catch (cause) {
    throw surfaced(cause);
  }
  return (await sent.json()) as TokenGrant;
}

/** The token error body the library wraps (RFC 6749 §5.2), or the failure itself. */
function surfaced(cause: unknown): unknown {
  const body = (cause as { cause?: unknown } | undefined)?.cause;
  return isTokenGrantError(body) ? body : cause;
}

function isTokenGrantError(body: unknown): body is TokenGrantError {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as TokenGrantError).error === "string"
  );
}
