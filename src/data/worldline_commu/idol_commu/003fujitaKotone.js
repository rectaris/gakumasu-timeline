import { yearsAgo, yearOf } from "../../utils/time";

export default {
  id: "kotone_fujita",
  name: "藤田 ことね",
  color: "#ffff00", // 黄色（イメージカラー）
  events: [
    {
      id: "003_birth",
      start: { year: yearsAgo(16), month: 4, day: 2 },
      end: { year: yearsAgo(16), month: 4, day: 2 },
      title: "誕生",
      detail: "藤田ことね、誕生",
      participants: ["kotone_fujita"]
    },
    {
      id: "003_scout",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "プロデューサーにスカウトされる",
      detail: "プロデューサーにスカウトされ、アイドル活動を開始する",
      worldlineId: ["story_of_re;iris", "likability_story"],
      participants: ["kotone_fujita"]
    },
    {
      id: "003_debut",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "初星学園高等部進学",
      detail: "初星学園高等部に進学、1年1組に配属される",
      participants: ["kotone_fujita"]
    },
  ]
};
