import subprocess

video = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-10-15-708.mp4"
for s in [14, 15, 16, 17]:
    cmd = ["ffmpeg", "-y", "-ss", str(s), "-i", video, "-vframes", "1", f"valorant-shorts/scripts/debug_spectate/death_hh_{s:02d}.jpg"]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Extracted Headhunter death frames.")

