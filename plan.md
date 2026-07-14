# plan.md — Mapping Memory, Mapping Meals

## 1) Objectives
- Deliver an immersive **3D-tilted interactive map** (India → West Bengal → districts/places) showcasing **all content** from the provided Excel archives.
- Provide **AI “Talking Tours”**: context-aware scripts + **5 pedagogical questions** + **Snapshot analysis** with **EN/BN/HI** support.
- Use **MapLibre GL JS (free)**, curated cultural imagery backgrounds (no Street View), **Web Speech API** for voice, and a **locally bundled tribal/folk instrumental music queue**.
- Ensure the experience is **fast, stylish, readable, and accessible** with tribal/Warli-inspired icons, 3D popups, layer-based exploration, and **strict typography requirements**.
- Harden the codebase for production readiness: **no XSS vectors**, correct React hook dependencies, stable keys, and logged errors (no silent failures).

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation) ✅ completed
**User stories (POC):**
1. Parse/join all Excel sources into a single clean JSON so every entry can be mapped.
2. Generate a tour script from Gemini for a chosen entry so “Talking Tours” is real.
3. Generate “Snapshot” text from a map context payload.
4. Generate 5 contextual questions for pedagogy.
5. Provide reliable EN↔BN/HI language support.

**Steps:**
1. Websearch best-practice: MapLibre 3D UX patterns + Gemini prompting for location-based narration + translation safety.
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
- 100 clean joined records, origins attach correctly by Entry ID
- Gemini returns valid strings for tour/snapshot + exactly 5 questions
- BN/HI translations return non-empty usable text

---

### Phase 2 — V1 App Development (Build around proven core) ✅ completed
**User stories (V1):**
1. Open on India and cinematic-fly to West Bengal.
2. Click glowing markers and see a **3D popup card** with key layers.
3. Filter by community/district/category/layer/trail.
4. “Talking Tour” narration + read-along in EN/BN/HI.
5. “Snapshot” generates context-aware narration + 5 questions.

**Backend (FastAPI + MongoDB):**
1. Implement `seed_db.py` using POC join logic.
2. Provide REST APIs (MVP):
   - `GET /api/entries` (filters: `community`, `district`, `category`, `q`)
   - `GET /api/entries/{entry_id}` (full layers + Layer-14 if present)
   - `GET /api/communities`, `GET /api/districts`
   - `GET /api/meta/layer-guide`, `GET /api/meta/cross-reference`
   - `GET /api/stats`
   - AI: `POST /api/ai/tour`, `POST /api/ai/snapshot`, `POST /api/ai/questions`, `POST /api/ai/translate`
3. Add response caching (TTL) for AI endpoints.

**Frontend (React + shadcn/ui + MapLibre):**
1. Cinematic map flow: India → WB centroid → reveal markers.
2. Map style + 3D feel: pitch/bearing, terrain, glowing markers.
3. UI components: Filter panel, marker place card, detail drawer with layers and Origins.
4. Talking Tours: backend AI + Web Speech API for narration; voice selection.
5. Curated imagery: rotating cultural backgrounds for the tour overlay.

**End Phase 2:** initial E2E testing pass.

---

### Phase 3 — Polish, Robustness, Content Completeness ✅ completed
**User stories (Polish):**
1. Every marker has meaningful content.
2. AI outputs are consistent, grounded, and non-hallucinating.
3. EN/BN/HI switching preserves meaning.
4. Performance remains acceptable.
5. Thematic cross-references guide exploration.

**Steps:**
1. Improve AI grounding: always pass selected entry fields + cross-reference snippets.
2. Add “Thematic Trails” (cross-reference index → highlights matching entries).
3. Handle missing geo/images/origins gracefully.
4. Bundle audio locally and provide attribution.
5. Final design polish: consistent terracotta/forest palette, icon set, micro-animations.

**End Phase 3:** E2E testing and fixes.

---

### Phase 4 — Session Closeout: Content Corrections, Accessibility, Security Hardening ✅ completed
This phase documents the final round of user-driven corrections plus code-quality and security hardening.

