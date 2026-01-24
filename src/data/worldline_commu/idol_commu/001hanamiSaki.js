import { yearsAgo, yearOf } from "../../utils/time";

export default {
  id: "saki_hanami",
  name: "花海 咲季",
  color: "#ff0000", // 赤（イメージカラー）
  events: [
    {
      id: "001_birth",
      start: { year: yearsAgo(16), month: 4, day: 2 },
      end: { year: yearsAgo(16), month: 4, day: 2 },
      title: "誕生",
      detail: "花海咲季、誕生",
      participants: ["saki_hanami"]
    },
    {
      id: "001_born_ume",
      start: { year: yearsAgo(15), month: 4, day: 1 },
      end: { year: yearsAgo(15), month: 4, day: 1 },
      title: "佑芽が生まれる",
      detail: "妹、佑芽が生まれる",
      participants: ["saki_hanami", "ume_hanami"]
    },
    {
      id: "001_reason1",
      start: { year: yearsAgo(13), month: 1, day: 1 },
      end: { year: yearsAgo(5), month: 1, day: 1 },
      title: "世界一を目指す理由",
      detail: "咲季がアイドルで世界一を目指す理由",
      participants: ["saki_hanami", "ume_hanami"],
      source: "親愛度10コミュ"
    },
    {
      id: "001_scout",
      start: { year: yearOf(1), month: 3, day: 20 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "プロデューサーにスカウトされる",
      detail: "プロデューサーにスカウトされ、アイドル活動を開始する",
      worldlineId: ["story_of_re;iris", "likability_story"],
      participants: ["saki_hanami"],
      source: "初星コミュ1話",
      note: "入学式当日の早朝か、それ以前からスカウトされている可能性がある。\n初星学園は私立の学校法人のため、入学式の日程にはばらつきがある可能性がある。\n初星学園は関東圏の学校である可能性が高いため、4月7日〜8日の間に入学式が行われたと推測される。"
    },
    {
      id: "001_debut",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "初星学園高等部入学式",
      detail: "初星学園高等部に入学、1年1組に配属される",
      participants: ["saki_hanami"],
      note: "初星学園は私立の学校法人のため、入学式の日程にはばらつきがある可能性がある。\n初星学園は関東圏の学校である可能性が高いため、4月7日〜8日の間に入学式が行われたと推測される。"
    },
    {
      id: "001_kotone_battle",
      start: { year: yearOf(1), month: 4, day: 3 },
      end: { year: yearOf(1), month: 4, day: 12 },
      title: "ことねとのダンス勝負",
      detail: "プロデューサーにスカウトされ、アイドル活動を開始する",
      worldlineId: ["story_of_re;iris"],
      participants: ["saki_hanami"]
    }
  ]
};
