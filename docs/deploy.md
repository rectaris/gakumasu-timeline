# デプロイ

## 公開先

移行中は、GitHub Pagesの現行URLとCloudflare Workersの新URLを並行して扱います。

- 現行URL：`https://rectaris.github.io/timeline/`
- 新URL：`https://curiretas.com/gakumastool/timeline/`

新URLは、ルートポータルとCloudflareの経路設定を確認してから公開します。

## Cloudflare Workers用の準備

次のコマンドは、新URL専用の静的成果物を `.cloudflare-assets/gakumastool/timeline/` に作成します。

```sh
npm run build:curiretas
npx --yes wrangler@4.118.0 deploy --dry-run --config wrangler.timeline.jsonc
```

成果物のディレクトリ階層は、要求されるURLの `/gakumastool/timeline/` と一致させています。

通常の `npm run build` は従来どおり `/timeline/` を対象とし、既存のGitHub Pages配信を変更しません。

`npm run deploy:curiretas` は実際のCloudflareデプロイを行うため、所有者が経路と切替時期を承認した後だけ実行します。

## GitHub Pages

### 前提

- 公開先は `rectaris.github.io` リポジトリ配下です
  - main: `https://rectaris.github.io/timeline/`
  - dev: `https://rectaris.github.io/timeline/dev/`
- Vite の `base` は `rectaris.github.io` 配下の公開パスに合わせてあります
  - `vite.config.js`: `base: '/timeline/'`
- GitHub Actions から `rectaris/rectaris.github.io` へ publish します
  - main branch: `.github/workflows/deploy-main.yml` -> `timeline/`
  - dev/develop branch: `.github/workflows/deploy-dev.yml` -> `timeline/dev/`
- Actions secret `RECTARIS_GITHUB_IO_TOKEN` には `rectaris/rectaris.github.io` へ push できる token を設定してください

### コマンド

- ビルド: `npm run build`
  - `dist/` が生成されます
- デプロイ: `main` または `dev` / `develop` への push で GitHub Actions が実行します
  - `gakumasu-timeline` リポジトリ自身の Pages には publish しません
  - `npm run deploy` は誤操作防止のため publish しません

### よくある注意点

- Pages の公開パスを変えたら、`vite.config.js` の `base` と `rectaris.github.io` 側のリンクも合わせて変更してください
- `gakumasu-timeline` 側の Pages を有効にすると `https://rectaris.github.io/gakumasu-timeline/` が公開されます。正規 URL は `/timeline/` です
- 404 になる場合は、`rectaris.github.io` 側に `timeline/` の成果物があるか、`vite.config.js` の `base` と一致しているかを確認してください
- 新URLの公開前に、`curiretas.com` のルートWorkerが稼働していることと、`curiretas.com/gakumastool/timeline/*` がこのWorkerへ割り当てられていることを確認してください
