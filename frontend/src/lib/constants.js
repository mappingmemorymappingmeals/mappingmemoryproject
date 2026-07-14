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

// ------- MUSIC: 8-track queue — each 2-4 min, auto-advances -------
export const TRACKS = [
  { id: "hrid_majhare", name: "Hrid Majhare — Bengali Folk", src: "/audio/hrid_majhare.mp3", credit: "Bappaditya Mondal — তোমায় হৃদ মাঝারে রাখব · Jamendo · CC BY-NC-ND" },
  { id: "baul_song", name: "Baul of Bengal", src: "/audio/baul_song.mp3", credit: "Baul Das — Shiv Vandana · CC0 Public Domain" },
  { id: "baul_bhajan", name: "Baul Bhajan — Shiv Vandana", src: "/audio/baul_bhajan.mp3", credit: "Baul Das — Shiv Vandana · CC0 Public Domain" },
  { id: "baul_mon", name: "Baul Mon — Devotional Folk", src: "/audio/baul_mon.mp3", credit: "Baul Das — Shiv Vandana · CC0 Public Domain" },
  { id: "wb_folk_1", name: "Junglemahal Folk", src: "/audio/wb_folk_1.mp3", credit: "IGRMS West Bengal Tour · CC BY-NC 4.0" },
  { id: "tribal_drums_1", name: "Himalayan Drums", src: "/audio/tribal_drums_1.mp3", credit: "Tribal Trance · CC0 Public Domain" },
  { id: "mausam", name: "Mausam — Himalayan Folk", src: "/audio/mausam.mp3", credit: "Kontraa — Nepalese Folk · Jamendo · CC BY-ND" },
  { id: "suruwat", name: "Suruwat — Nepali Folk", src: "/audio/suruwat.mp3", credit: "Kontraa — Nepalese Folk · Jamendo · CC BY-SA" },
];

export function trackForCommunity(name = "") {
  const n = name.toLowerCase();
  if (/(santal|munda|bhumij|lodha|kheria|birhor|sabar)/.test(n)) return 4; // Junglemahal Folk
  if (/(toto|lepcha|bhutia|sherpa|tamang|limbu|dukpa|gorkha|nepali)/.test(n)) return 6; // Mausam
  if (/(rajbanshi|mech|rabha|garo|oraon)/.test(n)) return 0; // Hrid Majhare
  return 1; // Baul of Bengal
}

// ------- TOUR BACKGROUNDS: rotating cultural imagery (local, credited) -------
export const TOUR_BACKGROUNDS = [
  { src: "/img/forest_canopy.jpg", label: "Forest canopy", zone: "forest" },
  { src: "/img/forest_path.jpg", label: "Forest path", zone: "forest" },
  { src: "/img/tea_garden.jpg", label: "Tea garden", zone: "hills" },
  { src: "/img/misty_hills.jpg", label: "Misty hills", zone: "hills" },
  { src: "/img/river_boat.jpg", label: "River country", zone: "river" },
  { src: "/img/village_dusk.jpg", label: "Village dusk", zone: "village" },
  { src: "/img/terracotta_temple.jpg", label: "Terracotta heritage", zone: "village" },
  { src: "/img/rice_field.jpg", label: "Paddy fields", zone: "village" },
];

export function backgroundsForCommunity(name = "") {
  const n = name.toLowerCase();
  let zones;
  if (/(toto|lepcha|bhutia|sherpa|tamang|limbu|dukpa|gorkha)/.test(n)) zones = ["hills", "forest"];
  else if (/(rajbanshi|mech|rabha|garo|oraon)/.test(n)) zones = ["river", "hills", "village"];
  else if (/(santal|munda|bhumij|lodha|kheria|birhor)/.test(n)) zones = ["forest", "village"];
  else zones = ["village", "forest", "river"];
  const set = TOUR_BACKGROUNDS.filter((b) => zones.includes(b.zone));
  return set.length ? set : TOUR_BACKGROUNDS;
}

export const TOUR_BG = "/img/forest_canopy.jpg";
export const TOUR_BG_ALT = "/img/forest_path.jpg";

