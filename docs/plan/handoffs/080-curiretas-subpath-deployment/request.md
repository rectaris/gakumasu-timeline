# Handoff: Activate Git-linked timeline deployment

status: open
parent_task: docs/plan/active/080-curiretas-subpath-deployment.md
owner: Codex session in gakumasu-timeline
write_scope:
  - .node-version
  - .github/workflows/ci.yml
  - .github/workflows/deploy-dev.yml
  - .github/workflows/deploy-main.yml
  - wrangler.timeline.jsonc
  - docs/deploy.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/plan/active/080-curiretas-subpath-deployment.md
  - docs/plan/plan.md
  - docs/plan/checked.md
  - docs/plan/checked/080-curiretas-subpath-deployment.md
read_scope:
  - package.json
  - scripts/prepare-cloudflare-assets.mjs
  - .cloudflare-assets/gakumastool/timeline/
validation:
  - npm run verify
  - npm run build:curiretas
  - npx --yes wrangler@4.118.0 deploy --dry-run --config wrangler.timeline.jsonc
return_contract: summary-only

## Task

Connect the existing `gakumasu-timeline-curiretas` Worker to
`rectaris/gakumasu-timeline` through Cloudflare Workers Builds.

Use this exact target:

- `https://curiretas.com/gakumastool/timeline/`
- route pattern `curiretas.com/gakumastool/timeline/*`

Use `main` as the production branch, `npm run verify` as the build command, and
`npm run deploy:curiretas` as the deploy command. Disable non-production branch
builds and smoke-test the three application views plus a direct asset request.

## Constraints

- Read `AGENTS.md`, `docs/agent/spec-index.yaml`, and routed specs first.
- Preserve the default `/timeline/` build and both GitHub Pages workflows.
- Do not add secrets to source, Wrangler config, logs, or plan files.
- Keep Workers Builds credentials in Cloudflare and do not add GitHub Actions
  deployment secrets.
- Do not change timeline data, IDs, view behavior, or interaction behavior.
- Do not activate a redirect from `rectaris.github.io` in this repository.
- Treat the root portal Worker as a separate repository and deployment.

## Current State

- The Cloudflare build is isolated from the existing GitHub Pages build.
- The generated directory mirrors `/gakumastool/timeline/`.
- Wrangler owns only the path-specific route, not the apex hostname.
- The production route currently returns HTTP 200 and was deployed manually.
- GitHub does not yet show a Cloudflare Workers Builds check for this repository.

## Next Action

1. Run the validation commands above.
2. Connect the existing Worker to `rectaris/gakumasu-timeline` in Cloudflare
   Dashboard under `Settings` and `Builds`.
3. Configure `main`, root directory `/`, build command `npm run verify`, deploy
   command `npm run deploy:curiretas`, and disabled non-production builds.
4. Merge the validated repository change to `main` and confirm that GitHub shows
   a successful `Workers Builds: gakumasu-timeline-curiretas` check.
5. Verify `/`, `?mode=story-graph`, `?mode=realworld`, hashed assets, refresh,
   and browser console or network errors at the new path.
6. Record the deployed Worker version and validation result in the active plan.
7. Ask the `rectaris.github.io` Codex to update legacy links only after the new
   path passes the smoke checks.
8. Before activating a legacy `/timeline/` redirect, create a separate approved
   follow-up that disables or replaces this repository's external GitHub Pages
   publish workflows. Otherwise they can overwrite the redirect artifact.
9. Finalize and archive plan 080 through the repository lifecycle scripts.

## Return Notes

Report the deployed URL, Worker version, smoke-test results, unchanged legacy
URL status, validation commands, commit hash, and any Cloudflare blocker.
