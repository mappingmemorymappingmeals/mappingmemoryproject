// Community colors — earthy palette (design guidelines)
export const COMMUNITY_COLORS = {
  toto: "#D07A3A",
  santal: "#C65A3A",
  oraon: "#2F6B4F",
  rajbanshi: "#2E6F7A",
  lodha: "#8A6A3B",
  kheria: "#7A3E2E",
  lepcha: "#3E6A5B",
  bhutia: "#3B5E8A",
  sherpa: "#3B5E8A",
  tamang: "#4A6B8A",
  munda: "#6B4E2F",
  bhumij: "#4F6B2F",
  garo: "#2F5B6B",
  mech: "#6B2F4A",
  rabha: "#5B6B2F",
  dukpa: "#2F4A6B",
  limbu: "#8A5E3B",
  gorkha: "#6B5A2F",
  birhor: "#6B4A2F",
  adivasi: "#7A6B4A",
  pan: "#7A6B4A",
};

export function communityColor(name = "") {
  const n = name.toLowerCase();
  for (const key of Object.keys(COMMUNITY_COLORS)) {
    if (n.includes(key)) return COMMUNITY_COLORS[key];
  }
  return "#8A7A5E";
}

// Category grouping with icon keys
const CATEGORY_RULES = [
  { re: /beer|beverage|ferment.*drink|distill|liquor|alcohol|chhang|tongba|wine/i, group: "Ferments & Beverages", icon: "pot" },
  { re: /pitha|flatbread|pancake|bread|cake|sweet/i, group: "Pithas & Breads", icon: "pitha" },
  { re: /rice|grain|cereal|millet|porridge|khichuri|paddy/i, group: "Grains & Rice", icon: "grain" },
  { re: /tuber|root|yam|corm/i, group: "Wild Tubers & Roots", icon: "root" },
  { re: /fungi|mushroom/i, group: "Wild Fungi", icon: "mushroom" },
  { re: /vegetable|shoot|leafy|green|fern|flower|sag|herb(?!al)/i, group: "Forest Vegetables", icon: "leaf" },
  { re: /fish|shellfish|crab|snail|prawn|aquatic/i, group: "Fish & Waterfoods", icon: "fish" },
  { re: /meat|chicken|pork|hen|egg|bird|hunt|fowl/i, group: "Meat & Forest Protein", icon: "flame" },
  { re: /insect|ant|larva|grub|termite/i, group: "Insects & Rare Proteins", icon: "ant" },
  { re: /fruit|berry/i, group: "Wild Fruits", icon: "fruit" },
  { re: /medicin|remedy|tonic|health/i, group: "Food as Medicine", icon: "herb" },
  { re: /ritual|festive|sacred|offering|festival/i, group: "Ritual & Festive", icon: "altar" },
];

export function categoryGroup(category = "") {
  for (const r of CATEGORY_RULES) {
    if (r.re.test(category)) return { group: r.group, icon: r.icon };
  }
  return { group: "Traditional Dishes", icon: "bowl" };
}

export const CATEGORY_GROUPS = [
  ...new Set(CATEGORY_RULES.map((r) => r.group)),
  "Traditional Dishes",
];

// music: community -> track index
export const TRACKS = [
  { id: "wb_folk_1", name: "Junglemahal Folk", src: "/audio/wb_folk_1.mp3" },
  { id: "wb_folk_2", name: "Dooars Field Song", src: "/audio/wb_folk_2.mp3" },
  { id: "tribal_drums_1", name: "Himalayan Drums", src: "/audio/tribal_drums_1.mp3" },
  { id: "tribal_drums_2", name: "Tribal Trance", src: "/audio/tribal_drums_2.mp3" },
];

export function trackForCommunity(name = "") {
  const n = name.toLowerCase();
  if (/(toto|lepcha|bhutia|sherpa|tamang|limbu|dukpa|gorkha|nepali)/.test(n)) return 2;
  if (/(rajbanshi|mech|rabha|garo|oraon)/.test(n)) return 1;
  if (/(santal|munda|bhumij|lodha|kheria|birhor|sabar)/.test(n)) return 0;
  return 3;
}

