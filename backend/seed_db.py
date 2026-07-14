"""Seed MongoDB with the full deep-mapping archive parsed from the Excel sheets."""
import json
import os
import sys

import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/app/backend/.env")

DATA_DIR = "/app/data"


def s(v):
    if pd.isna(v):
        return ""
    return str(v).strip()


def parse_all():
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
                lat = round(float(geo.iloc[i]["lat"]), 6)
                lng = round(float(geo.iloc[i]["lng"]), 6)
                geo_note = s(geo.iloc[i]["note"])
            except (ValueError, TypeError):
                pass
        entries.append({
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
        })

    communities = []
    for _, r in comm.iterrows():
        name = s(r.get("Community"))
        if name in ("", "Community"):
            continue
        communities.append({
            "community": name,
            "pvtg": s(r.get("PVTG?")),
            "primary_district": s(r.get("Primary District")),
            "ecology_zone": s(r.get("Ecology Zone")),
            "entry_count": s(r.get("# Entries")),
            "color": s(r.get("Color Code")),
        })

    layers = []
    for _, r in layer_guide.iterrows():
        lid = s(r.get("Layer"))
        if lid in ("", "Layer"):
            continue
        layers.append({
            "layer": lid,
            "name": s(r.get("Layer Name")),
            "description": s(r.get("Description")),
            "function": s(r.get("Function")),
        })

    xrefs = []
    for _, r in xref.iterrows():
        theme = s(r.get("THEME"))
        if theme in ("", "THEME"):
            continue
        xrefs.append({
            "theme": theme,
            "communities": s(r.get("COMMUNITIES")),
            "entries": s(r.get("ENTRIES")),
        })

    return entries, communities, layers, xrefs


def main():
    entries, communities, layers, xrefs = parse_all()
    client = MongoClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]

    db.entries.drop()
    db.communities.drop()
    db.layer_guide.drop()
    db.cross_reference.drop()

    db.entries.insert_many(entries)
    db.communities.insert_many(communities)
    db.layer_guide.insert_many(layers)
    db.cross_reference.insert_many(xrefs)

    db.entries.create_index("entry_id", unique=True)
    db.entries.create_index("community")
    db.entries.create_index("district")

    print(f"Seeded: {db.entries.count_documents({})} entries, {db.communities.count_documents({})} communities, "
          f"{db.layer_guide.count_documents({})} layers, {db.cross_reference.count_documents({})} cross-refs")


if __name__ == "__main__":
    main()
