import { characters } from "./index";

// 登場キャラクターデータの記述方法
// - 各キャラクターの基礎情報は src/data/worldline_commu/ 配下のモジュールを更新する。
// - このファイルでは characters 配列から必要な要素のみを抽出する。
// - 新規キャラクターを追加する場合は、対象世界線ディレクトリにモジュールを追加した上で index.js に登録すること。

export const characterCatalog = characters.map(({ id, name, color }) => ({
  id,
  name,
  color,
}));
