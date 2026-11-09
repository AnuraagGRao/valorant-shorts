import subprocess

video = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-22-26-176.mp4"

# Check seconds 1 to 50 every 2 seconds
for s in range(2, 51, 3):
    out = f"valorant-shorts/scripts/debug_spectate/scan_{s:02d}.jpg"
    cmd = ["ffmpeg", "-y", "-ss", str(s), "-i", video, "-vframes", "1", out]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Scanned multi-kill clip.")