// ------- LOADING SCREEN messages (7-8s rotation) -------
export const LOADING_MESSAGES = {
  en: [
    "Every recipe is a memory. Every memory is a map…",
    "Awakening the forests, rivers and hearths of West Bengal…",
    "Sixteen tribal nations. One hundred living food traditions…",
    "What an elder forgets, a civilisation loses. Let us remember together…",
    "Curiosity is the first step of preservation. Start exploring…",
  ],
  bn: [
    "প্রতিটি রান্না একটি স্মৃতি। প্রতিটি স্মৃতি একটি মানচিত্র…",
    "পশ্চিমবঙ্গের অরণ্য, নদী ও উনুন জেগে উঠছে…",
    "ষোলটি আদিবাসী জাতি। একশো জীবন্ত খাদ্য ঐতিহ্য…",
    "প্রবীণ যা ভোলেন, সভ্যতা তা হারায়। এসো একসাথে মনে রাখি…",
    "কৌতূহলই সংরক্ষণের প্রথম ধাপ। অন্বেষণ শুরু করুন…",
  ],
  hi: [
    "हर व्यंजन एक स्मृति है। हर स्मृति एक मानचित्र…",
    "पश्चिम बंगाल के जंगल, नदियाँ और चूल्हे जाग रहे हैं…",
    "सोलह आदिवासी समुदाय। सौ जीवित खाद्य परंपराएं…",
    "जो बुज़ुर्ग भूलते हैं, वह सभ्यता खो देती है। आइए साथ याद रखें…",
    "जिज्ञासा संरक्षण का पहला कदम है। खोज शुरू करें…",
  ],
};

// ------- HELP / TOOLBOX content (trilingual) -------
export const HELP_CONTENT = {
  en: {
    title: "How to Explore this Map",
    intro: "A quick guide to travelling through West Bengal's indigenous food heritage.",
    items: [
      { icon: "pin", h: "Find a landmark", t: "Glowing medallions mark heritage places. The number badge shows how many food traditions live there. Click any medallion to open its food list." },
      { icon: "bowl", h: "Open a food archive", t: "Inside a place card, click any food to open its full archive — 13 knowledge layers plus historical origins (Layer 14)." },
      { icon: "drum", h: "Take a Talking Tour", t: "Press 'Start Talking Tour' for a live AI-narrated audio guide. Switch between English, বাংলা and हिन्दी, choose a voice you like, and follow the highlighted words." },
      { icon: "camera", h: "Take a Snapshot", t: "The Snapshot button reads whatever your map is showing and generates a spoken AI analysis of the visible communities and foods — plus 5 questions with answers." },
      { icon: "community", h: "Filter and search", t: "Use the left panel to filter by community, district, food category, or follow a thematic trail. The search box finds foods, tribes and places instantly." },
      { icon: "music", h: "Tribal music", t: "Authentic field-recorded tribal music plays in a queue — each track 3–4 minutes, auto-advancing. It changes with the community you are exploring. Control it bottom-right." },
      { icon: "sun", h: "Navigate in 3D", t: "Drag to pan · scroll to zoom · right-click-drag (or two fingers) to tilt and rotate. Use arrow keys, +/−, Home/End/PageUp/PageDown for keyboard travel. The Home button returns to West Bengal." },
    ],
  },
  bn: {
    title: "মানচিত্রটি কীভাবে ঘুরে দেখবেন",
    intro: "পশ্চিমবঙ্গের আদিবাসী খাদ্য ঐতিহ্য ঘুরে দেখার সহজ নির্দেশিকা।",
    items: [
      { icon: "pin", h: "স্থান খুঁজুন", t: "উজ্জ্বল মেডালিয়নগুলি ঐতিহ্যবাহী স্থান নির্দেশ করে। সংখ্যাটি সেখানকার খাদ্য ঐতিহ্যের সংখ্যা দেখায়। ক্লিক করে খাদ্যের তালিকা খুলুন।" },
      { icon: "bowl", h: "খাদ্য আর্কাইভ খুলুন", t: "যেকোনো খাবারে ক্লিক করলে ১৩টি জ্ঞানের স্তর এবং ঐতিহাসিক উৎস (স্তর ১৪) সহ সম্পূর্ণ আর্কাইভ খুলবে।" },
      { icon: "drum", h: "টকিং ট্যুর নিন", t: "'টকিং ট্যুর শুরু করুন' টিপুন — AI গাইড সরাসরি বর্ণনা শোনাবে। ইংরেজি, বাংলা ও হিন্দিতে শুনুন, পছন্দমতো কণ্ঠ বেছে নিন।" },
      { icon: "camera", h: "স্ন্যাপশট নিন", t: "স্ন্যাপশট বোতাম আপনার মানচিত্রের দৃশ্য বিশ্লেষণ করে AI ভাষ্য ও ৫টি প্রশ্নোত্তর তৈরি করে।" },
      { icon: "community", h: "ফিল্টার ও অনুসন্ধান", t: "বাম প্যানেল থেকে সম্প্রদায়, জেলা, খাদ্য বিভাগ বা বিষয়ভিত্তিক পথ বেছে নিন।" },
      { icon: "music", h: "আদিবাসী সঙ্গীত", t: "খাঁটি আদিবাসী সঙ্গীত সারিবদ্ধভাবে বাজে — প্রতিটি ৩-৪ মিনিট, তারপর নিজে থেকেই পরেরটি। নিচে-ডানে নিয়ন্ত্রণ করুন।" },
      { icon: "sun", h: "৩D নেভিগেশন", t: "টেনে সরান · স্ক্রল করে জুম · ডান ক্লিক-ড্র্যাগে ঘোরান। কীবোর্ডের তীর চিহ্ন, +/−, Home/End ব্যবহার করুন।" },
    ],
  },
  hi: {
    title: "मानचित्र कैसे घूमें",
    intro: "पश्चिम बंगाल की आदिवासी खाद्य विरासत घूमने की आसान मार्गदर्शिका।",
    items: [
      { icon: "pin", h: "स्थान खोजें", t: "चमकते मेडलियन विरासत स्थल दर्शाते हैं। संख्या वहाँ की खाद्य परंपराओं की गिनती है। क्लिक कर सूची खोलें।" },
      { icon: "bowl", h: "खाद्य आर्काइव खोलें", t: "किसी भी व्यंजन पर क्लिक करें — 13 ज्ञान परतें और ऐतिहासिक उद्गम (परत 14) खुलेगी।" },
      { icon: "drum", h: "टॉकिंग टूर लें", t: "'टॉकिंग टूर शुरू करें' दबाएँ — AI गाइड सजीव वर्णन सुनाएगा। अंग्रेजी, बांग्ला और हिन्दी में सुनें, पसंदीदा आवाज़ चुनें।" },
      { icon: "camera", h: "स्नэपशॉट लें", t: "स्नэपशॉट बटन आपके दृश्य का AI विश्लेषण और 5 प्रश्नोत्तर बनाता है।" },
      { icon: "community", h: "फ़िल्टर और खोज", t: "बाएं पैनल से समुदाय, जिला, खाद्य श्रेणी या विषयगत पथ चुनें।" },
      { icon: "music", h: "आदिवासी संगीत", t: "प्रामाणिक आदिवासी संगीत कतार में बजता है — हर ट्रैक 3-4 मिनट, फिर अगला स्वतः। नीचे-दाएं नियंत्रण करें।" },
      { icon: "sun", h: "3D नेविगेशन", t: "खींचकर सरकाएँ · स्क्रॉल से ज़ूम · राइट-क्लिक ड्रैग से घुमाएँ। तीर कुंजियाँ, +/−, Home/End इस्तेमाल करें।" },
    ],
  },
};