#### 4.1 Content corrections (reflection + credits) ✅
- Updated global “reflection” counts across UI/backend:
  - **100 food traditions**
  - **7+ tribal communities**
  - **10 districts**
  - **14 knowledge layers**
- Updated About → Credits copyright block to include:
  - **Department of Humanities and Social Sciences**
  - **Indian Institute of Space Science and Technology, Thiruvananthapuram · 2026**

#### 4.2 Music upgrades ✅
- Implemented a **10-track** tribal/folk queue (local assets, auto-advancing):
  - **Sohrai**, **Resham Firiri**, **Baha**, **Tamang Selo**, **Lagre**, **Malsiri**
  - plus: Junglemahal Folk, Mausam, Himalayan Drums, Suruwat
- Verified audio streaming via static `/audio/*.mp3` endpoints.

#### 4.3 Typography + accessibility enforcement ✅
- Enforced fonts everywhere as requested:
  - **Headings: 20pt**
  - **Small/body text: 15pt**
  - Times New Roman configured globally

#### 4.4 UI stability and non-overlapping panels ✅
- Prevented panel overlaps with top bar and music player by adjusting layout anchors:
  - `FilterPanel`: **top-24**
  - `DetailDrawer`: **top-24**
  - `PlaceCard`: **bottom-28**
- Stabilized “Start Exploring” button:
  - Replaced moving `float-slow` transform animation with a stationary **`pulse-glow`** animation.

#### 4.5 Security hardening (XSS removal) ✅
- Eliminated XSS vectors:
  - Removed **`dangerouslySetInnerHTML`** from `TribalIcons.jsx`.
  - Removed all marker **`innerHTML`** usage in `MapView`.
- Implemented safe SVG rendering:
  - Icons parsed via `DOMParser` and rebuilt through an **allow-list** of SVG tags/attributes.
  - Map markers created via `document.createElement` + `textContent` only.

#### 4.6 Code quality: hooks, keys, error handling, complexity ✅
- Reduced component complexity with extracted hooks and subcomponents:
  - Map logic extracted to `src/hooks/useMapLibre.js`
  - Data + filtering + responsive layout extracted to `src/hooks/useArchive.js`
  - `DetailDrawer` and `FilterPanel` split into smaller components
  - Shared `QaList` component created for Q&A accordions
- Fixed/mitigated stale closures and missing hook dependencies:
  - `MusicPlayer`: `playingRef` for stable playback behavior
  - `SnapshotDialog`: `generate` converted to `useCallback` with dependencies
  - `TourOverlay`: memoized backgrounds and stable keys for transcript
- Removed silent failures:
  - Added logging for previously empty catch blocks in map styling/animations and speech preference persistence.
- React key hygiene:
  - Replaced index-as-key where feasible with stable keys (`qa.q`, `shortcut.key`, `trail.theme`, etc.).

#### 4.7 Regression fix from refactor ✅
- After safe DOM refactor, marker SVG icons intercepted clicks.
- Fixed by adding `pointer-events: none` to `.mmm-marker-medallion svg` in `App.css`.

#### 4.8 Testing status ✅
- **Backend:** 17/18 tests passed (only failure was an **outdated expectation** around district count).
- **Frontend:** 100% regression pass after applying the marker pointer-events fix.

## 3) Next Actions (Immediate)
All core phases are complete. Remaining actions are optional maintenance:
1. Update backend automated test expectation for `/api/stats` to assert **10 districts**.
2. (Optional) Add a lightweight in-app error toast for map initialization failures (terrain/boundary load) if desired.
3. (Optional) Extend security hardening with CSP headers at the reverse proxy level.

## 4) Success Criteria
- Data: **100/100 entries** visible on map with joined geo; origins attach correctly by Entry ID.
- Map: Cinematic India→WB; markers clickable; place card + detail drawer stable and readable.
- AI: Tour + Snapshot + 5 questions work reliably in EN, with BN/HI support.
- Audio: Web Speech reads scripts; background music queue plays and is controllable.
- UX: Filters + thematic trails enable exploration; no broken states; accessibility typography enforced.
- Security: No `dangerouslySetInnerHTML` / no `innerHTML` injections; safe DOM construction everywhere.
