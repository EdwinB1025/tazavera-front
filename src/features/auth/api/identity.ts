/**
 * The step-up's identity check (secure-step-up design.md D3; spec "Step-up to
 * the write scope"): the code is exchanged without keeping the grant, and the
 * grant is installed only when `GET /user`, sent with its access token,
 * returns the user who started the step-up. Another user's grant is never
 * installed: its web session is ended with `POST /logout` and it is dropped.
 */
import {
  exchangeCode,
  exchangeCodeForGrant,
  keepTokens,
  requestWithToken,
  type SessionUser,
} from "@/shared/api";
import type { PendingFlow } from "../model/flow";

/**
 * Exchanges the code and installs the new tokens; a step-up installs them only
 * for its expected user and resolves `false` for another one (secure-step-up
 * design.md D3). Rejects when the exchange or the identity check fails.
 */
export async function settleTokens(code: string, pending: PendingFlow): Promise<boolean> {
  if (pending.expectedUlid === undefined) {
    await exchangeCode(code, pending.verifier);
    return true;
  }
  return confirmStepUp(code, pending.verifier, pending.expectedUlid);
}

/**
 * Resolves `true` once the grant of the same user is installed, `false` when
 * another user signed in. Rejects when the exchange fails or the user cannot
 * be resolved, so the caller takes its error path.
 */
async function confirmStepUp(
  code: string,
  verifier: string,
  expectedUlid: string,
): Promise<boolean> {
  const grant = await exchangeCodeForGrant(code, verifier);
  const response = await requestWithToken("/user", grant.access_token);
  const body = response.ok ? ((await response.json()) as { data?: SessionUser }) : {};
  const ulid = body.data?.ulid;
  if (ulid === undefined) {
    throw new Error("the step-up user cannot be resolved");
  }
  if (ulid === expectedUlid) {
    keepTokens(grant);
    return true;
  }
  // Its answer is never consulted, as in sign out.
  await requestWithToken("/logout", grant.access_token, { method: "POST" }).catch(
    () => undefined,
  );
  return false;
}
