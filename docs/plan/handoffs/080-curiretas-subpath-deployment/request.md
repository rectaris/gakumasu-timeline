# Handoff: Deploy timeline under curiretas.com

status: open
parent_task: docs/plan/active/080-curiretas-subpath-deployment.md
owner: Codex session in gakumasu-timeline
write_scope:
  - wrangler.timeline.jsonc
  - docs/deploy.md
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

Continue the prepared migration only after the owner confirms that the root
`curiretas.com` Custom Domain Worker is live and authorizes production routing.

Use this exact target:

- `https://curiretas.com/gakumastool/timeline/`
- route pattern `curiretas.com/gakumastool/timeline/*`

Build with `npm run build:curiretas`, inspect the mounted artifact, deploy with
`npm run deploy:curiretas`, and smoke-test the three application views plus a
direct asset request.

## Constraints

- Read `AGENTS.md`, `docs/agent/spec-index.yaml`, and routed specs first.
- Preserve the default `/timeline/` build and both GitHub Pages workflows.
- Do not deploy until the owner explicitly approves the cutover.
- Do not add secrets to source, Wrangler config, logs, or plan files.
- Do not change timeline data, IDs, view behavior, or interaction behavior.
- Do not activate a redirect from `rectaris.github.io` in this repository.
- Treat the root portal Worker as a separate repository and deployment.

## Current State

- The Cloudflare build is isolated from the existing GitHub Pages build.
- The generated directory mirrors `/gakumastool/timeline/`.
- Wrangler owns only the path-specific route, not the apex hostname.
- Production deployment and DNS verification have not been performed.

## Next Action

1. Confirm the owner has deployed the root Custom Domain Worker for
   `curiretas.com`.
2. Run the validation commands above.
3. Run `npm run deploy:curiretas` only with explicit owner approval.
4. Verify `/`, `?mode=story-graph`, `?mode=realworld`, hashed assets, refresh,
   and browser console or network errors at the new path.
5. Record the deployed Worker version and validation result in the active plan.
6. Ask the `rectaris.github.io` Codex to update legacy links only after the new
   path passes the smoke checks.
7. Before activating a legacy `/timeline/` redirect, create a separate approved
   follow-up that disables or replaces this repository's external GitHub Pages
   publish workflows. Otherwise they can overwrite the redirect artifact.
8. Finalize and archive plan 080 through the repository lifecycle scripts.

## Return Notes

Report the deployed URL, Worker version, smoke-test results, unchanged legacy
URL status, validation commands, commit hash, and any Cloudflare blocker.
