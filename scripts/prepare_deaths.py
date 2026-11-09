import json
import os
import subprocess

with open("valorant-shorts/scripts/match_manifest_clean.json", "r", encoding="utf-8") as f:
    data = json.load(f)

deaths = data["deaths"]
out_dir = "valorant-shorts/public/deaths"
os.makedirs(out_dir, exist_ok=True)

# Hand-pick the 8 funniest / most meme-worthy deaths
selected_indices = [
    (10, "CHAMBER TOUR DE FORCE 💥", "ASHBORN SNIPED FROM DOWNTOWN"),
    (13, "OPERATOR JUMP SCARE 💀", "\"I AM\" WAITING ON THE ANGLE"),
    (7, "TRADED IN 200MS ⏱️", "KILLED ONE, INSTANTLY DELETED"),
    (5, "HEADHUNTER ONE-TAP 🎯", "CHAMBER POCKET GUARDIAN DIFF"),
    (0, "PISTOL ROUND DINK 👻", "GHOST HEADSHOT WELCOME TO CORRODE"),
    (9, "WHERE DID HE COME FROM?! ❓", "PHANTOM SPRAY FROM THE SHADOWS"),
    (15, "PEEKED THE OP AGAIN 🤡", "DID NOT LEARN THE FIRST TIME"),
    (3, "TIMING DEMON ⏳", "LOOKED AWAY FOR 0.1 SECONDS"),
]

manifest_out = []
print(f"[Kei] Preparing {len(selected_indices)} Funny Death clips...")

for i, (d_idx, meme_action, meme_sub) in enumerate(selected_indices, 1):
    d = deaths[d_idx]
    src = d["file"]
    t_start = max(0.0, d["t_start"])
    t_dur = 2.2 # 2.2s @ 60fps = 132 frames
    out_file = os.path.join(out_dir, f"death_{i:02d}.mp4")
    rel_path = f"deaths/death_{i:02d}.mp4"
    
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
        "durationInFrames": 132, # 2.2s @ 60fps
        "killer": d["killer"],
        "weapon": d["weapon"],
        "headshot": d["headshot"],
        "time_str": d["time_str"],
        "actionText": meme_action,
        "subText": meme_sub,
    })
    print(f"  [OK] Death #{i:02d}: {d['killer']} with {d['weapon']} -> {rel_path}")

with open("valorant-shorts/src/deaths_manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest_out, f, indent=2)

print("\n[OK] All funny deaths ready in public/deaths and manifest saved.")
