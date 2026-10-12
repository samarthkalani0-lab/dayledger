import { createVertex } from "@ai-sdk/google-vertex";

// Built on first use (not at import time) so `next build` works without env vars.
let cached;

export async function getVertex() {
  if (cached) return cached;
  const e = process.env;
  const base = { project: e.GCP_PROJECT_ID, location: e.GCP_LOCATION || "us-central1" };

  if (e.VERCEL) {
    // On Vercel: keyless login. Vercel proves who it is (OIDC); Google lets it act as
    // the service account. No JSON key file anywhere.
    const { getVercelOidcToken } = await import("@vercel/oidc");
    const { ExternalAccountClient } = await import("google-auth-library");
    const audience = `//iam.googleapis.com/projects/${e.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${e.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${e.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`;
    const authClient = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${e.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
      subject_token_supplier: { getSubjectToken: getVercelOidcToken },
    });
    cached = createVertex({ ...base, googleAuthOptions: { authClient, projectId: e.GCP_PROJECT_ID } });
  } else {
    // On your computer: uses `gcloud auth application-default login` (ADC).
    cached = createVertex(base);
  }
  return cached;
}
