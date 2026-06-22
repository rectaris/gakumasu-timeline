import { idolCommu } from "./index";
import { characterColorSources } from "./colorSources";

// 登場キャラクターデータの記述方法
// - 各キャラクターの基礎情報は data/raw/worldline_commu/idol_commu/ 配下のモジュールを更新する。
// - このファイルでは idolCommu 配列から必要な要素のみを抽出する。
// - 新規キャラクターを追加する場合は、raw モジュールを追加して生成済みデータを更新すること。

export const characterCatalog = idolCommu.map(({ id, name, color }) => ({
  id,
  name,
  color,
  colorSource: characterColorSources[id] ?? null,
}));
