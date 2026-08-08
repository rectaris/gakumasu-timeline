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
        },
      },
    })),
  ],
  test: {
    include: ["tests/worker/**/*.test.ts"],
    setupFiles: ["./tests/worker/apply-migrations.ts"],
  },
});
