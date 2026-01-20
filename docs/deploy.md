# デプロイ（GitHub Pages）

## 前提

- Vite の `base` は GitHub Pages のリポジトリ名に合わせてあります
  - `vite.config.js`: `base: '/gakumasu-timeline/'`

## コマンド

- ビルド: `npm run build`
  - `dist/` が生成されます
- デプロイ: `npm run deploy`
  - `gh-pages -d dist`
  - `dist/` を GitHub Pages 用のブランチに publish します

## よくある注意点

- リポジトリ名や Pages の公開パスを変えたら、`vite.config.js` の `base` も合わせて変更してください
- 404 になる場合は、Pages の設定（公開ブランチ/ディレクトリ）と `base` の不一致が多いです
