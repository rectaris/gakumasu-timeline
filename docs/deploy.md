# デプロイ（GitHub Pages）

## 前提

- Vite の `base` は `rectaris.github.io` 配下の公開パスに合わせてあります
  - `vite.config.js`: `base: '/timeline/'`

## コマンド

- ビルド: `npm run build`
  - `dist/` が生成されます
- デプロイ: `npm run deploy`
  - `gh-pages -d dist`
  - `dist/` を GitHub Pages 用のブランチに publish します

## よくある注意点

- Pages の公開パスを変えたら、`vite.config.js` の `base` と `rectaris.github.io` 側のリンクも合わせて変更してください
- 404 になる場合は、Pages の設定（公開ブランチ/ディレクトリ）と `base` の不一致が多いです
