export function getUserSessionSecret(env) {
  return String(env?.USER_SESSION_SECRET || "");
}

export function validateSelfHostedSecrets(env) {
  const ownerToken = String(env?.OWNER_AUTH_TOKEN || "");
  const userSessionSecret = getUserSessionSecret(env);

  if (ownerToken.length < 32) {
    throw new Error("OWNER_AUTH_TOKEN is required and must be at least 32 characters");
  }
  if (userSessionSecret.length < 32) {
    throw new Error("USER_SESSION_SECRET is required and must be at least 32 characters");
  }
  if (ownerToken === userSessionSecret) {
    throw new Error("OWNER_AUTH_TOKEN and USER_SESSION_SECRET must be different values");
  }
  return true;
}
