import subprocess
import os

os.makedirs("valorant-shorts/scripts/reference/frames", exist_ok=True)
video = "valorant-shorts/scripts/reference/ewilly_reel_2_with_audio.mp4"

# Extract frames every 1 second (30 frames total)
for s in range(0, 31):
    out = f"valorant-shorts/scripts/reference/frames/sec_{s:02d}.jpg"
    cmd = ["ffmpeg", "-y", "-ss", str(s), "-i", video, "-vframes", "1", out]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Extracted 31 reference frames.")

