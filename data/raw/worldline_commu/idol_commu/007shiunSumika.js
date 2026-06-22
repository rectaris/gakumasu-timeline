const yearsAgo = (years) => 1 - years;
const yearOf = (year) => year;

export default {
  id: "sumika_shiun",
  name: "紫雲 清夏",
  color: "#7EFC04",
  events: [
    {
      id: "sumika_debut",
      start: { year: yearOf(1), month: 1 },
      end: { year: yearOf(1), month: 1 },
      occurrenceType: "singleWithinRange",
      title: "初星学園入学",
      detail: "不真面目系ギャルとしてアイドル活動開始",
    },
  ],
};
// 幼少期にスウェーデン留学 https://asobichannel.asobistore.jp/watch/pqgov816y
