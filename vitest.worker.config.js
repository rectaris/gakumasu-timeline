import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      main: "./workers/index.ts",
      miniflare: {
        compatibilityDate: "2026-08-08",
        compatibilityFlags: ["nodejs_compat"],
        d1Databases: ["TIMELINE_DB"],
        bindings: {
          DISCORD_CONTRIBUTOR_ROLE_IDS: "111111111111111111",
          DISCORD_REVIEWER_ROLE_IDS: "222222222222222222",
          TEST_MIGRATIONS: await readD1Migrations(
            path.join(root, "workers/migrations"),
          ),
        },
        serviceBindings: {
          ASSETS() {
            return new Response("asset", { status: 200 });
          },
          ACCOUNT_SERVICE(request) {
            const url = new URL(request.url);
            if (request.method !== "GET" || url.pathname !== "/auth/session") {
              return Response.json({ error: "not found" }, { status: 404 });
            }
            const cookie = request.headers.get("Cookie") ?? "";
            if (!/^(__Host-)?curiretas_gakumastool_session=[^;]+$/u.test(cookie)) {
              return Response.json({ authenticated: false });
            }
            const token = cookie.slice(cookie.indexOf("=") + 1);
            if (token === "malformed") {
              return Response.json({ authenticated: true, user: {} });
            }
            if (token === "upstream-error") {
              return Response.json({ error: "upstream" }, { status: 500 });
            }
            if (token === "anonymous") {
              return Response.json({ authenticated: false });
            }
            return Response.json({
              authenticated: true,
              user: { id: token, displayName: "Test User" },
            });
          },
          DISCORD_MEMBERSHIP_SERVICE: {
            name: "discord-membership-test-service",
            entrypoint: "DiscordGuildMembershipService",
          },
        },
        workers: [
          {
            name: "discord-membership-test-service",
            modules: true,
            scriptPath: path.join(
              root,
              "tests/worker/discord-membership-service.mjs",
            ),
            compatibilityDate: "2026-08-08",
          },
        ],
      },
    })),
  ],
  test: {
    include: ["tests/worker/**/*.test.ts"],
    setupFiles: ["./tests/worker/apply-migrations.ts"],
  },
});
