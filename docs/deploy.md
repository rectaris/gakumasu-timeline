# デプロイと自動デプロイ

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

## GitHub上の検証

`.github/workflows/ci.yml` は、`main` と `dev` へのpush、およびすべてのPull Requestでテストとビルドを実行します。

GitHub Actionsの検証はCloudflareの認証情報を使用せず、本番Workerを更新しません。

## Cloudflare Git連携

Cloudflare Workers BuildsのGit連携を有効にすると、`main` へのpushが本番Workerの自動デプロイを開始します。

Cloudflare Dashboardの既存 `gakumasu-timeline-curiretas` Workerで、`Settings`、`Builds`、`Connect` の順に開き、次の値を設定します。

| 項目 | 設定値 |
| --- | --- |
| GitHub repository | `rectaris/gakumasu-timeline` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run verify` |
| Deploy command | `npm run deploy:curiretas` |
| Non-production branch builds | 無効 |
| Node.js | `.node-version` の24 |

Cloudflare Workers and Pages GitHub AppのRepository accessは、このリポジトリだけに限定します。

Workers Buildsの認証情報はCloudflare側で管理し、`CLOUDFLARE_API_TOKEN` や `CLOUDFLARE_ACCOUNT_ID` をGitHub Secretsへ追加しません。

有効化後の運用は次のとおりです。

1. `dev` へのpushとPull RequestでGitHub Actionsの検証を通します。
2. Pull Requestを `main` へマージします。
3. Workers Buildsが `npm run verify` を実行します。
4. 検証が成功した場合だけ、Workers Buildsが `npm run deploy:curiretas` で本番Workerを更新します。
5. Cloudflareのbuild logとGitHubのcheck runで対象commitを確認します。
6. 新URLの3画面、直接の静的asset、ブラウザconsole、network errorを確認します。

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
