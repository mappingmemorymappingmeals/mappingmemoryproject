"""
CORE POC TEST — Mapping Memory, Mapping Meals
Tests:
 1. Excel data parsing & joining (sheet1 + sheet2 + geo) -> entries.json (100 entries)
 2. Gemini via Emergent LLM key: tour script, snapshot description, 5 questions, BN/HI translation
"""
import asyncio
import json
import os
import re
import sys

import pandas as pd
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

DATA_DIR = "/app/data"
OUT_FILE = "/app/data/entries.json"

PASS = []
FAIL = []


def check(name, cond, detail=""):
    if cond:
        PASS.append(name)
        print(f"  [PASS] {name} {detail}")
    else:
        FAIL.append(name)
        print(f"  [FAIL] {name} {detail}")


# ---------------------------------------------------------------- DATA PARSE
def parse_data():
    print("\n=== 1. DATA PARSING & JOIN ===")
    df = pd.read_excel(f"{DATA_DIR}/sheet1.xlsx", sheet_name="Deep Mapping Database", header=3)
    df = df.dropna(subset=["Entry ID"]).reset_index(drop=True)

    geo = pd.read_excel(f"{DATA_DIR}/geo.xlsx", header=None, skiprows=1)
    geo.columns = ["place", "lat", "lng", "note"]

    origins = pd.read_excel(f"{DATA_DIR}/sheet2.xlsx", sheet_name="Origin Layer Deep Archive", header=3)
    origins = origins.dropna(subset=["Entry ID"]).reset_index(drop=True)

    comm = pd.read_excel(f"{DATA_DIR}/sheet1.xlsx", sheet_name="Community Index", header=1)
    comm = comm.dropna(subset=["Community"]).reset_index(drop=True)

    layer_guide = pd.read_excel(f"{DATA_DIR}/sheet1.xlsx", sheet_name="Layer Guide", header=1)
    layer_guide = layer_guide.dropna(subset=["Layer"]).reset_index(drop=True)

    xref = pd.read_excel(f"{DATA_DIR}/sheet1.xlsx", sheet_name="Cross-Reference Index", header=1)
    xref = xref.dropna(subset=["THEME"]).reset_index(drop=True)

    print(f"  entries={len(df)}, geo={len(geo)}, origins={len(origins)}, communities={len(comm)}, layers={len(layer_guide)}, xref={len(xref)}")

    def s(v):
        if pd.isna(v):
            return ""
        return str(v).strip()

    origin_map = {}
    for _, r in origins.iterrows():
        origin_map[s(r["Entry ID"])] = {
            "food_item": s(r.get("Food Item")),
            "geographic_origin": s(r.get("L14a: Geographic Origin")),
            "origin_narrative": s(r.get("L14b: Deep Historical Origin Narrative")),
            "adoption_pathway": s(r.get("L14c: Adoption Pathway")),
            "migration_contact": s(r.get("L14d: Migration & Cultural Contact")),
            "timeline": s(r.get("L14e: Chronological Timeline")),
            "global_parallels": s(r.get("L14f: Similar Traditions (Global/India)")),
        }

    entries = []
    for i, r in df.iterrows():
        eid = s(r["Entry ID"])
        lat, lng, geo_note = None, None, ""
        if i < len(geo):
            try:
                lat = float(geo.iloc[i]["lat"])
                lng = float(geo.iloc[i]["lng"])
                geo_note = s(geo.iloc[i]["note"])
            except (ValueError, TypeError):
                pass
        entry = {
            "entry_id": eid,
            "community": s(r.get("Community")),
            "pvtg_status": s(r.get("PVTG Status")),
            "district": s(r.get("L1: District")),
            "state": s(r.get("L1: State")),
            "block_village": s(r.get("L1: Block / Village")),
            "ecology": s(r.get("L1: Ecology & Landscape")),
            "food_name": s(r.get("L2: Food Item Name")),
            "local_name": s(r.get("L2: Local Name")),
            "scientific_name": s(r.get("L2: Scientific Name")),
            "category": s(r.get("L2: Food Category")),
            "ingredients": s(r.get("L3: Ethnobotanical / Ingredients")),
            "culinary_technology": s(r.get("L4: Culinary Technology")),
            "vessel_tool": s(r.get("L4: Vessel & Tool")),
            "season": s(r.get("L5: Season / Temporal")),
            "scarcity": s(r.get("L5: Scarcity Context")),
            "cultural_memory": s(r.get("L6: Cultural Memory & Folklore")),
            "ritual_use": s(r.get("L6: Ritual Use")),
            "notes": s(r.get("L7: Notes")),
            "lost_traditions": s(r.get("L8: Lost / Erased Traditions")),
            "sacred_foods": s(r.get("L9: Sacred Foods & Deity Offerings")),
            "medicinal_value": s(r.get("L10: Medicinal Value")),
            "cultural_significance": s(r.get("L11: Cultural Significance")),
            "image_reference": s(r.get("L13: Image Reference")),
            "lat": lat,
            "lng": lng,
            "geo_note": geo_note,
            "origin": origin_map.get(eid),
        }
        entries.append(entry)

    # community index
    communities = []
    for _, r in comm.iterrows():
        if s(r.get("Community")) in ("", "Community"):
            continue
        communities.append({
            "community": s(r.get("Community")),
            "pvtg": s(r.get("PVTG?")),
            "primary_district": s(r.get("Primary District")),
            "ecology_zone": s(r.get("Ecology Zone")),
            "entry_count": s(r.get("# Entries")),
            "color": s(r.get("Color Code")),
        })

    layers = []
    for _, r in layer_guide.iterrows():
        if s(r.get("Layer")) in ("", "Layer"):
            continue
        layers.append({
            "layer": s(r.get("Layer")),
            "name": s(r.get("Layer Name")),
            "description": s(r.get("Description")),
            "function": s(r.get("Function")),
        })

    xrefs = []
    for _, r in xref.iterrows():
        if s(r.get("THEME")) in ("", "THEME"):
            continue
        xrefs.append({
            "theme": s(r.get("THEME")),
            "communities": s(r.get("COMMUNITIES")),
            "entries": s(r.get("ENTRIES")),
        })

    bundle = {"entries": entries, "communities": communities, "layer_guide": layers, "cross_reference": xrefs}
    with open(OUT_FILE, "w") as f:
        json.dump(bundle, f, indent=1, ensure_ascii=False)

    # VALIDATION
    check("100 entries parsed", len(entries) == 100, f"(got {len(entries)})")
    ids = [e["entry_id"] for e in entries]
    check("Entry IDs unique", len(set(ids)) == len(ids))
    with_geo = [e for e in entries if e["lat"] is not None and e["lng"] is not None]
    check("geo coords joined (>=95)", len(with_geo) >= 95, f"(got {len(with_geo)})")
    valid_geo = all(8 <= e["lat"] <= 38 and 68 <= e["lng"] <= 98 for e in with_geo)
    check("geo coords within India bounds", valid_geo)
    with_origin = [e for e in entries if e["origin"]]
    check("origin layer attached (>=18)", len(with_origin) >= 18, f"(got {len(with_origin)})")
    check("communities index parsed (>=15)", len(communities) >= 15, f"(got {len(communities)})")
    check("layer guide parsed (>=13)", len(layers) >= 13, f"(got {len(layers)})")
    check("cross reference parsed (>=10)", len(xrefs) >= 10, f"(got {len(xrefs)})")
    check("all entries have food_name", all(e["food_name"] for e in entries))
    check("all entries have community", all(e["community"] for e in entries))
    return entries


