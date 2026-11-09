import json
import os
import subprocess

with open("valorant-shorts/scripts/match_manifest_clean.json", "r", encoding="utf-8") as f:
    data = json.load(f)

kills = data["kills"]
out_dir = "valorant-shorts/public/all_kills"
os.makedirs(out_dir, exist_ok=True)

manifest_out = []

print(f"[Kei] Preparing {len(kills)} All-Kill clips...")

for i, k in enumerate(kills, 1):
    src = k["file"]
    t_start = max(0.0, k["t_start"])
    # 2.0s duration per kill
    t_dur = 2.0
    out_file = os.path.join(out_dir, f"kill_{i:02d}.mp4")
    rel_path = f"all_kills/kill_{i:02d}.mp4"
    
    # FFmpeg trim
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(t_start),
        "-i", src,
        "-t", str(t_dur),
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-avoid_negative_ts", "make_zero",
        out_file
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    manifest_out.append({
        "index": i,
        "file": rel_path,
        "durationInFrames": 120, # 2.0s @ 60fps = 120 frames
        "weapon": k["weapon"],
        "victim": k["victim"],
        "headshot": k["headshot"],
        "time_str": k["time_str"],
        "actionText": f"KILL #{i:02d} // 🎯 1-TAP" if k["headshot"] else f"KILL #{i:02d} // DELETED",
        "subText": f"{k['weapon'].upper()} VS {k['victim'].upper()}",
    })
    print(f"  [OK] Kill #{i:02d}: {k['weapon']} vs {k['victim']} ({'HS' if k['headshot'] else 'Body'}) -> {rel_path}")

with open("valorant-shorts/src/all_kills_manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest_out, f, indent=2)

print("\n[OK] All kills ready in public/all_kills and manifest saved.")

