import os
import subprocess
import shutil
import json

src_dir = r"valorant-shorts\public\music"
ms_root = r"music-stuff\public\audio"

tracks_info = [
    {
        "file_base": "Asfalto_Queima",
        "title": "Asfalto Queima",
        "album": "Valorant Phonk Singles",
        "genre": "Brazilian Phonk"
    },
    {
        "file_base": "Asfalto_Quente",
        "title": "Asfalto Quente",
        "album": "Valorant Phonk Singles",
        "genre": "Brazilian Phonk"
    },
    {
        "file_base": "The_Sudden_Trip_Downstairs",
        "title": "The Sudden Trip Downstairs",
        "album": "Corrode Comedy OST",
        "genre": "Comedy / Parody"
    }
]

os.makedirs(os.path.join(ms_root, "mp3"), exist_ok=True)
os.makedirs(os.path.join(ms_root, "mp4"), exist_ok=True)
os.makedirs(os.path.join(ms_root, "thumbnails"), exist_ok=True)

manifest_path = r"music-stuff\public\publicManifest.json"
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

existing_ids = [int(t["id"]) for t in manifest["tracks"] if t["id"].isdigit()]
next_id = max(existing_ids) + 1 if existing_ids else 133

for t in tracks_info:
    base = t["file_base"]
    mp3_src = os.path.join(src_dir, f"{base}.mp3")
    mp4_src = os.path.join(src_dir, f"{base}.mp4")
    
    mp3_dst = os.path.join(ms_root, "mp3", f"{base}.mp3")
    mp4_dst = os.path.join(ms_root, "mp4", f"{base}.mp4")
    thumb_dst = os.path.join(ms_root, "thumbnails", f"{base}.jpg")
    
    if os.path.exists(mp3_src):
        shutil.copy2(mp3_src, mp3_dst)
    if os.path.exists(mp4_src):
        shutil.copy2(mp4_src, mp4_dst)
        cmd = ["ffmpeg", "-y", "-ss", "00:00:01", "-i", mp4_src, "-vframes", "1", "-q:v", "2", thumb_dst]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
    dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", mp3_src]
    res = subprocess.run(dur_cmd, capture_output=True, text=True)
    dur = int(round(float(res.stdout.strip()))) if res.stdout.strip() else 60
    
    existing_entry = next((item for item in manifest["tracks"] if item.get("audioUrl") == f"/audio/mp3/{base}.mp3"), None)
    if not existing_entry:
        manifest["tracks"].append({
            "isPublic": True,
            "id": str(next_id),
            "upvotesCount": 0,
            "audioUrl": f"/audio/mp3/{base}.mp3",
            "coverUrl": f"/audio/thumbnails/{base}.jpg",
            "title": t["title"],
            "album": t["album"],
            "ownerId": "public",
            "duration": dur,
            "downvotesCount": 0,
            "lyricsStatus": "completed",
            "isInstrumental": True,
            "netScore": 0,
            "artist": "Anuraag Rao",
            "lyrics": []
        })
        print(f"Added {t['title']} with ID {next_id} (duration: {dur}s)")
        next_id += 1
    else:
        print(f"{t['title']} already exists in manifest")

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print("Updated publicManifest.json successfully!")

