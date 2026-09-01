import { env } from "@/env";

/**
 * Slack credentials and derived settings, resolved once when the route is
 * built and carried on the request context.
 *
 * Handlers read this instead of `env` directly so tests can construct a route
 * with explicit config. Mutating `process.env` per-test is not viable: Deno's
 * `--parallel` runs test files in workers that share one process environment,
 * so concurrent files clobber each other's settings.
 */
export type SlackConfig = {
  signingSecret?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  aiConfigured: boolean;
  dashboardUrl: string;
};

export type SlackEnv = {
  Variables: {
    slackBody: unknown;
    event: Record<string, unknown>;
    slackConfig: SlackConfig;
  };
};

export function slackConfigFromEnv(): SlackConfig {
  const dashboardUrl = process.env.NEXT_PUBLIC_URL?.trim();

  return {
    signingSecret: env.SLACK_SIGNING_SECRET,
    clientId: env.SLACK_CLIENT_ID,
    clientSecret: env.SLACK_CLIENT_SECRET,
    redirectUri: env.SLACK_REDIRECT_URI,
    aiConfigured: Boolean(
      env.AI_GATEWAY_API_KEY ||
      (process.env.AI_BASE_URL?.trim() && process.env.AI_MODEL?.trim()),
    ),
    dashboardUrl:
      dashboardUrl ||
      (env.NODE_ENV === "production"
        ? "https://app.openstatus.dev"
        : "http://localhost:3000"),
  };
}
