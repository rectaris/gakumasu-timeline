# Implementation Plan: Static Integration

status: active
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
completion_deferred_reason: Static integration remains a separate active work item.
target_files:
  - vite.config.*
  - src/
  - docs/deploy.md
  - docs/plan/plan.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_VALIDATION.md
validation:
  - npm run build
  - git diff --check
acceptance:
  - Timeline app can be served under the expected GitHub Pages subdirectory.
  - Asset references work with the configured base path.
acceptance_focus:
  - GitHub Pages subdirectory behavior
  - asset paths
expected_output: full-implementation
checked_summary_ja: rectaris.github.io 配下で動作する静的統合設定を完了する。

## Goal

Optimize the timeline application for seamless integration as a subdirectory under `rectaris.github.io`.

## Tasks

### 1. Static Deployment Optimization

- [ ] Set Vite `base` to `/timeline/` for production builds.
- [ ] Ensure all asset references (images, icons) are relative.

### 2. Component Sharing (Optional)

- [ ] Identify opportunities to share UI components or types with the `supportcard-status` TS port to maintain visual consistency.

### 3. Verification

- [ ] Verify functionality when hosted at `https://rectaris.github.io/timeline/`.
