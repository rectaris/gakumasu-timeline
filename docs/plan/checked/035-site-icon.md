# Add custom timeline site icon.

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - index.html
  - public/favicon.svg
  - public/vite.svg
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_ENVIRONMENT.md
validation:
  - git diff --check
  - npm run build
  - inspect built icon asset paths
acceptance:
  - Default Vite icon is no longer referenced.
  - Site icon uses Gakumasu official color sources and timeline visual motif.
  - Build output references the new icon under the configured base path.
acceptance_focus:
  - static asset path
  - small-size icon readability
expected_output: full-implementation
checked_summary_ja: 学マス配色のタイムライン用サイトアイコンを追加する。

## Notes

- Use the built-in image generation path requested by the user for concept exploration.
- Final site icon is a deterministic SVG because generated bitmap candidates were not readable enough at favicon size.
- Implemented `public/favicon.svg` with official color-source palette values and a compact multi-lane timeline motif.
- Replaced `%BASE_URL%vite.svg` with `%BASE_URL%favicon.svg` and removed the default Vite icon asset.
- Validation:
  - `google-chrome-stable --headless=new ... public/favicon.svg` at 256px and 32px
  - `npm run build`
  - inspected `dist/index.html` for `/timeline/favicon.svg`
  - `curl -fsSLI http://127.0.0.1:4174/timeline/favicon.svg`
  - `python3 scripts/validate-changes.py`
- Preview URL during validation: `http://127.0.0.1:4174/timeline/`
