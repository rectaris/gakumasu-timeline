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
  - `npm run deploy`

## Public Path And Hosting

- GitHub Pages public-path behavior is part of the product surface.
- Keep `vite.config.*`, `docs/deploy.md`, and any public links consistent when the repository name or hosted subdirectory changes.
- Treat public path changes as high-impact unless the user explicitly scoped the task to deployment/routing.
- Verify built asset paths after public path changes with `npm run build` and, when practical, `npm run preview`.
- State public-path or link changes in the final report.

## Generated And Local Files

- Do not commit `dist/`, dependency folders, local caches, tool output, screenshots, or ad hoc backups unless a task explicitly requires a tracked artifact.
- Generated output may be inspected for validation, but source files and documented scripts remain the durable change surface.
- If a generated artifact becomes part of the workflow, document the generator, command, and validation path before committing it.

## Deployment Boundary

- `npm run deploy` publishes `dist/` through `gh-pages`.
- Do not deploy unless the user explicitly asks for deployment or an approved repository policy says to deploy.
- A normal implementation task may build and preview locally without publishing.
- If deployment is requested, run the relevant validation first and report the published target or any deployment blocker.

## Dependencies

- Before adding a dependency, check whether the repository already has a suitable helper, composable, utility, or existing dependency.
- Prefer extending current Vue/Vite/Playwright/Vitest tooling over adding a new package.
- For a new dependency or major update, record the reason, expected maintenance impact, and validation run in the task report.
- Do not introduce packages that require secrets, external services, or write-capable network behavior without explicit user intent and documented boundaries.
- Keep lockfile changes scoped to the dependency operation. Do not mix unrelated package churn with feature work.

## Supported Verification Targets

- Desktop Chromium/Chrome-sized viewport is the baseline UI verification target.
- A narrow mobile viewport is required for UI changes that affect fixed controls, menus, panels, or touch behavior.
- Other browsers are checked when the change touches browser-specific APIs, pointer/touch behavior, CSS compatibility, or the user explicitly requests coverage.
