# Make lane density scaling continuous

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/composables/useTimelineLayout.js
  - tests/useTimelineLayout.test.js
  - docs/ui-behavior.md
  - docs/manual.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - agents-rules/ui-change-playbook.md
  - agents-rules/timeline-regression-checklist.md
validation:
  - npm run test -- tests/useTimelineLayout.test.js
  - npm run build
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - Lane height must change continuously when density changes between the minimum value and `100%`.
  - Lane height must change continuously when density changes between `100%` and `150%`.
  - Minimum density must still fit the rendered event or summary footprint.
  - Fixed event height, fixed lane top padding, and fixed sub-lane spacing must remain unchanged.
  - Dense summary compression must still reduce lane height according to rendered footprint.
acceptance_focus:
  - Continuous density scaling
  - No plateau around 70-150%
  - Preserved fixed event spacing
expected_output: full-implementation
checked_summary_ja: 密度操作でレーン高さが全区間で連続的に変わるようにする。

## Notes

## Request Summary

ユーザーは、最低値付近の `70%` から `90%` と、`100%` から `150%` の間で密度値を変えてもレーンの大きさが変わらないと報告している。

期待する挙動は、密度操作の全区間でレーン高さがシームレスに変わること。

## Current Hypothesis

現在の `laneHeight` は `Math.max(densityMinHeight, renderedContentHeight)` で決まる。

このため、`densityMinHeight` が `renderedContentHeight` を超えるまではレーン高さが固定される。

密集サマリー化で描画量が減っても、表示内容の必要高さが勝っている区間では同じ段差が残る。

## Implementation Plan

1. レーン高さを `max()` ではなく、描画内容に必要な高さから FHD 上限へ向かう線形補間で決める。
2. 補間率は `MIN_VERTICAL_SCALE` から `MAX_VERTICAL_SCALE` の範囲で正規化する。
3. 最低密度では `renderedSubLaneCount * EVENT_SUB_LANE_SPACING + LANE_PADDING * 2` になるようにする。
4. 最大密度では、描画内容が FHD 上限以下なら `MAX_FULL_HD_SINGLE_LANE_HEIGHT` に近づける。
5. 描画内容が FHD 上限を超える場合は、イベントを切らないために内容高さを下限として維持する。
6. `70%`、`90%`、`100%`、`150%` の代表値でレーン高さが単調増加するテストを追加する。
7. 人間向けドキュメントは、密度が余白量を連続的に調整する説明へ更新する。

## Implementation Decisions

- イベント高さ、レーン上端余白、サブレーン間隔は固定のままにする。
- 密度値は、描画内容に追加する余白量を制御する値として扱う。
- `100%` は既存の標準値として維持し、1イベントだけのレーンでは従来どおり約 `MIN_LANE_HEIGHT` になる式にする。

## Implementation Summary

- Replaced the `Math.max(densityMinHeight, renderedContentHeight)` lane-height plateau with linear interpolation.
- Minimum density now uses the rendered content footprint exactly.
- Higher density values add continuous extra lane space toward the FHD one-lane upper bound.
- Preserved fixed event height, lane top padding, and sub-lane spacing.
- Added a focused regression test for `70%`, `90%`, `100%`, and `150%` lane-height growth.
- Updated human-facing density docs to describe continuous extra spacing.

## Validation Results

- `npm run test -- tests/useTimelineLayout.test.js`: passed, 11 tests.
- `npm run test`: passed, 14 files and 73 tests.
- `npm run build`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `git diff --check`: passed.

## Browser Verification

- Preview URL: `http://127.0.0.1:4174/timeline/`.
- Desktop `2048x1024`, focused lane `saki_hanami`: first lane heights were `64px` at `70%`, `75.66917293233084px` at `90%`, `103.00751879699249px` at `100%`, and `131.35338345864662px` at `150%`.
- Mobile `375x812`, focused lane `saki_hanami`: first lane heights matched the same sequence.
- No app console errors or app asset/data request failures were observed in the desktop browser verification.

## Residual Notes

- The number of rendered bars can still change when dense-summary grouping changes. The lane-height calculation now follows the current rendered footprint continuously instead of staying flat behind a `max()` threshold.
