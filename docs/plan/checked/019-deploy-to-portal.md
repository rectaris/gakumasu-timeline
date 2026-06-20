# Deploy To Portal

status: checked
task_type: environment_data_flow
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - .github/workflows/deploy-main.yml
  - .github/workflows/deploy-dev.yml
  - package.json
  - package-lock.json
  - README.md
  - docs/deploy.md
  - docs/agent/SPEC_ENVIRONMENT.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
validation:
  - npm run build
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
acceptance:
  - Main branch deployment publishes built output to rectaris/rectaris.github.io under timeline/.
  - Dev/develop deployment publishes built output to rectaris/rectaris.github.io under timeline/dev/.
  - Local package scripts and docs no longer instruct publishing to this repository's gh-pages branch.
acceptance_focus:
  - GitHub Actions publish target
  - public path consistency
expected_output: full-implementation
checked_summary_ja: Timeline のデプロイ先を rectaris.github.io/timeline に修正する。

## Notes

- User provided Actions run 27863457073 showing `pages-build-deployment` for this repository's `gh-pages` branch and requested the fix.
- GitHub API confirmed this repository's Pages source was `gh-pages` `/`, yielding `https://rectaris.github.io/gakumasu-timeline/`.

## Completion Notes

- Updated deploy workflows to publish built output to `rectaris/rectaris.github.io`:
  - main -> `timeline/`
  - dev/develop -> `timeline/dev/`
- Removed the local `gh-pages` dependency and replaced `npm run deploy` with a guard command.
- Updated human and agent deployment docs to treat `/timeline/` as the canonical public path.
- Validation:
  - `npm run build`
  - `git diff --check`
  - `python3 scripts/lint-plan-docs.py`
  - `python3 scripts/format-plan-docs.py --check`
  - `npm ci --dry-run --ignore-scripts`
  - `python3 scripts/security-static-check.py`
  - `python3 scripts/structure-map.py --check`
  - `python3 scripts/validate-changes.py`
- External follow-up:
  - `gh secret list --repo rectaris/gakumasu-timeline` returned no visible secrets, so `RECTARIS_GITHUB_IO_TOKEN` still needs to be added before the deploy workflow can push to `rectaris/rectaris.github.io`.
  - This repository's current GitHub Pages source remains an external setting and should be disabled after the portal deployment is confirmed.
