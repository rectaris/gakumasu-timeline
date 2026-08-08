# Environment

This file is the canonical agent-facing policy for environment, build,
generated-file, hosting, dependency, and deployment decisions.

Keep secrets out of repository files. Use environment variables or the platform secret store.

## Local Stack

- Runtime and tooling are Node/Vite based.
- Use the package scripts in `package.json` as the source of truth for local commands.
- Current core commands:
  - `npm run dev`
  - `npm run test`
  - `npm run build`
  - `npm run verify`
  - `npm run preview`

## Public Path And Hosting

- GitHub Pages public-path behavior is part of the product surface.
- Keep `vite.config.*`, `docs/deploy.md`, and any public links consistent when the repository name or hosted subdirectory changes.
- Treat public path changes as high-impact unless the user explicitly scoped the task to deployment/routing.
- Ask before changing public URL semantics unless the task explicitly requests that change.
- Verify built asset paths after public path changes with `npm run build` and, when practical, `npm run preview`.
- State public-path or link changes in the final report.

## Generated And Local Files

- Do not commit `dist/`, dependency folders, local caches, tool output, screenshots, or ad hoc backups unless a task explicitly requires a tracked artifact.
- Generated output may be inspected for validation, but source files and documented scripts remain the durable change surface.
- If a generated artifact becomes part of the workflow, document the generator, command, and validation path before committing it.
- Treat tracked generated artifacts as exceptional; document the source of truth and freshness check before adding one.

## Deployment Boundary

- Deployment is handled by GitHub Actions publishing `dist/` into the
  `rectaris/rectaris.github.io` repository under `timeline/` or `timeline/dev/`.
- The `curiretas.com/gakumastool/timeline/` production Worker is deployed by
  Cloudflare Workers Builds after its Git integration is activated.
- Workers Builds uses `main` as the production branch, `npm run verify` as the
  build command, and `npm run deploy:curiretas` as the deploy command.
- Workers Builds provides `WORKERS_CI=1`; under that environment, `npm run
  verify` runs Node and Worker tests without Playwright. GitHub Actions remains
  the required Playwright UI verification gate and installs Chromium before
  running the full verification path.
- Keep non-production Workers Builds disabled while `preview_urls` is false;
  `dev` and pull requests remain verification-only paths.
- Pin local, GitHub Actions, and Workers Builds execution to Node.js 24 through
  `.node-version`.
- A push or merge to `main` authorizes both the legacy GitHub Pages deployment
  and the Curiretas Worker deployment after the Git integration is activated.
- Keep the Cloudflare GitHub App scoped to this repository. Keep Workers Builds
  credentials in Cloudflare instead of repository files or GitHub Secrets.
- `npm run deploy` is a guard command and must not publish from this repository.
- `npm run deploy:curiretas` remains available for owner-approved manual
  recovery and initial verification.
- Do not deploy unless the user explicitly asks for deployment or an approved repository policy says to deploy.
- A normal implementation task may build and preview locally without publishing.
- If deployment is requested, run the relevant validation first, confirm the published URL or asset path when practical, and report the published target or any deployment blocker.
- If deployment fails after a write-capable step, stop and report the command, observed state, and rollback or retry options; do not keep retrying blindly.

## Dependencies

- Before adding a dependency, check whether the repository already has a suitable helper, composable, utility, or existing dependency.
- Prefer extending current Vue/Vite/Playwright/Vitest tooling over adding a new package.
- Compare maintained external options before custom code when custom implementation would be complex.
- For a new dependency or major update, record the reason, expected maintenance impact, and validation run in the task report.
- Separate routine dependency refreshes from feature work unless the update is required for the feature or fixes a relevant security issue.
- For security updates, prefer the smallest compatible update that resolves the finding and keep lockfile churn scoped.
- Do not introduce packages that require secrets, external services, or write-capable network behavior without explicit user intent and documented boundaries.
- Keep lockfile changes scoped to the dependency operation. Do not mix unrelated package churn with feature work.

## Evidence Artifacts

- Screenshots, traces, local logs, and preview output are validation aids, not durable source files by default.
- Store temporary evidence outside tracked source or under the relevant plan/handoff only when it materially helps review.
- Do not commit evidence artifacts unless the task explicitly requires them and the source of truth, retention reason, and freshness check are documented.

## Supported Verification Targets

- Desktop Chromium/Chrome-sized viewport is the baseline UI verification target.
- A narrow mobile viewport is required for UI changes that affect fixed controls, menus, panels, or touch behavior.
- Other browsers are checked when the change touches browser-specific APIs, pointer/touch behavior, CSS compatibility, or the user explicitly requests coverage.