# ---------------------------------------------------------------- AI TESTS
async def ai_tests(entries):
    print("\n=== 2. GEMINI AI TESTS (Emergent LLM key) ===")
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    key = os.environ.get("EMERGENT_LLM_KEY")
    check("EMERGENT_LLM_KEY loaded", bool(key))

    entry = entries[0]  # T-001 Eu

    def make_chat(sysmsg):
        return LlmChat(api_key=key, session_id=f"poc-{os.urandom(4).hex()}", system_message=sysmsg).with_model("gemini", "gemini-3-flash-preview")

    # --- Tour script (EN)
    chat = make_chat(
        "You are a warm, evocative audio-tour guide for West Bengal's indigenous tribal food heritage. "
        "Write immersive 2nd-person narration scripts, 150-200 words, grounded ONLY in the facts given. No headings, no markdown."
    )
    ctx = (
        f"Food: {entry['food_name']} ({entry['local_name']}) | Community: {entry['community']} ({entry['pvtg_status']}) | "
        f"Place: {entry['block_village']}, {entry['district']} | Ecology: {entry['ecology']} | "
        f"Ingredients: {entry['ingredients']} | Method: {entry['culinary_technology'][:400]} | "
        f"Folklore: {entry['cultural_memory'][:400]} | Sacred: {entry['sacred_foods'][:200]}"
    )
    resp = await chat.send_message(UserMessage(text=f"Create the audio tour narration for this landmark:\n{ctx}"))
    tour_en = str(resp)
    print(f"\n  TOUR (EN) [{len(tour_en.split())} words]: {tour_en[:220]}...")
    check("tour script EN generated", len(tour_en.split()) > 60)

    # --- Snapshot description
    chat2 = make_chat(
        "You are an AI lens analyzing a 3D map view of tribal food heritage sites in West Bengal. "
        "Given the view context, produce a vivid 80-120 word 'snapshot analysis' describing what the viewer sees and its cultural meaning. Plain text only."
    )
    snap_ctx = (
        f"Map centered on {entry['district']} district ({entry['lat']}, {entry['lng']}), zoom level: place. "
        f"Visible markers: {entry['food_name']} of the {entry['community']} tribe at {entry['block_village']}. Ecology: {entry['ecology']}."
    )
    resp2 = await chat2.send_message(UserMessage(text=snap_ctx))
    snap = str(resp2)
    print(f"\n  SNAPSHOT: {snap[:200]}...")
    check("snapshot analysis generated", len(snap.split()) > 40)

    # --- 5 questions (JSON)
    chat3 = make_chat(
        "You generate pedagogical questions for learners exploring tribal food heritage. "
        'Return STRICT JSON only: {"questions": ["q1","q2","q3","q4","q5"]} — exactly 5 contextually relevant questions. No markdown fences.'
    )
    resp3 = await chat3.send_message(UserMessage(text=f"Context:\n{ctx}\nGenerate exactly 5 questions."))
    raw = str(resp3).strip()
    raw = re.sub(r"^```(json)?|```$", "", raw, flags=re.M).strip()
    try:
        qs = json.loads(raw)["questions"]
    except Exception as e:
        qs = []
        print(f"  JSON parse error: {e} | raw={raw[:200]}")
    print(f"\n  QUESTIONS ({len(qs)}): {qs[:2]}")
    check("exactly 5 questions generated", len(qs) == 5)

    # --- Translation BN
    chat4 = make_chat(
        "You are an expert translator. Translate the given English text to the target language faithfully. "
        "Output ONLY the translated text, no romanization, no notes."
    )
    sample = tour_en[:500]
    resp4 = await chat4.send_message(UserMessage(text=f"Translate to Bengali (bn):\n{sample}"))
    bn = str(resp4)
    has_bn = bool(re.search(r"[\u0980-\u09FF]", bn))
    print(f"\n  BENGALI: {bn[:150]}...")
    check("Bengali translation contains Bangla script", has_bn)

    # --- Translation HI
    chat5 = make_chat(
        "You are an expert translator. Translate the given English text to the target language faithfully. "
        "Output ONLY the translated text, no romanization, no notes."
    )
    resp5 = await chat5.send_message(UserMessage(text=f"Translate to Hindi (hi):\n{sample}"))
    hi = str(resp5)
    has_hi = bool(re.search(r"[\u0900-\u097F]", hi))
    print(f"\n  HINDI: {hi[:150]}...")
    check("Hindi translation contains Devanagari script", has_hi)


async def main():
    entries = parse_data()
    await ai_tests(entries)
    print("\n" + "=" * 50)
    print(f"RESULT: {len(PASS)} passed, {len(FAIL)} failed")
    if FAIL:
        print("FAILED:", FAIL)
        sys.exit(1)
    print("ALL CORE TESTS PASSED ✔")


if __name__ == "__main__":
    asyncio.run(main())
