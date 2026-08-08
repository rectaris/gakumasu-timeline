# Fix TruffleHog push scan range

status: in_progress
task_types:
  - environment_data_flow
  - security
  - planning_docs
  - japanese_prose
review_class: B
human_design_required: no
human_approval_status: not_required
write_scope:
  - .github/workflows/secret-scan.yml
  - docs/plan/plan.md
  - docs/plan/active/095-fix-trufflehog-push-range.md
  - docs/plan/checked.md
  - docs/plan/checked/2026/08/01-15/095-fix-trufflehog-push-range.md
context_files:
  - none
target_json:
  - none
required_specs:
  - docs/agent/PROJECT_POLICY.md
  - .project-agent-workflow/docs/agent/SPEC_VALIDATION.md
  - .project-agent-workflow/docs/agent/SPEC_GIT_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_FILE_MANAGEMENT.md
  - .project-agent-workflow/docs/agent/SPEC_USER_COMMUNICATION.md
  - .project-agent-workflow/docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - .project-agent-workflow/docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/PROJECT_ENVIRONMENT.md
  - .project-agent-workflow/docs/agent/SPEC_SECURITY.md
  - .project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - .project-agent-workflow/docs/agent/SPEC_EXTERNAL_SERVICES.md
  - .project-agent-workflow/docs/agent/CODEX_CI_AUTOFIX.md
validation:
  - git diff --check
  - python3 .project-agent-workflow/scripts/security-static-check.py
  - python3 .project-agent-workflow/scripts/lint-plan-docs.py
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
acceptance:
  - Push runs let TruffleHog derive the scan range from the GitHub event instead of comparing the checked-out branch to itself.
  - Pull request runs continue scanning only the commits between the event base and head SHAs.
  - Verified-secret findings still fail the job.
acceptance_focus:
  - push scan range
  - secret detection preserved
checked_summary_ja: TruffleHog が push イベントの差分を走査するように修正した。

## Problem

The TruffleHog workflow passes the default branch as `base` and `HEAD` as `head`.
After a push to the default branch, both resolve to the same checked-out commit, so the action exits before scanning with `BASE and HEAD commits are the same`.

## Goal

Use TruffleHog's documented event-aware scan range while preserving verified-result filtering and read-only workflow permissions.

## Implementation Instructions

Remove the explicit `base` and `head` inputs from the TruffleHog step.
Keep full-history checkout and `--results=verified` unchanged.
Validate the workflow with repository static security and change-aware checks.

## Decisions

- Follow the official general-usage configuration so the action selects push and pull-request SHAs from the event payload.
- Do not upgrade or repin actions as part of this failure-specific fix.
- Keep deployment, product code, and public paths unchanged.

## Tasks

- [x] Remove the conflicting TruffleHog range inputs.
- [x] Run workflow-focused and change-aware validation.
- [ ] Verify that the TruffleHog push job succeeds on `dev`.
- [ ] Record the remote validation evidence and prepare the plan for archival.

## Validation Notes

- Failing run `31263372658`, job `93117501925`, resolved both configured refs to merge commit `c7b55e0` and exited with `BASE and HEAD commits are the same` before scanning.
- The upstream TruffleHog Action definition confirms that empty range inputs use `github.event.before` and `github.event.after` for push events, and pull-request base and head SHAs for pull requests.
- YAML parsing and focused assertions passed: the range inputs are absent and `--results=verified` remains configured.
- `python3 .project-agent-workflow/scripts/validate-changes.py --all` passed, including plan lint, plan formatting, and static security checks.
- Remote `dev` push validation is pending.
