"use server";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

export async function getOAuthClient(clerkUserId: string) {
  const clerk = await clerkClient();
  const token = await clerk.users.getUserOauthAccessToken(
    clerkUserId,
    "oauth_google"
  );

  if (token.data.length === 0 || token.data[0].token == null) {
    throw new Error("No OAuth token available.");
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  client.setCredentials({ access_token: token.data[0].token });

  return client;
}
