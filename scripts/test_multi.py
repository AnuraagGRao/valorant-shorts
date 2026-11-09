import subprocess

video = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-22-26-176.mp4"
for s in [46, 47, 48]:
    cmd = ["ffmpeg", "-y", "-ss", str(s), "-i", video, "-vframes", "1", f"valorant-shorts/scripts/debug_spectate/multi_{s:02d}.jpg"]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Multi-kill frames extracted.")

