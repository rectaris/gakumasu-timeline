# Shrink lane height after dense summary compression

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
  - At minimum lane density, a lane whose visible events have been compressed into summaries must shrink to the rendered event footprint instead of retaining the original full-event sub-lane height.
  - Fixed event height, fixed top padding, and fixed adjacent sub-lane spacing must remain unchanged.
  - The selected event must remain visible and must prevent its own cluster from being fully collapsed into a summary.
  - Timeline drag, zoom, dense summary, lane labels, and `singleWithinRange` rendering must not regress.
acceptance_focus:
  - Summary-driven lane height
  - Minimum density shrink
  - Preserved spacing contracts
expected_output: full-implementation
checked_summary_ja: 密集サマリー化後の表示量に合わせて最低密度のレーン高さを縮める。

## Notes

## Request Summary

添付画像では、最低密度の状態でイベントは密集サマリーへ圧縮されているが、レーン自体の高さが圧縮前の全サブレーン数のまま残っている。

ユーザーは、最低密度でレーンが見た目どおりに縮むよう修正することを求めている。

## Current Hypothesis

`useTimelineLayout` は `visibleEvents` で密集サマリーを作っている。

一方で `laneLayouts` は `laneEventLayouts.value[laneIndex].subLaneCount` を使っており、圧縮前の元イベント配置からレーン高さを計算している。

そのため、表示上はサマリー 1 件になっても、レーン高さは圧縮前の複数サブレーン分を保持している。

## Implementation Plan

1. `visibleEvents` からレーンごとの最大 `subLaneIndex` を集計し、描画に必要なサブレーン数を計算する。
2. `laneLayouts` の高さ計算では、元イベントの `subLaneCount` ではなく、描画中イベントとサマリーの有効サブレーン数を使う。
3. `laneLayouts` の戻り値には、デバッグやメトリクス用に元の `subLaneCount` と描画中の `renderedSubLaneCount` を分けて持たせる。
4. 最低密度かつ密集サマリーが発生するテストを追加し、レーン高さが `MIN_SINGLE_EVENT_LANE_HEIGHT` まで縮むことを確認する。
5. 既存のイベント高さ、上端余白、重なりイベント間隔の固定テストを維持する。
6. 必要に応じて人間向けドキュメントの「密度」説明を、圧縮後の表示量に追従する旨へ更新する。

## Implementation Decisions

- レーン高さは、現在描画されるイベントとサマリーの `subLaneIndex` に基づいて決める。
- サマリー化されずに表示される選択イベントや非圧縮イベントが高い `subLaneIndex` に残る場合は、その表示に必要な高さを維持する。
- 元イベントのサブレーン数は、密集メトリクスやデバッグ用の情報として保持し、レーン高さの直接入力にはしない。

## Implementation Summary

- Added `renderedSubLaneCounts` in `useTimelineLayout`.
- Changed `laneLayouts` height calculation to use rendered event and summary sub-lane counts.
- Preserved the original `subLaneCount` on lane layout objects and added `renderedSubLaneCount` for the height input.
- Added a layout regression test proving a four-sub-lane dense cluster shrinks to one rendered summary lane at minimum density.
- Updated human-facing behavior docs and manual text for summary-driven lane height.

## Validation Results

- `npm run test -- tests/useTimelineLayout.test.js`: passed, 10 tests.
- `npm run test`: passed, 14 files and 72 tests.
- `npm run build`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `git diff --check`: passed.

## Browser Verification

- Preview URL: `http://127.0.0.1:4174/timeline/`.
- Desktop `2048x1024`, focused lane `saki_hanami`: first lane height changed from `86px` at `100%` to `64px` at `70%`; rendered bars changed from `12` to `8`; rendered bar bottom moved from `146px` to `124px`.
- Desktop `1280x900`: first lane height changed from `86px` at `100%` to `64px` at `70%`.
- Mobile `375x812`: first lane height changed from `86px` at `100%` to `64px` at `70%`.

## Residual Notes

- Browser verification observed an aborted external Google ad quality request on localhost. No app asset or data request failed.
