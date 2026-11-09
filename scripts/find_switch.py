import subprocess
from PIL import Image

video = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443\VALORANT 11-01-2026 16-00-19-773.mp4"

for s in range(1, 21):
    out = f"valorant-shorts/scripts/debug_spectate/t_{s:02d}.jpg"
    cmd = ["ffmpeg", "-y", "-ss", str(s), "-i", video, "-vframes", "1", out]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Check average color or diff in ability area to see when death happens
for s in range(1, 21):
    im = Image.open(f"valorant-shorts/scripts/debug_spectate/t_{s:02d}.jpg")
    # Health area: if hp is 0 or spectating
    hp_pixel = im.getpixel((200, 1020))
    # Ability Q area: (800, 1000)
    q_pixel = im.getpixel((800, 1000))
    print(f"Second {s:02d}: HP pixel={hp_pixel}, Q pixel={q_pixel}")

