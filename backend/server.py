import hashlib
import json
import logging
import os
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Mapping Memory, Mapping Meals API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

LANG_NAMES = {"en": "English", "bn": "Bengali (Bangla script)", "hi": "Hindi (Devanagari script)"}


# ------------------------------------------------------------------ helpers
def clean(doc):
    if doc and "_id" in doc:
        doc.pop("_id")
    return doc


def entry_context(e: dict, limit: int = 1200) -> str:
    return (
        f"Food: {e['food_name']} (local name: {e['local_name']}; scientific: {e['scientific_name']}) | "
        f"Category: {e['category']} | Community: {e['community']} (PVTG: {e['pvtg_status']}) | "
        f"Place: {e['block_village']}, {e['district']} district, West Bengal | Ecology: {e['ecology']} | "
        f"Ingredients: {e['ingredients'][:limit]} | Preparation: {e['culinary_technology'][:limit]} | "
        f"Vessels/tools: {e['vessel_tool'][:500]} | Season: {e['season'][:400]} | Scarcity: {e['scarcity'][:400]} | "
        f"Folklore & memory: {e['cultural_memory'][:limit]} | Ritual use: {e['ritual_use'][:600]} | "
        f"Sacred: {e['sacred_foods'][:600]} | Medicinal: {e['medicinal_value'][:600]} | "
        f"Cultural significance: {e['cultural_significance'][:600]} | "
        f"Lost/at-risk traditions: {e['lost_traditions'][:600]}"
    )


async def ai_generate(system_message: str, user_text: str) -> str:
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise HTTPException(500, "AI key not configured")
    chat = LlmChat(
        api_key=key,
        session_id=f"mmm-{os.urandom(6).hex()}",
        system_message=system_message,
    ).with_model("gemini", "gemini-3-flash-preview")
    resp = await chat.send_message(UserMessage(text=user_text))
    return str(resp).strip()