// ------- Keyboard shortcuts (About) -------
export const KEYBOARD_SHORTCUTS = [
  { key: "←", action: "Move left" },
  { key: "→", action: "Move right" },
  { key: "↑", action: "Move up" },
  { key: "↓", action: "Move down" },
  { key: "+", action: "Zoom in" },
  { key: "−", action: "Zoom out" },
  { key: "Home", action: "Jump left by 75%" },
  { key: "End", action: "Jump right by 75%" },
  { key: "Page Up", action: "Jump up by 75%" },
  { key: "Page Down", action: "Jump down by 75%" },
];

// ------- UI labels in 3 languages -------
export const LABELS = {
  en: {
    title: "Mapping Memory, Mapping Meals",
    subtitle: "A Deep Map of West Bengal's Indigenous Food Heritage",
    tagline: "Explore West Bengal's rich indigenous food heritage through AI-generated audio tours",
    begin: "Start Exploring",
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
    questions: "5 Questions & Answers",
    revealQuestions: "Reveal 5 Questions & Answers",
    listen: "Listen",
    play: "Play",
    pause: "Pause",
    replay: "Replay",
    stop: "Stop",
    close: "Close",
    back: "Back",
    home: "Home View",
    openDetail: "Open Full Archive",
    overview: "Overview",
    allLayers: "13 Layers",
    origins: "Origins",
    music: "Tribal Music",
    regenerate: "Regenerate",
    generating: "The AI guide is composing…",
    noVoice: "No voice for this language was found on your device — read along instead, or use Chrome/Edge.",
    pvtg: "PVTG",
    placeEntries: "food traditions at this place",
    about: "About",
    help: "Guide",
    trailActive: "Trail active",
    clearTrail: "Clear trail",
    voice: "Voice",
    loadingTitle: "Preparing your journey",
    viewMode: "Layout",
    desktopView: "Desktop view",
    mobileView: "Mobile view",
    showAnswer: "Show answer",
  },
  bn: {
    title: "স্মৃতির মানচিত্র, আহারের মানচিত্র",
    subtitle: "পশ্চিমবঙ্গের আদিবাসী খাদ্য ঐতিহ্যের গভীর মানচিত্র",
    tagline: "AI অডিও ট্যুরের মাধ্যমে পশ্চিমবঙ্গের আদিবাসী খাদ্য ঐতিহ্য আবিষ্কার করুন",
    begin: "অন্বেষণ শুরু করুন",
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
    questions: "৫টি প্রশ্ন ও উত্তর",
    revealQuestions: "৫টি প্রশ্নোত্তর দেখুন",
    listen: "শুনুন",
    play: "চালান",
    pause: "বিরতি",
    replay: "আবার শুনুন",
    stop: "থামুন",
    close: "বন্ধ",
    back: "পিছনে",
    home: "মূল দৃশ্য",
    openDetail: "সম্পূর্ণ আর্কাইভ খুলুন",
    overview: "সারসংক্ষেপ",
    allLayers: "১৩টি স্তর",
    origins: "উৎস",
    music: "আদিবাসী সঙ্গীত",
    regenerate: "পুনরায় তৈরি",
    generating: "AI গাইড রচনা করছে…",
    noVoice: "আপনার ডিভাইসে এই ভাষার কণ্ঠস্বর নেই — পড়ে নিন, অথবা Chrome/Edge ব্যবহার করুন।",
    pvtg: "পিভিটিজি",
    placeEntries: "এই স্থানের খাদ্য ঐতিহ্য",
    about: "পরিচিতি",
    help: "নির্দেশিকা",
    trailActive: "পথ সক্রিয়",
    clearTrail: "পথ মুছুন",
    voice: "কণ্ঠস্বর",
    loadingTitle: "আপনার যাত্রা প্রস্তুত হচ্ছে",
    viewMode: "লেআউট",
    desktopView: "ডেস্কটপ ভিউ",
    mobileView: "মোবাইল ভিউ",
    showAnswer: "উত্তর দেখুন",
  },
  hi: {
    title: "स्मृति का मानचित्र, भोजन का मानचित्र",
    subtitle: "पश्चिम बंगाल की आदिवासी खाद्य विरासत का गहरा मानचित्र",
    tagline: "AI ऑडियो टूर के ज़रिए पश्चिम बंगाल की समृद्ध आदिवासी खाद्य विरासत खोजें",
    begin: "खोज शुरू करें",
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
    questions: "5 प्रश्न और उत्तर",
    revealQuestions: "5 प्रश्नोत्तर देखें",
    listen: "सुनें",
    play: "चलाएँ",
    pause: "रोकें",
    replay: "फिर सुनें",
    stop: "बंद करें",
    close: "बंद",
    back: "वापस",
    home: "मूल दृश्य",
    openDetail: "पूरा आर्काइव खोलें",
    overview: "सारांश",
    allLayers: "13 परतें",
    origins: "उद्गम",
    music: "आदिवासी संगीत",
    regenerate: "पुनः बनाएँ",
    generating: "AI गाइड रचना कर रहा है…",
    noVoice: "आपके डिवाइस पर इस भाषा की आवाज़ नहीं मिली — साथ पढ़ें, या Chrome/Edge आज़माएँ।",
    pvtg: "पीवीटीजी",
    placeEntries: "इस स्थान की खाद्य परंपराएं",
    about: "परिचय",
    help: "गाइड",
    trailActive: "पथ सक्रिय",
    clearTrail: "पथ हटाएं",
    voice: "आवाज़",
    loadingTitle: "आपकी यात्रा तैयार हो रही है",
    viewMode: "लेआउट",
    desktopView: "डेस्कटॉप व्यू",
    mobileView: "मोबाइल व्यू",
    showAnswer: "उत्तर देखें",
  },
};

// Layer metadata: id -> icon key + short label
export const LAYER_META = [
  { id: "L1", icon: "ecology", name: "District & Ecology" },
  { id: "L2", icon: "community", name: "Tribal Community & Food" },
  { id: "L3", icon: "grain", name: "Ethnobotanical Ingredients" },
  { id: "L4", icon: "pot", name: "Culinary Technology" },
  { id: "L5", icon: "sun", name: "Temporal Context & Scarcity" },
  { id: "L6", icon: "drum", name: "Cultural Memory & Folklore" },
  { id: "L7", icon: "scroll", name: "Archival Notes" },
  { id: "L8", icon: "broken", name: "Lost / Erased Traditions" },
  { id: "L9", icon: "altar", name: "Sacred Foods & Offerings" },
  { id: "L10", icon: "herb", name: "Medicinal Value" },
  { id: "L11", icon: "weave", name: "Cultural Significance" },
  { id: "L12", icon: "pin", name: "Geo-Location" },
  { id: "L13", icon: "eye", name: "Image Reference" },
];
