const OFFICIAL_SITE_URL = "https://gakuen.idolmaster-official.jp/";
const OFFICIAL_SHARE_CSS_URL =
  "https://gakuen.idolmaster-official.jp/assets/css/share.css?date=251119";
const OFFICIAL_SYSTEM_URL = "https://gakuen.idolmaster-official.jp/system/";

export const COLOR_PROVENANCE = {
  OFFICIAL_CSS: "official-css",
  OFFICIAL_IMAGE_SAMPLED: "official-image-sampled",
  LOCAL_LEGACY: "local-legacy",
  INFERRED: "inferred",
  TEMPORARY: "temporary"
};

export const COLOR_CONFIDENCE = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low"
};

export const characterColorSources = {
  saki_hanami: {
    sourceColor: "#E30F25",
    legacyColor: "#E30920",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.saki .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  temari_tsukimura: {
    sourceColor: "#0C7BBB",
    legacyColor: "#0D7CBC",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.temari .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  kotone_fujita: {
    sourceColor: "#F8C112",
    legacyColor: "#F8C216",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.kotone .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  mao_arimura: {
    sourceColor: "#7F1184",
    legacyColor: "#801184",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.mao .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  lilja_katsuragi: {
    sourceColor: "#EAFDFF",
    legacyColor: "#EAFDFF",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.lilja .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  china_kuramoto: {
    sourceColor: "#F68B1F",
    legacyColor: "#F68C21",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.china .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  sumika_shiun: {
    sourceColor: "#7CFC00",
    legacyColor: "#7EFC04",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.sumika .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  hiro_shinosawa: {
    sourceColor: "#00AFCC",
    legacyColor: "#02B0CD",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.hiro .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  rinami_himesaki: {
    sourceColor: "#F6ADC6",
    legacyColor: "#F6AEC6",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.rinami .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  ume_hanami: {
    sourceColor: "#EA533A",
    legacyColor: "#EA543B",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.ume .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  sena_juo: {
    sourceColor: "#F6AE54",
    legacyColor: "#F7B869",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.sena .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  misuzu_hataya: {
    sourceColor: "#7A99CF",
    legacyColor: "#7B9ACF",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.misuzu .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  },
  tsubame_amaya: {
    sourceColor: "#7B68EE",
    legacyColor: "#7C69EE",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    sourceSelector: ".footer-chara__inner.tsubame .footer-chara__name",
    confidence: COLOR_CONFIDENCE.HIGH
  }
};

export const worldlineColorSources = {
  story_of_reiris: {
    sourceColor: "#826EB4",
    legacyColor: "#826EB4",
    provenance: COLOR_PROVENANCE.LOCAL_LEGACY,
    sourceUrl: null,
    confidence: COLOR_CONFIDENCE.MEDIUM,
    note: "Existing local worldline color; no official CSS token has been identified yet."
  }
};

export const semanticColorSources = {
  common_events: {
    sourceColor: "#F6F1E8",
    legacyColor: "#FFFFFF",
    provenance: COLOR_PROVENANCE.INFERRED,
    sourceUrl: OFFICIAL_SITE_URL,
    confidence: COLOR_CONFIDENCE.MEDIUM,
    note: "Neutral common-event color derived from app needs; lane association is represented with lane accents."
  },
  selected_event: {
    sourceColor: "#1A1A1A",
    provenance: COLOR_PROVENANCE.INFERRED,
    sourceUrl: null,
    confidence: COLOR_CONFIDENCE.MEDIUM
  },
  uncertain_event: {
    sourceColor: "#535353",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    confidence: COLOR_CONFIDENCE.MEDIUM
  }
};

export const officialBrandColorSources = {
  primary_orange: {
    sourceColor: "#F39800",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    confidence: COLOR_CONFIDENCE.HIGH,
    note: "Frequent official site UI accent."
  },
  strong_orange: {
    sourceColor: "#FF7600",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    confidence: COLOR_CONFIDENCE.HIGH,
    note: "Frequent official site gradient accent."
  },
  sky_blue: {
    sourceColor: "#4EB0F2",
    provenance: COLOR_PROVENANCE.OFFICIAL_CSS,
    sourceUrl: OFFICIAL_SHARE_CSS_URL,
    confidence: COLOR_CONFIDENCE.HIGH,
    note: "Official site UI support color."
  }
};

export const officialImageSampledColorSources = [
  {
    id: "produce.lesson-pink",
    sourceColor: "#D654BD",
    provenance: COLOR_PROVENANCE.OFFICIAL_IMAGE_SAMPLED,
    sourceUrl: `${OFFICIAL_SITE_URL}assets/img/system/thumb_produce_1_pc.png`,
    sourcePageUrl: OFFICIAL_SYSTEM_URL,
    sampleRegion: "dominant saturated UI/pink area",
    confidence: COLOR_CONFIDENCE.LOW
  },
  {
    id: "produce.training-blue",
    sourceColor: "#5FABD4",
    provenance: COLOR_PROVENANCE.OFFICIAL_IMAGE_SAMPLED,
    sourceUrl: `${OFFICIAL_SITE_URL}assets/img/system/thumb_produce_2_pc.png`,
    sourcePageUrl: OFFICIAL_SYSTEM_URL,
    sampleRegion: "dominant blue UI/background area",
    confidence: COLOR_CONFIDENCE.LOW
  },
  {
    id: "produce.live-yellow",
    sourceColor: "#FEDC3F",
    provenance: COLOR_PROVENANCE.OFFICIAL_IMAGE_SAMPLED,
    sourceUrl: `${OFFICIAL_SITE_URL}assets/img/system/thumb_produce_4_pc.png`,
    sourcePageUrl: OFFICIAL_SYSTEM_URL,
    sampleRegion: "dominant yellow light/UI area",
    confidence: COLOR_CONFIDENCE.LOW
  },
  {
    id: "stage.light-warm",
    sourceColor: "#FBE0B2",
    provenance: COLOR_PROVENANCE.OFFICIAL_IMAGE_SAMPLED,
    sourceUrl: `${OFFICIAL_SITE_URL}assets/img/system/thumb_stage_1_pc.png`,
    sourcePageUrl: OFFICIAL_SYSTEM_URL,
    sampleRegion: "dominant warm stage light",
    confidence: COLOR_CONFIDENCE.LOW
  },
  {
    id: "stage.cool-blue",
    sourceColor: "#6795FE",
    provenance: COLOR_PROVENANCE.OFFICIAL_IMAGE_SAMPLED,
    sourceUrl: `${OFFICIAL_SITE_URL}assets/img/system/thumb_stage_3_pc.png`,
    sourcePageUrl: OFFICIAL_SYSTEM_URL,
    sampleRegion: "dominant cool stage light",
    confidence: COLOR_CONFIDENCE.LOW
  }
];

export function getColorSourceById(id) {
  return (
    characterColorSources[id] ??
    worldlineColorSources[id] ??
    semanticColorSources[id] ??
    null
  );
}
