# デプロイ（GitHub Pages）

## 前提

- 公開先は `rectaris.github.io` リポジトリ配下です
  - main: `https://rectaris.github.io/timeline/`
  - dev: `https://rectaris.github.io/timeline/dev/`
- Vite の `base` は `rectaris.github.io` 配下の公開パスに合わせてあります
  - `vite.config.js`: `base: '/timeline/'`
- GitHub Actions から `rectaris/rectaris.github.io` へ publish します
  - main branch: `.github/workflows/deploy-main.yml` -> `timeline/`
  - dev/develop branch: `.github/workflows/deploy-dev.yml` -> `timeline/dev/`
- Actions secret `RECTARIS_GITHUB_IO_TOKEN` には `rectaris/rectaris.github.io` へ push できる token を設定してください

## コマンド

- ビルド: `npm run build`
  - `dist/` が生成されます
- デプロイ: `main` または `dev` / `develop` への push で GitHub Actions が実行します
  - `gakumasu-timeline` リポジトリ自身の Pages には publish しません
  - `npm run deploy` は誤操作防止のため publish しません

## よくある注意点

- Pages の公開パスを変えたら、`vite.config.js` の `base` と `rectaris.github.io` 側のリンクも合わせて変更してください
- `gakumasu-timeline` 側の Pages を有効にすると `https://rectaris.github.io/gakumasu-timeline/` が公開されます。正規 URL は `/timeline/` です
- 404 になる場合は、`rectaris.github.io` 側に `timeline/` の成果物があるか、`vite.config.js` の `base` と一致しているかを確認してください
