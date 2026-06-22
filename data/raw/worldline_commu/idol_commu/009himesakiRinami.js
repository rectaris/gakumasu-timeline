const yearsAgo = (years) => 1 - years;
const yearOf = (year) => year;

export default {
  id: "rinami_himesaki",
  name: "姫崎 莉波",
  color: "#F6AEC6",
  events: [
    {
      id: "rinami_debut",
      start: { year: yearOf(1), month: 1 },
      end: { year: yearOf(1), month: 1 },
      occurrenceType: "singleWithinRange",
      title: "初星学園入学",
      detail: "姫崎莉波として活動開始",
    },
  ],
};
