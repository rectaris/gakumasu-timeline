# 2026-04-04 Verification Baseline

## Scope

- `docs/development.md`

## Problem

- repo には `npm run verify` があるが、UI 変更を閉じる際に build/test と実ブラウザ確認の役割差が docs 上では少し見えにくい
- 毎回 agent-only ルールだけを見に行くと、開発フローとして再利用しにくい

## Change

- `docs/development.md` に最小の検証フローを追加
- `npm run verify` を自動確認の基準として位置付けた
- UI 変更時に見るべき実ブラウザ確認項目を短く列挙した

## Expected Effect

- build 成功だけで UI 変更を閉じない運用が repo docs 側でも見える
- 次回以降の PM / engineering の handoff が短くなる

## Verification

- `npm run verify` success on 2026-04-04
- `vitest` 2 files / 6 tests passed
- `vite build` passed
