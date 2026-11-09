import json
import os
import subprocess

match_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"

# 8 Selected Funniest Deaths
# (file_name, killer, weapon, actionText, subText)
death_configs = [
    ("VALORANT 11-01-2026 16-27-26-157.mp4", "Ashborn", "Tour De Force", "CHAMBER TOUR DE FORCE 💥", "ASHBORN SNIPED FROM DOWNTOWN"),
    ("VALORANT 11-01-2026 16-32-13-083.mp4", "I am", "Operator", "OPERATOR JUMP SCARE 💀", "\"I AM\" WAITING ON THE ANGLE"),
    ("VALORANT 11-01-2026 16-13-05-327.mp4", "Perambur Puluthi", "Aeris Vandal", "TRADED IN 200MS ⏱️", "KILLED ONE, INSTANTLY DELETED"),
    ("VALORANT 11-01-2026 16-10-15-708.mp4", "Ashborn", "Headhunter", "HEADHUNTER ONE-TAP 🎯", "CHAMBER POCKET GUARDIAN DIFF"),
    ("VALORANT 11-01-2026 16-00-19-773.mp4", "Perambur Puluthi", "Ghost", "PISTOL ROUND DINK 👻", "GHOST HEADSHOT WELCOME TO CORRODE"),
    ("VALORANT 11-01-2026 16-24-10-597.mp4", "Perambur Puluthi", "Phantom", "WHERE DID HE COME FROM?! ❓", "PHANTOM SPRAY FROM THE SHADOWS"),
    ("VALORANT 11-01-2026 16-35-00-432.mp4", "I am", "Operator", "PEEKED THE OP AGAIN 🤡", "DID NOT LEARN THE FIRST TIME"),
    ("VALORANT 11-01-2026 16-04-37-167.mp4", "daddyzdanny", "Aeris Vandal", "TIMING DEMON ⏳", "LOOKED AWAY FOR 0.1 SECONDS"),
]

out_dir = "valorant-shorts/public/deaths"
os.makedirs(out_dir, exist_ok=True)
manifest_deaths = []

print("=== RE-TRIMMING DEATH CLIPS WITH CORRECT BUFFER OFFSET ===")
for i, (fname, killer, weapon, action, sub) in enumerate(death_configs, 1):
    src = os.path.join(match_dir, fname)
    cmd_dur = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", src]
    dur = float(subprocess.check_output(cmd_dur).decode().strip())
    
    # Impact at dur - 4.5s
    impact_t = dur - 4.5
    start_t = max(0.0, impact_t - 1.8) # 1.8s before impact
    dur_t = 2.6 # 2.6s total cut (impact at 1.8s into cut, ends at dur - 3.7s before spectate starts!)
    
    out_file = os.path.join(out_dir, f"death_{i:02d}.mp4")
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
    
    manifest_deaths.append({
        "index": i,
        "file": f"deaths/death_{i:02d}.mp4",
        "durationInFrames": int(round(dur_t * 60)), # 156 frames
        "killer": killer,
        "weapon": weapon,
        "headshot": True,
        "time_str": fname[20:28],
        "actionText": action,
        "subText": sub,
    })
    print(f"  [OK] Death #{i:02d}: {killer} ({weapon}) | cut: {start_t:.2f}s - {start_t + dur_t:.2f}s of {dur:.2f}s")

with open("valorant-shorts/src/deaths_manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest_deaths, f, indent=2)

print("Saved deaths_manifest.json")

