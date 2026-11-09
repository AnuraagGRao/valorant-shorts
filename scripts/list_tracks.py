import json

with open("music-stuff/public/publicManifest.json", "r", encoding="utf-8") as f:
    d = json.load(f)

tracks = d.get("tracks", [])
print(f"Total tracks in catalog: {len(tracks)}")
for t in tracks[:35]:
    title = t.get("title", "")
    album = t.get("album", "")
    print(f"  - {title} [{album}]")

