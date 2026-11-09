import subprocess
import os

clips = [
    {
        "src": r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-02-37-113.mp4",
        "ss": "14.5",
        "t": "4.5",
        "out": r"Z:\Coding\Weekend Stuff\valorant-shorts\public\montage\clip1.mp4",
        "round": "ROUND 03",
        "title": "FIRST BLOOD // 1-TAP",
        "weapon": "Aeris Vandal",
        "target": "Ashborn",
    },
    {
        "src": r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-21-39-522.mp4",
        "ss": "22.0",
        "t": "4.5",
        "out": r"Z:\Coding\Weekend Stuff\valorant-shorts\public\montage\clip2.mp4",
        "round": "ROUND 15",
        "title": "SITE HOLD // HEADSHOT",
        "weapon": "Aeris Vandal",
        "target": "Ashborn",
    },
    {
        "src": r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-26-13-603.mp4",
        "ss": "13.0",
        "t": "4.5",
        "out": r"Z:\Coding\Weekend Stuff\valorant-shorts\public\montage\clip3.mp4",
        "round": "ROUND 18",
        "title": "CLEAN ENTRY // VANDAL",
        "weapon": "Aeris Vandal",
        "target": "I am",
    },
    {
        "src": r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-06-07-502.mp4",
        "ss": "46.0",
        "t": "5.5",
        "out": r"Z:\Coding\Weekend Stuff\valorant-shorts\public\montage\clip4.mp4",
        "round": "ROUND 05",
        "title": "1v5 ACE FINALE 🏆",
        "weapon": "Aeris Vandal",
        "target": "Chamber",
    },
]

print("Trimming and mastering pure kill rounds (zero trade deaths)...")

for i, c in enumerate(clips, 1):
    print(f"Processing Clip {i}: {c['round']}...")
    cmd = [
        "ffmpeg", "-y",
        "-ss", c["ss"],
        "-i", c["src"],
        "-t", c["t"],
        "-vf", "fps=60",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-af", "dynaudnorm=f=100:g=4:p=0.85,alimiter=limit=0.85",
        "-c:a", "aac",
        "-b:a", "192k",
        c["out"]
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error on clip {i}: {res.stderr}")
    else:
        size = os.path.getsize(c["out"]) / (1024 * 1024)
        print(f"  [OK] Saved {c['out']} ({size:.2f} MB)")

print("\nAll 4 round highlights ready!")