async def cached_ai(cache_key: str, system_message: str, user_text: str, force: bool = False) -> str:
    h = hashlib.sha256(cache_key.encode()).hexdigest()
    if not force:
        hit = await db.ai_cache.find_one({"key": h})
        if hit:
            return hit["value"]
    value = await ai_generate(system_message, user_text)
    await db.ai_cache.update_one(
        {"key": h},
        {"$set": {"value": value, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return value


# ------------------------------------------------------------------ data APIs
@api_router.get("/")
async def root():
    return {"message": "Mapping Memory, Mapping Meals — West Bengal Indigenous Food Heritage API"}


@api_router.get("/stats")
async def stats():
    n_entries = await db.entries.count_documents({})
    n_comm = await db.communities.count_documents({})
    districts = await db.entries.distinct("district")
    return {"entries": n_entries, "communities": n_comm, "districts": len(districts), "layers": 14}


@api_router.get("/entries")
async def list_entries(
    community: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
):
    query = {}
    if community:
        query["community"] = {"$regex": re.escape(community), "$options": "i"}
    if district:
        query["district"] = {"$regex": re.escape(district), "$options": "i"}
    if category:
        query["category"] = {"$regex": re.escape(category), "$options": "i"}
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [
            {"food_name": rx}, {"local_name": rx}, {"community": rx},
            {"district": rx}, {"ingredients": rx}, {"category": rx},
        ]
    docs = await db.entries.find(query, {"_id": 0}).to_list(300)
    return docs


@api_router.get("/entries/{entry_id}")
async def get_entry(entry_id: str):
    doc = await db.entries.find_one({"entry_id": entry_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, f"Entry {entry_id} not found")
    return doc


@api_router.get("/places")
async def places():
    """Entries grouped by coordinate — one marker per place."""
    docs = await db.entries.find({"lat": {"$ne": None}}, {"_id": 0}).to_list(300)
    groups = defaultdict(list)
    for e in docs:
        groups[(e["lat"], e["lng"])].append(e)
    out = []
    for (lat, lng), items in groups.items():
        comms = sorted({i["community"] for i in items})
        out.append({
            "lat": lat,
            "lng": lng,
            "place": items[0]["district"],
            "block_village": items[0]["block_village"],
            "geo_note": items[0]["geo_note"],
            "communities": comms,
            "count": len(items),
            "entries": [
                {
                    "entry_id": i["entry_id"],
                    "food_name": i["food_name"],
                    "local_name": i["local_name"],
                    "community": i["community"],
                    "category": i["category"],
                    "pvtg_status": i["pvtg_status"],
                    "district": i["district"],
                }
                for i in items
            ],
        })
    out.sort(key=lambda p: -p["count"])
    return out


@api_router.get("/communities")
async def communities():
    return [clean(d) for d in await db.communities.find({}, {"_id": 0}).to_list(50)]


@api_router.get("/districts")
async def districts():
    pipeline = [
        {"$group": {"_id": "$district", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    rows = await db.entries.aggregate(pipeline).to_list(100)
    return [{"district": r["_id"], "count": r["count"]} for r in rows]


@api_router.get("/categories")
async def categories():
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    rows = await db.entries.aggregate(pipeline).to_list(100)
    return [{"category": r["_id"], "count": r["count"]} for r in rows]


@api_router.get("/meta/layer-guide")
async def layer_guide():
    return [clean(d) for d in await db.layer_guide.find({}, {"_id": 0}).to_list(30)]


@api_router.get("/meta/cross-reference")
async def cross_reference():
    rows = await db.cross_reference.find({}, {"_id": 0}).to_list(30)
    for r in rows:
        r["entry_ids"] = re.findall(r"[A-Z]{1,3}-\d{3}", r.get("entries", ""))
    return rows


# ------------------------------------------------------------------ AI APIs
class TourRequest(BaseModel):
    entry_id: str
    language: str = "en"
    regenerate: bool = False


class SnapshotRequest(BaseModel):
    district: Optional[str] = None
    center: Optional[list] = None
    zoom: Optional[float] = None
    visible_foods: list = []
    visible_communities: list = []
    language: str = "en"


class QuestionsRequest(BaseModel):
    entry_id: Optional[str] = None
    context: Optional[str] = None
    language: str = "en"


class TranslateRequest(BaseModel):
    text: str
    target: str  # bn | hi


@api_router.post("/ai/tour")
async def ai_tour(req: TourRequest):
    e = await db.entries.find_one({"entry_id": req.entry_id}, {"_id": 0})
    if not e:
        raise HTTPException(404, "Entry not found")
    lang = LANG_NAMES.get(req.language, "English")
    sysmsg = (
        "You are a warm, evocative audio-tour guide for West Bengal's indigenous tribal food heritage, "
        "in the spirit of a museum audio guide. Write immersive second-person narration, 260-340 words, "
        "grounded ONLY in the facts provided. Cover the place and its ecology, the community, how the food is "
        "gathered and made, its seasonal rhythm, its folklore and sacred meaning, and why preserving it matters. "
        "Weave in vivid sensory detail. No headings, no markdown, no lists — flowing spoken prose only. "
        f"Write the entire narration in {lang}."
    )
    ctx = entry_context(e)
    origin_hint = ""
    if e.get("origin"):
        origin_hint = f" | Historical origin: {e['origin']['geographic_origin'][:500]} | Origin story: {e['origin']['origin_narrative'][:600]}"
    script = await cached_ai(
        f"tour|{req.entry_id}|{req.language}", sysmsg,
        f"Create the audio tour narration for this heritage food landmark:\n{ctx}{origin_hint}",
        force=req.regenerate,
    )
    return {"entry_id": req.entry_id, "language": req.language, "script": script}


@api_router.post("/ai/snapshot")
async def ai_snapshot(req: SnapshotRequest):
    lang = LANG_NAMES.get(req.language, "English")
    sysmsg = (
        "You are an AI lens analyzing a live 3D heritage map of West Bengal's indigenous tribal food landmarks. "
        "Given the current view context, produce a vivid 130-180 word 'snapshot analysis' describing what the viewer "
        "is seeing — the landscape, the communities and their foods — and why it matters culturally. "
        f"Plain flowing text only, no markdown. Write entirely in {lang}."
    )
    foods = ", ".join(req.visible_foods[:12]) or "various tribal heritage foods"
    comms = ", ".join(req.visible_communities[:10]) or "multiple tribal communities"
    center = f"{req.center[1]:.3f}N, {req.center[0]:.3f}E" if req.center and len(req.center) == 2 else "West Bengal"
    ctx = (
        f"Map centered near {center}, zoom {req.zoom or 'regional'}. "
        f"District in focus: {req.district or 'West Bengal overview'}. "
        f"Visible food landmarks: {foods}. Communities present: {comms}."
    )
    script = await cached_ai(f"snap|{ctx}|{req.language}", sysmsg, ctx)
    return {"script": script, "language": req.language}


@api_router.post("/ai/questions")
async def ai_questions(req: QuestionsRequest):
    lang = LANG_NAMES.get(req.language, "English")
    if req.entry_id:
        e = await db.entries.find_one({"entry_id": req.entry_id}, {"_id": 0})
        if not e:
            raise HTTPException(404, "Entry not found")
        ctx = entry_context(e, 800)
        key = f"qa|{req.entry_id}|{req.language}"
    else:
        ctx = req.context or "West Bengal indigenous tribal food heritage"
        key = f"qa|{ctx[:200]}|{req.language}"
    sysmsg = (
        "You create engaging pedagogical question-and-answer pairs for learners exploring indigenous tribal "
        "food heritage. Return STRICT JSON only: "
        '{"qa": [{"q": "question 1", "a": "answer 1"}, {"q": "q2", "a": "a2"}, {"q": "q3", "a": "a3"}, '
        '{"q": "q4", "a": "a4"}, {"q": "q5", "a": "a5"}]} — exactly 5 pairs. '
        "Questions must be thought-provoking and grounded in the given context. Answers must be 2-3 sentences, "
        "warm and engaging, derived ONLY from the provided content. No markdown fences, no extra keys. "
        f"Write both questions and answers in {lang}."
    )
    raw = await cached_ai(key, sysmsg, f"Context:\n{ctx}\nGenerate exactly 5 question-answer pairs.")
    cleaned = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.M).strip()
    qa = []
    try:
        qa = json.loads(cleaned)["qa"][:5]
        qa = [{"q": str(p.get("q", "")), "a": str(p.get("a", ""))} for p in qa if p.get("q")]
    except Exception:
        lines = [q.strip("-• ") for q in cleaned.split("\n") if len(q.strip()) > 15][:5]
        qa = [{"q": l, "a": ""} for l in lines]
    return {"qa": qa, "questions": [p["q"] for p in qa], "language": req.language}


@api_router.post("/ai/translate")
async def ai_translate(req: TranslateRequest):
    lang = LANG_NAMES.get(req.target)
    if not lang:
        raise HTTPException(400, "target must be 'bn' or 'hi'")
    sysmsg = (
        "You are an expert translator. Translate the given English text faithfully to the target language. "
        "Output ONLY the translated text in native script — no romanization, no notes."
    )
    out = await cached_ai(
        f"tr|{req.target}|{hashlib.sha256(req.text.encode()).hexdigest()}",
        sysmsg,
        f"Translate to {lang}:\n{req.text}",
    )
    return {"translated": out, "target": req.target}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
