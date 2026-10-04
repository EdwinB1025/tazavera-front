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
