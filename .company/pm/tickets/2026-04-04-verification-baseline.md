---
created: "2026-04-04"
project: "gakumasu-timeline"
assignee: "pm / engineering"
priority: normal
status: done
---

# Verification Baseline

## Goal

`gakumasu-timeline` の UI 改修を閉じるとき、最低限そろえる検証の流れを PM と engineering の両方で再利用できる形にする。

## Scope

- 開発 docs に最小の確認手順を追記する
- build と real browser verification の役割差を明確にする
- 既存の repo ルールと衝突しない形にとどめる

## Result

- `docs/development.md` に検証フローを追記した
- `npm run verify` が最低限の自動確認であり、UI 変更時は実ブラウザ確認も必要であることを明記した
- 実ブラウザで優先して見る観点を、interaction feel を壊しやすい項目に絞って整理した
- `npm run verify` は 2026-04-04 に成功し、`vitest` 6件通過と build 成功を確認した

## Exit

- outcome A: PM/engineering が次回以降も同じ確認順で閉じられる
