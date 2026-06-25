// 共通イベント
import commonTimeline from "./generated/worldline_commu/common_timeline";

function sortedDefaultExports(modules) {
  return Object.entries(modules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "en"))
    .map(([, moduleDefault]) => moduleDefault);
}

// アイドルコミュ
// src/data/generated/worldline_commu/idol_commu/
const idolCommuModules = import.meta.glob(
  "./generated/worldline_commu/idol_commu/*.js",
  {
    eager: true,
    import: "default",
  },
);

export const idolCommu = sortedDefaultExports(idolCommuModules);

// 初星コミュ
// src/data/generated/worldline_commu/hatsuboshi_commu/
const hatsuboshiCommuModules = import.meta.glob(
  "./generated/worldline_commu/hatsuboshi_commu/*.js",
  {
    eager: true,
    import: "default",
  },
);

export const hatsuboshiCommus = sortedDefaultExports(hatsuboshiCommuModules);

// イベントコミュ
// src/data/generated/worldline_commu/event_commu/
const eventCommuModules = import.meta.glob(
  "./generated/worldline_commu/event_commu/*.js",
  {
    eager: true,
    import: "default",
  },
);

export const eventCommus = sortedDefaultExports(eventCommuModules);

// サポートカードコミュ
// src/data/generated/worldline_commu/support_story/
const supportCardCommuModules = import.meta.glob(
  "./generated/worldline_commu/support_story/*.js",
  {
    eager: true,
    import: "default",
  },
);

export const supportCardCommus = sortedDefaultExports(supportCardCommuModules);

// 共通イベント（全レーンで表示）
export { commonTimeline };
