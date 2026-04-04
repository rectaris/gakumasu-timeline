---
created: "2026-04-04"
project: "gakumasu-timeline"
assignee: "pm / engineering"
priority: normal
status: done
---

# Intro Guide Recheck

## Goal

現行の intro-guide 文言を見直し、追加調整が必要かどうかを PM 判断として閉じる。

## Checklist

- [ ] 現在の intro-guide 文言を確認する
- [ ] abstract time の説明との接続で迷いが残るかを確認する
- [ ] 追加修正が必要か不要かを判断する
- [ ] 必要な場合だけ、1件の bounded follow-up に落とす

## Output

- outcome A: 追加修正は不要
- outcome B: 1件の follow-up ticket を起票

## Result

- outcome B
- intro-guide と関連 docs で、`抽象時系列` の説明対象を `日付ラベル` と明示する小さな wording adjustment を実施した
- 実装は `src/App.vue`、`README.md`、`docs/manual.md` に限定した
- `npm run build` は 2026-04-04 に成功した

## Notes

- interaction feel を優先し、文言調整以上の scope には広げない
- cross-repo work は発生させない
