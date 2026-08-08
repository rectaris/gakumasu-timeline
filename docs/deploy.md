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
npx wrangler deploy --dry-run --config wrangler.timeline.jsonc
```

成果物のディレクトリ階層は、要求されるURLの `/gakumastool/timeline/` と一致させています。

通常の `npm run build` は従来どおり `/timeline/` を対象とし、既存のGitHub Pages配信を変更しません。

`npm run deploy:curiretas` は実際のCloudflareデプロイを行うため、所有者が経路と切替時期を承認した後だけ実行します。

## タイムライン投稿用WorkerとD1

Curiretas向け配信は、静的アセットと投稿APIを同じWorkerで扱います。

静的ファイルは従来どおり `/gakumastool/timeline/` で配信し、Workerコードを先に実行するのは `/gakumastool/timeline/api/authoring/*` だけです。

subpath配信でqueryなしAPIも確実にWorkerへ渡すため、`run_worker_first` にはルート相対の `/api/authoring/*` と完全パスの両方を指定します。

| 項目 | 設定値 |
| --- | --- |
| Worker | `gakumasu-timeline-curiretas` |
| D1データベース | `gakumasu-timeline-prod` |
| D1 Binding | `TIMELINE_DB` |
| D1 database id | `ab1ff388-0a9b-44ce-86d8-c885d425c635` |
| Service Binding | `ACCOUNT_SERVICE` |
| Service Bindingの接続先 | `curiretas-account` |

D1は2026年8月8日に `apac` を配置ヒントとして作成され、作成後の `wrangler d1 info` は `running_in_region: APAC` を返しました。

本番スキーマ確認クエリはprimaryから処理され、実行メタデータは `served_by_region: APAC` と `served_by_colo: SIN` を返しました。

`apac` は近い配置を求めるヒントであり、日本国内での保存を保証する指定ではありません。

### マイグレーション

マイグレーションのsource of truthは `workers/migrations/` です。

最初にローカルD1へ適用し、Workerテストとビルドを通してから本番D1へ適用します。

```sh
npm run db:migrate:local
npm run test:worker
npm run check:worker
npm run db:migrate:remote
```

本番マイグレーションの適用前には、`wrangler whoami` と `wrangler d1 list` で対象アカウントとデータベース名を確認します。

### 最初の管理者

管理APIを初めて使う前に、アカウント管理者が確認した安定アカウントIDを1件だけD1へ投入します。

メールアドレス、表示名、OAuthのsubjectは使いません。

`<STABLE_ACCOUNT_ID>` は人が選択した実IDへ置き換え、置換後のコマンドやIDをリポジトリへ保存しません。

```sh
npx wrangler d1 execute gakumasu-timeline-prod --remote --config wrangler.timeline.jsonc --command "INSERT INTO role_grants (id, account_id, role, granted_by_account_id, granted_at) VALUES (lower(hex(randomblob(16))), '<STABLE_ACCOUNT_ID>', 'admin', '<STABLE_ACCOUNT_ID>', unixepoch() * 1000);"
```

投入後は、対象アカウントでログインし、`GET /gakumastool/timeline/api/authoring/me` が `admin` を返すことをブラウザから確認します。

以後の付与と失効は管理APIを使い、`role_grants` の監査履歴を残します。

### デプロイ順序

`ACCOUNT_SERVICE` の接続先である `curiretas-account` Workerが先に存在している必要があります。

今回利用する `GET /auth/session` の契約が変わっていない場合、アカウントWorkerの再デプロイは不要です。

契約を互換拡張した場合だけアカウントWorkerを先にデプロイし、その後に次のコマンドでタイムラインWorkerをデプロイします。

```sh
npm run validate:data
npm run test
npm run check:worker
npm run build:curiretas
npm run deploy:curiretas
```

### エクスポートと復旧

申請データの退避は、個人識別子を含むローカル専用ファイルとして取得します。

```sh
mkdir -p .agent-artifacts/timeline-authoring-backups
npx wrangler d1 export gakumasu-timeline-prod --remote --config wrangler.timeline.jsonc --output .agent-artifacts/timeline-authoring-backups/timeline-authoring.sql
```

エクスポートファイルはGitへ追加せず、閲覧権限と保管期間を明示した安全な保管先へ移します。

復旧前には現在のD1もエクスポートし、復旧対象、影響する申請ID、ロール履歴、復旧時点を確認します。

復旧は新しい検証用D1でSQLを読み込んで整合性を確認してから、本番への適用方法を個別に承認します。

### アカウント削除後の追跡

アカウントD1とタイムラインD1の間に外部キーや自動cascadeはありません。

アカウント削除の連絡を受けた場合は、安定アカウントIDで `role_grants`、`change_requests`、`review_decisions` を検索し、対象件数を記録します。

監査履歴の保持期間と匿名化・削除方針は未確定なので、トリガーを外す即席SQLは実行しません。

削除または匿名化が必要な場合は、監査要件と公開済みGit履歴への影響を確認した専用マイグレーションとしてレビューします。

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

Workers Buildsは実行時に`WORKERS_CI=1`を設定します。`npm run verify`はこの値を検出すると、NodeとWorkerのテスト、ビルド、本番成果物の公開境界検証を実行し、Playwright UI検証だけを実行しません。Chromiumを使うUI検証は、事前にブラウザをインストールするGitHub Actionsで維持します。

有効化後の運用は次のとおりです。

1. `dev` へのpushとPull RequestでGitHub Actionsの検証を通します。
2. Pull Requestを `main` へマージします。
3. Workers Buildsが `npm run verify` を実行し、ブラウザを必要としない検証を完了します。
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
