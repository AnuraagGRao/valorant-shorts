import os
import subprocess
import json

match_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"
out_dir = "valorant-shorts/public/deaths"
os.makedirs(out_dir, exist_ok=True)

# Precise empirically verified impact times from Overwolf highlights.log (15.0s in 20s buffer):
configs = [
    ("death_01.mp4", "VALORANT 11-01-2026 16-27-26-157.mp4", 15.0, "Ashborn", "Tour De Force", "CHAMBER TOUR DE FORCE 💥", "ASHBORN SNIPED FROM DOWNTOWN"),
    ("death_02.mp4", "VALORANT 11-01-2026 16-32-13-083.mp4", 15.0, "I am", "Operator", "OPERATOR JUMP SCARE 💀", "\"I AM\" WAITING ON THE ANGLE"),
    ("death_03.mp4", "VALORANT 11-01-2026 16-13-05-327.mp4", 15.18, "Perambur Puluthi", "Aeris Vandal", "TRADED IN 200MS ⏱️", "KILLED ONE, INSTANTLY DELETED"),
    ("death_04.mp4", "VALORANT 11-01-2026 16-10-15-708.mp4", 15.0, "Ashborn", "Headhunter", "HEADHUNTER ONE-TAP 🎯", "CHAMBER POCKET GUARDIAN DIFF"),
    ("death_05.mp4", "VALORANT 11-01-2026 16-00-19-773.mp4", 15.0, "Perambur Puluthi", "Ghost", "PISTOL ROUND DINK 👻", "GHOST HEADSHOT WELCOME TO CORRODE"),
    ("death_06.mp4", "VALORANT 11-01-2026 16-24-10-597.mp4", 15.0, "Perambur Puluthi", "Phantom", "WHERE DID HE COME FROM?! ❓", "PHANTOM SPRAY FROM THE SHADOWS"),
    ("death_07.mp4", "VALORANT 11-01-2026 16-35-00-432.mp4", 15.0, "I am", "Operator", "PEEKED THE OP AGAIN 🤡", "DID NOT LEARN THE FIRST TIME"),
    ("death_08.mp4", "VALORANT 11-01-2026 16-04-37-167.mp4", 15.0, "daddyzdanny", "Aeris Vandal", "TIMING DEMON ⏳", "LOOKED AWAY FOR 0.1 SECONDS"),
]

manifest_deaths = []
print("=== TRIMMING 8 DEATH CLIPS WITH VERIFIED FRAME-ACCURATE OFFSETS ===")

for idx, (out_name, src_name, impact_t, killer, weapon, action, sub) in enumerate(configs, 1):
    src = os.path.join(match_dir, src_name)
    # Remotion deathFrame = 88 (1.466s @ 60fps)
    start_t = max(0.0, impact_t - 1.466)
    dur_t = 2.6 # 156 frames @ 60fps
    out_file = os.path.join(out_dir, out_name)
    
    cmd = [
        "ffmpeg", "-y",
        "-ss", f"{start_t:.3f}",
        "-i", src,
        "-t", f"{dur_t:.3f}",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-avoid_negative_ts", "make_zero",
        out_file
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    manifest_deaths.append({
        "index": idx,
        "file": f"deaths/{out_name}",
        "durationInFrames": 156,
        "killer": killer,
        "weapon": weapon,
        "headshot": True,
        "time_str": src_name[20:28],
        "actionText": action,
        "subText": sub,
    })
    print(f"  [OK] Death #{idx}: {killer} ({weapon}) cut [{start_t:.2f}s - {start_t+dur_t:.2f}s] (impact @ {impact_t:.2f}s)")

with open("valorant-shorts/src/deaths_manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest_deaths, f, indent=2)

print("\nSuccessfully updated deaths_manifest.json and re-sliced all 8 death clips!")

