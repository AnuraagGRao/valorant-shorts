import subprocess
import os

for track in ["Critical_Overload", "Controller_Disconnected", "Final_Boss_Pursuit"]:
    path = f"music-stuff/public/audio/mp3/{track}.mp3"
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path]
    dur = float(subprocess.check_output(cmd).decode().strip())
    print(f"Track: {track} | Duration: {dur:.2f}s")

