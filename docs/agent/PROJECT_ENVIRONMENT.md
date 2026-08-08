# Project Environment

## Local Stack

- Runtime and tooling are Node/Vite based. Use `package.json` scripts as the command source of truth.
- Core commands are `npm run dev`, `npm run test`, `npm run build`, `npm run verify`, and `npm run preview`.
- Prefer the existing Vue, Vite, Vitest, and Playwright stack before adding a dependency.
- Pin local, GitHub Actions, and Workers Builds execution to Node.js 24 through `.node-version`.

## Public Paths And Hosting

- GitHub Pages public-path behavior is part of the product surface.
- Keep `vite.config.*`, `docs/deploy.md`, and public links consistent when the repository name or hosted subdirectory changes.
- Ask before changing public URL semantics unless deployment or routing is the explicit task.
- Verify public-path changes with `npm run build` and, when practical, `npm run preview`.
- GitHub Actions publishes `dist/` into `rectaris/rectaris.github.io` under `timeline/` or `timeline/dev/`.
- The `curiretas.com/gakumastool/timeline/` production Worker is deployed by Cloudflare Workers Builds after its Git integration is activated.

## Deployment Boundary

- Workers Builds uses `main` as production, `npm run verify` as the build command, and `npm run deploy:curiretas` as the deploy command.
- `WORKERS_CI=1` makes `npm run verify` run Node and Worker tests without Playwright; GitHub Actions remains the required Playwright UI gate and installs Chromium.
- Keep non-production Workers Builds disabled while `preview_urls` is false; `dev` and pull requests remain verification-only.
- A push or merge to `main` authorizes the GitHub Pages and Curiretas Worker deployment paths after the integration is activated.
- Keep the Cloudflare GitHub App scoped to this repository and keep Workers Builds credentials in Cloudflare.
- `npm run deploy` is a guard and must not publish. `npm run deploy:curiretas` is only for owner-approved manual recovery or initial verification.
- Do not deploy unless the user explicitly requests it or an approved repository policy authorizes it.

## Verification Targets

- Desktop Chromium/Chrome-sized viewport is the baseline UI target.
- A narrow mobile viewport is required for UI changes affecting fixed controls, menus, panels, or touch behavior.
- Check other browsers when browser-specific APIs, pointer/touch behavior, or CSS compatibility changes.
- Do not commit `dist/`, dependencies, local caches, screenshots, traces, or other tool output unless the task explicitly requires and documents the artifact.
