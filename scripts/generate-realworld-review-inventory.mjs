import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRealworldReviewInventory } from "../src/data/realworldReviewModel.js";

const DEFAULT_OUTPUT_ROOT = ".agent-artifacts/realworld-review";
const PLAN_PATH = "docs/plan/active/078-realworld-review-inventory.md";

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function readJsonDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .sort((left, right) => left.name.localeCompare(right.name, "en"))
      .map((entry) => readJson(path.join(directory, entry.name))),
  );
}

function escapeMarkdown(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replaceAll("|", "\\|");
}

function renderPagination(pagination) {
  if (!pagination) return "－";
  const continuation = pagination.nextPageAvailable ? "続きあり" : "末尾";
  return `${pagination.pagesFetched}/${pagination.pageLimit}ページ、${continuation}`;
}

function renderClues(candidate) {
  const clues = [];
  if (candidate.clues.exactResourcePeerIds.length > 0) {
    clues.push(
      `同一resourceKey ${candidate.clues.exactResourcePeerIds.length}件`,
    );
  }
  if (candidate.clues.exactTitlePeerIds.length > 0) {
    clues.push(`同一正規化タイトル ${candidate.clues.exactTitlePeerIds.length}件`);
  }
  if (candidate.clues.linkedInfoEvents.length > 0) {
    clues.push(
      `InfoEvent ${candidate.clues.linkedInfoEvents
        .map((link) => link.infoEventId)
        .join(", ")}`,
    );
  }
  return clues.length > 0 ? clues.join("、") : "なし";
}

export function renderReviewSummary(inventory, createdAt) {
  const lines = [
    "# 学マス情報史 取り込み候補レビュー在庫",
    "",
    `生成日時：${createdAt}`,
    "",
    "このレポートは取り込み候補を変更せずに一覧化した確認資料です。",
    "一致情報はレビューの手掛かりであり、同じ出来事であることや公開可否を確定しません。",
    "",
    "## 集計",
    "",
    `- 取得元：${inventory.summary.sourceCount}件`,
    `- 取り込みデータセット：${inventory.summary.intakeDatasetCount}件`,
    `- 候補：${inventory.summary.candidateCount}件`,
    `- 収録範囲内の候補：${inventory.summary.eligibleCandidateCount}件`,
    `- 既存InfoEventの出典URLと完全一致した候補：${inventory.summary.linkedCandidateCount}件`,
    `- 同一resourceKeyグループ：${inventory.summary.exactResourceGroupCount}件`,
    `- 同一正規化タイトルグループ：${inventory.summary.exactTitleGroupCount}件`,
    "",
    "## 取得元",
    "",
    "| 取得元 | 取得状態 | 候補 | 収録範囲内 | ページング | 公開日時範囲 |",
    "| --- | --- | ---: | ---: | --- | --- |",
  ];

  for (const source of inventory.sources) {
    const range = source.publishedAtRange
      ? `${source.publishedAtRange.earliest} ～ ${source.publishedAtRange.latest}`
      : "－";
    lines.push(
      `| ${escapeMarkdown(source.label)} | ${source.intakeStatus} | ${source.candidateCount} | ${source.eligibleCandidateCount} | ${renderPagination(source.pagination)} | ${range} |`,
    );
  }

  lines.push(
    "",
    "## 完全一致の手掛かり",
    "",
    "正規化タイトルはUnicode NFKC、英字の小文字化、連続空白の統一だけを適用します。",
    "表記が似ている候補や内容が同じ候補は自動判定しません。",
    "",
    `- 同一resourceKeyグループ：${inventory.exactResourceGroups.length}件`,
    `- 同一正規化タイトルグループ：${inventory.exactTitleGroups.length}件`,
    "",
    "## レビュー候補",
    "",
  );

  let currentSource = null;
  for (const candidate of inventory.candidates) {
    if (candidate.sourceRegistryId !== currentSource) {
      currentSource = candidate.sourceRegistryId;
      lines.push(`### ${escapeMarkdown(candidate.sourceLabel)}`, "");
    }
    lines.push(
      `- ${candidate.publishedAt ?? "公開日時なし"}：[${escapeMarkdown(candidate.title)}](${candidate.canonicalUrl})`,
      `  - intake ID：\`${candidate.id}\``,
      `  - 取得状態：${candidate.intakeStatus}、収録範囲：${candidate.eligible ? "対象" : "対象外"}`,
      `  - 完全一致の手掛かり：${escapeMarkdown(renderClues(candidate))}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

function makeRunId(now) {
  return `${now
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z")}-inventory`;
}

export async function generateReviewArtifacts({
  projectRoot = process.cwd(),
  outputRoot = DEFAULT_OUTPUT_ROOT,
  now = new Date(),
  runId = makeRunId(now),
} = {}) {
  const realworldRoot = path.join(
    projectRoot,
    "data/raw/realworld_events",
  );
  const registry = await readJson(
    path.join(realworldRoot, "source-registry.json"),
  );
  const intakeDatasets = await readJsonDirectory(
    path.join(realworldRoot, "intake"),
  );
  const infoEventDatasets = [
    await readJson(path.join(realworldRoot, "published.json")),
    ...(await readJsonDirectory(path.join(realworldRoot, "unreviewed"))),
  ];
  const inventory = buildRealworldReviewInventory({
    registry,
    intakeDatasets,
    infoEventDatasets,
  });

  const createdAt = now.toISOString();
  const artifactDirectory = path.resolve(projectRoot, outputRoot, runId);
  await fs.mkdir(artifactDirectory, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(artifactDirectory, "inventory.json"),
      `${JSON.stringify(inventory, null, 2)}\n`,
    ),
    fs.writeFile(
      path.join(artifactDirectory, "summary.md"),
      renderReviewSummary(inventory, createdAt),
    ),
    fs.writeFile(
      path.join(artifactDirectory, "manifest.json"),
      `${JSON.stringify(
        {
          run_id: runId,
          created_at: createdAt,
          task: "real-world intake review inventory",
          plans: [PLAN_PATH],
          raw_logs: [],
          artifacts: ["inventory.json", "summary.md"],
          compressed_outputs: [],
          redaction_report: "redaction-report.md",
          pinned: false,
        },
        null,
        2,
      )}\n`,
    ),
    fs.writeFile(
      path.join(artifactDirectory, "redaction-report.md"),
      [
        "# Redaction report",
        "",
        "- 公開済みのリポジトリ内JSONだけを読み込みました。",
        "- 認証情報、環境変数、`.env.local`は読み込みも出力もしていません。",
        "- 外部APIやWebサイトへの通信は行っていません。",
        "- 候補の概要本文はレポートへ出力していません。",
        "- 秘密情報らしい内容の手動確認は不要です。",
        "",
      ].join("\n"),
    ),
  ]);

  return { artifactDirectory, inventory, runId };
}

async function main() {
  const result = await generateReviewArtifacts();
  console.log(`Review inventory: ${result.inventory.summary.candidateCount} candidate(s).`);
  console.log(`Local artifacts: ${result.artifactDirectory}`);
}

const entrypoint = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (entrypoint) {
  await main();
}
