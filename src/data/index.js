// 共通イベント
import commonTimeline from "./worldline_commu/common_timeline";

function sortedDefaultExports(modules) {
  return Object.entries(modules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "en"))
    .map(([, moduleDefault]) => moduleDefault);
}

// アイドルコミュ
// src/data/worldline_commu/idol_commu/
const idolCommuModules = import.meta.glob(
  "./worldline_commu/idol_commu/*.js",
  {
    eager: true,
    import: "default",
  },
);

export const idolCommu = sortedDefaultExports(idolCommuModules);

// 初星コミュ
// src/data/worldline_commu/hatsuboshi_commu/
import storyOfReiris from "./worldline_commu/hatsuboshi_commu/001storyOfReiris";

export const hatsuboshiCommus = [storyOfReiris];

// イベントコミュ
// src/data/worldline_commu/event_commu/

export const eventCommus = [
  // 今後追加予定
];

// サポートカードコミュ
// src/data/worldline_commu/support_story/

export const supportCardCommus = [
  // 今後追加予定
];

// 共通イベント（全レーンで表示）
export { commonTimeline };
