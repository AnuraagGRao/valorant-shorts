import glob
import json
import os
import subprocess

match_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"

# All kill clips from match
kill_files = [
    ("VALORANT 11-01-2026 16-02-37-113.mp4", "Ashborn", "Aeris Vandal", True),
    ("VALORANT 11-01-2026 16-06-07-502.mp4", "Ashborn", "Aeris Vandal", True), # Chamber Ace kill
    ("VALORANT 11-01-2026 16-09-30-959.mp4", "shadow0908", "Aeris Vandal", False),
    ("VALORANT 11-01-2026 16-13-05-327.mp4", "shadow0908", "Phantom", True),
    ("VALORANT 11-01-2026 16-17-02-627.mp4", "shadow0908", "Aeris Vandal", False),
    ("VALORANT 11-01-2026 16-20-09-840.mp4", "daddyzdanny", "Classic", False),
    ("VALORANT 11-01-2026 16-21-39-522.mp4", "Ashborn", "Aeris Vandal", True),
    ("VALORANT 11-01-2026 16-22-26-176.mp4", "I am", "Aeris Vandal", True),
    ("VALORANT 11-01-2026 16-26-13-603.mp4", "I am", "Aeris Vandal", True),
    ("VALORANT 11-01-2026 16-29-19-879.mp4", "shadow0908", "Aeris Vandal", False),
]

out_dir = "valorant-shorts/public/all_kills"
os.makedirs(out_dir, exist_ok=True)
manifest_kills = []

print("=== RE-TRIMMING KILL CLIPS WITH CORRECT BUFFER OFFSET ===")
for i, (fname, victim, weapon, hs) in enumerate(kill_files, 1):
    src = os.path.join(match_dir, fname)
    cmd_dur = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", src]
    dur = float(subprocess.check_output(cmd_dur).decode().strip())
    
    # Impact at dur - 4.5s
    impact_t = dur - 4.5
    start_t = max(0.0, impact_t - 1.8) # 1.8s before kill
    dur_t = 2.6 # 2.6s total cut
    
    out_file = os.path.join(out_dir, f"kill_{i:02d}.mp4")
    cmd_cut = [
        "ffmpeg", "-y",
        "-ss", str(start_t),
        "-i", src,
        "-t", str(dur_t),
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-avoid_negative_ts", "make_zero",
        out_file
    ]
    subprocess.run(cmd_cut, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    manifest_kills.append({
        "index": i,
        "file": f"all_kills/kill_{i:02d}.mp4",
        "durationInFrames": int(round(dur_t * 60)), # 156 frames
        "weapon": weapon,
        "victim": victim,
        "headshot": hs,
        "time_str": fname[20:28],
        "actionText": f"KILL #{i:02d} // 🎯 1-TAP" if hs else f"KILL #{i:02d} // DELETED",
        "subText": f"{weapon.upper()} VS {victim.upper()}",
    })
    print(f"  [OK] Kill #{i:02d}: {weapon} vs {victim} | cut: {start_t:.2f}s - {start_t + dur_t:.2f}s of {dur:.2f}s")

with open("valorant-shorts/src/all_kills_manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest_kills, f, indent=2)

print("Saved all_kills_manifest.json")

