# plan.md — Mapping Memory, Mapping Meals

## 1) Objectives
- Deliver an immersive **3D-tilted interactive map** (India → West Bengal → districts/places) showcasing **all content** from the provided Excel archives.
- Provide **AI “Talking Tours”**: context-aware scripts + **5 pedagogical questions** + **Snapshot analysis** with **EN/BN/HI** support.
- Use **MapLibre GL JS (free)**, curated cultural imagery backgrounds (no Street View), **Web Speech API** for voice, and **royalty-free tribal/folk instrumental** background music.
- Ensure the experience is **fast, stylish, and user-friendly** with tribal/Warli-inspired icons, 3D popups, and layer-based exploration.

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation) ✅ must pass before app build
**User stories (POC):**
1. As a developer, I want to parse/join all Excel sources into a single clean JSON so every entry can be mapped.
2. As a developer, I want to generate a tour script from Gemini for a chosen entry so “Talking Tours” is real.
3. As a developer, I want “Snapshot” text generated from a map context payload so the button can work.
4. As a developer, I want 5 contextual questions generated so pedagogy is built-in.
5. As a developer, I want reliable EN→BN and EN→HI translation so language toggles are viable.

**Steps:**
1. **Websearch best-practice**: MapLibre 3D UX patterns + Gemini prompting for location-based narration + translation safety.
2. Write `test_core.py` that:
   - Loads `sheet1.xlsx` (header row 4), `sheet2.xlsx` (header row 4), `geo.xlsx`.
   - Produces `entries.json` with **100 entries**, each with: layers L1–L13 fields + lat/lng (row-aligned) + optional Layer-14 (by Entry ID).
   - Validates: counts, required fields, lat/lng numeric, Entry IDs unique.
3. In same `test_core.py`, call Gemini (Emergent key) for:
   - `tour_script(entry_id, language=EN)`
   - `snapshot_script(context_payload, language=EN)`
   - `five_questions(context_payload, language=EN)`
   - `translate(text, target=BN)` and `translate(text, target=HI)`
4. Iterate prompts + JSON output constraints until results are stable and non-empty.

**Exit gate:** `test_core.py` prints PASS with:
- 100 clean joined records, 19 origin matches attached
- Gemini returns valid strings for tour/snapshot + exactly 5 questions
- BN/HI translations return non-empty usable text

---

### Phase 2 — V1 App Development (Build around proven core)
**User stories (V1):**
1. As a user, I want the app to open on India and cinematic-fly to West Bengal so the journey feels guided.
2. As a user, I want to click glowing markers and see a **3D popup card** with key layers (food, community, ecology, significance).
3. As a user, I want to filter by community/district/category/layer so I can explore systematically.
4. As a user, I want to press “Talking Tour” and hear an AI narration in EN/BN/HI while reading the script.
5. As a user, I want “Snapshot” to generate context-aware narration + 5 questions so I can learn actively.

**Backend (FastAPI + MongoDB):**
1. Build ingestion script `seed_db.py` using the POC join logic:
   - Collections: `entries`, `communities`, `layer_guide`, `cross_reference`, `origins`.
2. REST APIs (MVP):
   - `GET /api/entries` (filters: `community`, `district`, `category`, `q`)
   - `GET /api/entries/{entry_id}` (full layers + Layer-14 if present)
   - `GET /api/communities`, `GET /api/districts`
   - `GET /api/meta/layer-guide`, `GET /api/meta/cross-reference`
   - AI: `POST /api/ai/tour` (entry_id + language)
   - AI: `POST /api/ai/snapshot` (map bbox/center/zoom + selected markers + language)
   - AI: `POST /api/ai/questions` (same context)
   - AI: `POST /api/ai/translate` (text + target lang)
3. Add response caching (in-memory) for AI endpoints (simple TTL) to keep UX snappy.

**Frontend (React + shadcn/ui + MapLibre):**
1. **Cinematic map flow**:
   - Start view: India (use provided coordinates) → flyTo West Bengal centroid → reveal district/entry markers.
2. Map style + 3D feel:
   - MapLibre with pitch/bearing, smooth flyTo transitions, glowing markers, “depth” popups.
3. UI/UX components:
   - Left panel: filters + layer legend with tribal/Warli-inspired SVG icons.
   - Marker click: 3D popup + “Open Details”.
   - Details drawer: tabs for L1–L13 + “Origins (L14)” when available.
4. Talking Tours:
   - “Play tour” calls backend AI → renders script → Web Speech API speaks in EN/BN/HI.
   - Music player: auto-switch per community/region; user can mute/volume.
5. Curated imagery backgrounds:
   - Per-district/community background image set (local assets + fallback gradient) shown behind detail panel/tour mode.

**End Phase 2:** run testing agent for one full E2E pass.

---

### Phase 3 — Polish, Robustness, Content Completeness
**User stories (Polish):**
1. As a user, I want the app to never feel empty—every marker must show meaningful content from the sheets.
2. As a user, I want AI outputs to be consistent, grounded in the selected entry/context, and not hallucinate.
3. As a user, I want language switching to keep the same meaning across EN/BN/HI.
4. As a user, I want the map to stay fast even with 100 markers and rich panels.
5. As a user, I want thematic cross-references to guide exploration (e.g., “millet beer continuum”).

**Steps:**
1. Improve AI grounding: always pass the selected entry fields + cross-reference snippets into prompts.
2. Add “Thematic Trails” using Cross-Reference Index (click theme → highlights matching entries).
3. Add better empty/edge handling: missing geo, missing images, missing Layer-14.
4. Bundle royalty-free audio tracks locally (`/public/audio/...`) + attribution page.
5. Final design polish: consistent terracotta/forest palette, icon set, micro-animations.

**End Phase 3:** testing agent E2E again + fix all findings.

## 3) Next Actions (Immediate)
1. Implement `test_core.py` and make it PASS (data join + Gemini tour/snapshot/questions + BN/HI translations).
2. Freeze stable prompts + response formats for AI endpoints.
3. Implement `seed_db.py` and seed MongoDB with all parsed content.
4. Build FastAPI endpoints + React MapLibre V1 UI in one integrated pass.

## 4) Success Criteria
- Data: **100/100 entries** visible on map with joined geo; **19/19 origins** attach correctly by Entry ID.
- Map: Cinematic India→WB→district experience; markers clickable; 3D-feel popups and detail panel.
- AI: Tour + Snapshot + 5 questions work reliably in EN, and translations available for BN/HI.
- Audio: Web Speech reads scripts in all 3 languages; background music plays and is controllable.
- UX: Filters + thematic trails enable exploration; no broken states; acceptable performance.