// Layer metadata: id -> icon key + short label
export const LAYER_META = [
  { id: "L1", icon: "ecology", field: ["district", "block_village", "ecology"], name: "District & Ecology" },
  { id: "L2", icon: "community", field: ["community", "food_name", "local_name", "scientific_name", "category"], name: "Tribal Community & Food" },
  { id: "L3", icon: "grain", field: ["ingredients"], name: "Ethnobotanical Ingredients" },
  { id: "L4", icon: "pot", field: ["culinary_technology", "vessel_tool"], name: "Culinary Technology" },
  { id: "L5", icon: "sun", field: ["season", "scarcity"], name: "Temporal Context & Scarcity" },
  { id: "L6", icon: "drum", field: ["cultural_memory", "ritual_use"], name: "Cultural Memory & Folklore" },
  { id: "L7", icon: "scroll", field: ["notes"], name: "Archival Notes" },
  { id: "L8", icon: "broken", field: ["lost_traditions"], name: "Lost / Erased Traditions" },
  { id: "L9", icon: "altar", field: ["sacred_foods"], name: "Sacred Foods & Offerings" },
  { id: "L10", icon: "herb", field: ["medicinal_value"], name: "Medicinal Value" },
  { id: "L11", icon: "weave", field: ["cultural_significance"], name: "Cultural Significance" },
  { id: "L12", icon: "pin", field: ["lat", "lng", "geo_note"], name: "Geo-Location" },
  { id: "L13", icon: "eye", field: ["image_reference"], name: "Image Reference" },
];

