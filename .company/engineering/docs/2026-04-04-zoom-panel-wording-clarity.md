# 2026-04-04 Zoom Panel Wording Clarity

## Scope

- `src/components/ZoomControls.vue`
- `README.md`
- `docs/manual.md`

## Problem

- `表示期間` と `レーン密度` の役割差は docs では説明されているが、UI 上では初見で横軸 / 縦軸の対応が少し読み取りにくい
- レイアウト変更まで広げると scope が広くなるため、今回は wording だけで改善する

## Change

- UI ラベルを `表示期間（横軸）` と `レーン密度（縦軸）` に変更
- ボタンの aria-label / title、操作ヒントも同じ軸表現に揃えた
- README / manual も最小差分で同期した

## Expected Effect

- 初見ユーザーが「何が横方向の調整で、何が縦方向の調整か」を早く判断しやすくなる
- interaction feel を変えずに理解コストだけ下げる
