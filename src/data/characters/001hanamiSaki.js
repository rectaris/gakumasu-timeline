import { yearsAgo, yearOf } from "../utils/time";

export default {
  id: "saki_hanami",
  name: "花海 咲季",
  color: "#ff0000", // 赤（イメージカラー）
  events: [
    {
      id: "saki_birth",
      start: { year: yearsAgo(16), month: 4, day: 2 },
      end: { year: yearsAgo(16), month: 4, day: 2 },
      title: "誕生",
      detail: "花海咲季、誕生"
    },
    {
      id: "saki_debut",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "初星学園入学",
      detail: "初星学園に入学、1年1組に配属される"
    }
  ]
};