// UI labels in 3 languages
export const LABELS = {
  en: {
    title: "Mapping Memory, Mapping Meals",
    subtitle: "A Deep Map of West Bengal's Indigenous Food Heritage",
    tagline: "Explore West Bengal's rich indigenous food heritage through AI-generated audio tours",
    begin: "Begin the Journey",
    entries: "food traditions",
    communities: "tribal communities",
    districts: "districts",
    layersWord: "knowledge layers",
    explore: "Explore the Archive",
    searchPh: "Search foods, tribes, places…",
    filters: "Filters",
    community: "Communities",
    district: "Districts",
    category: "Food Categories",
    trails: "Thematic Trails",
    layerGuide: "The 14 Layers",
    clearAll: "Clear all filters",
    visible: "visible",
    of: "of",
    talkingTour: "Talking Tour",
    startTour: "Start Talking Tour",
    snapshot: "Snapshot",
    snapshotTitle: "AI Snapshot — Reading this View",
    questions: "5 Questions to Ponder",
    revealQuestions: "Reveal 5 Questions",
    listen: "Listen",
    play: "Play",
    pause: "Pause",
    replay: "Replay",
    stop: "Stop",
    close: "Close",
    openDetail: "Open Full Archive",
    overview: "Overview",
    allLayers: "13 Layers",
    origins: "Origins (L14)",
    music: "Tribal Music",
    regenerate: "Regenerate",
    generating: "The AI guide is composing…",
    noVoice: "No voice for this language was found on your device — read along instead, or use Chrome/Edge.",
    pvtg: "PVTG",
    placeEntries: "food traditions at this place",
    about: "About",
    trailActive: "Trail active",
    clearTrail: "Clear trail",
  },
  bn: {
    title: "স্মৃতির মানচিত্র, আহারের মানচিত্র",
    subtitle: "পশ্চিমবঙ্গের আদিবাসী খাদ্য ঐতিহ্যের গভীর মানচিত্র",
    tagline: "AI অডিও ট্যুরের মাধ্যমে পশ্চিমবঙ্গের আদিবাসী খাদ্য ঐতিহ্য আবিষ্কার করুন",
    begin: "যাত্রা শুরু করুন",
    entries: "খাদ্য ঐতিহ্য",
    communities: "আদিবাসী সম্প্রদায়",
    districts: "জেলা",
    layersWord: "জ্ঞানের স্তর",
    explore: "আর্কাইভ অন্বেষণ",
    searchPh: "খাবার, জনজাতি, স্থান খুঁজুন…",
    filters: "ফিল্টার",
    community: "সম্প্রদায়",
    district: "জেলা",
    category: "খাদ্য বিভাগ",
    trails: "বিষয়ভিত্তিক পথ",
    layerGuide: "১৪টি স্তর",
    clearAll: "সব ফিল্টার মুছুন",
    visible: "দৃশ্যমান",
    of: "/",
    talkingTour: "টকিং ট্যুর",
    startTour: "টকিং ট্যুর শুরু করুন",
    snapshot: "স্ন্যাপশট",
    snapshotTitle: "AI স্ন্যাপশট — দৃশ্য বিশ্লেষণ",
    questions: "ভাবার মতো ৫টি প্রশ্ন",
    revealQuestions: "৫টি প্রশ্ন দেখুন",
    listen: "শুনুন",
    play: "চালান",
    pause: "বিরতি",
    replay: "আবার শুনুন",
    stop: "থামুন",
    close: "বন্ধ",
    openDetail: "সম্পূর্ণ আর্কাইভ খুলুন",
    overview: "সারসংক্ষেপ",
    allLayers: "১৩টি স্তর",
    origins: "উৎস (L14)",
    music: "আদিবাসী সঙ্গীত",
    regenerate: "পুনরায় তৈরি",
    generating: "AI গাইড রচনা করছে…",
    noVoice: "আপনার ডিভাইসে এই ভাষার কণ্ঠস্বর নেই — পড়ে নিন, অথবা Chrome/Edge ব্যবহার করুন।",
    pvtg: "পিভিটিজি",
    placeEntries: "এই স্থানের খাদ্য ঐতিহ্য",
    about: "পরিচিতি",
    trailActive: "পথ সক্রিয়",
    clearTrail: "পথ মুছুন",
  },
  hi: {
    title: "स्मृति का मानचित्र, भोजन का मानचित्र",
    subtitle: "पश्चिम बंगाल की आदिवासी खाद्य विरासत का गहरा मानचित्र",
    tagline: "AI ऑडियो टूर के जरिए पश्चिम बंगाल की समृद्ध आदिवासी खाद्य विरासत की खोज करें",
    begin: "यात्रा आरंभ करें",
    entries: "खाद्य परंपराएं",
    communities: "आदिवासी समुदाय",
    districts: "जिले",
    layersWord: "ज्ञान की परतें",
    explore: "आर्काइव खोजें",
    searchPh: "भोजन, जनजाति, स्थान खोजें…",
    filters: "फ़िल्टर",
    community: "समुदाय",
    district: "जिले",
    category: "खाद्य श्रेणियाँ",
    trails: "विषयगत पथ",
    layerGuide: "14 परतें",
    clearAll: "सभी फ़िल्टर हटाएँ",
    visible: "दृश्य",
    of: "/",
    talkingTour: "टॉकिंग टूर",
    startTour: "टॉकिंग टूर शुरू करें",
    snapshot: "स्नэपशॉट",
    snapshotTitle: "AI स्नэपशॉट — दृश्य विश्लेषण",
    questions: "सोचने के लिए 5 प्रश्न",
    revealQuestions: "5 प्रश्न देखें",
    listen: "सुनें",
    play: "चलाएँ",
    pause: "रोकें",
    replay: "फिर सुनें",
    stop: "बंद करें",
    close: "बंद",
    openDetail: "पूरा आर्काइव खोलें",
    overview: "सारांश",
    allLayers: "13 परतें",
    origins: "उद्गम (L14)",
    music: "आदिवासी संगीत",
    regenerate: "पुनः बनाएँ",
    generating: "AI गाइड रचना कर रहा है…",
    noVoice: "आपके डिवाइस पर इस भाषा की आवाज़ नहीं मिली — साथ पढ़ें, या Chrome/Edge आज़माएँ।",
    pvtg: "पीवीटीजी",
    placeEntries: "इस स्थान की खाद्य परंपराएं",
    about: "परिचय",
    trailActive: "पथ सक्रिय",
    clearTrail: "पथ हटाएं",
  },
};

export const TOUR_BG =
  "https://images.unsplash.com/photo-1650173287237-953c9b54528c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHw0fHxmb3Jlc3QlMjBjYW5vcHklMjBpbmRpYSUyMG1vb2R5fGVufDB8fHxncmVlbnwxNzgzOTgxNzc3fDA&ixlib=rb-4.1.0&q=85";

export const TOUR_BG_ALT =
  "https://images.unsplash.com/photo-1618756501529-a591ffb93392?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBjYW5vcHklMjBpbmRpYSUyMG1vb2R5fGVufDB8fHxncmVlbnwxNzgzOTgxNzc3fDA&ixlib=rb-4.1.0&q=85";
