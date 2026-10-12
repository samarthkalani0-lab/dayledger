import { prisma } from "@/lib/prisma";

// Returns a valid Google access token for this user, refreshing it if needed.
export async function getGoogleAccessToken(userId) {
  const acc = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!acc) return null;

  const now = Math.floor(Date.now() / 1000);
  if (acc.access_token && acc.expires_at && acc.expires_at > now + 60) {
    return acc.access_token;
  }
  if (!acc.refresh_token) return null; // user must sign in again

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID,
      client_secret: process.env.AUTH_GOOGLE_SECRET,
      grant_type: "refresh_token",
      refresh_token: acc.refresh_token,
    }),
  });
  if (!res.ok) return null;
  const t = await res.json();
  await prisma.account.update({
    where: { id: acc.id },
    data: {
      access_token: t.access_token,
      expires_at: now + (t.expires_in || 3600),
      refresh_token: t.refresh_token ?? acc.refresh_token,
    },
  });
  return t.access_token;
}
