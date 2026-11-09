import subprocess
import json

video = "valorant-shorts/scripts/reference/ewilly_reel_2_with_audio.mp4"
audio_out = "valorant-shorts/scripts/reference/ewilly_audio.wav"

cmd = ["ffmpeg", "-y", "-i", video, "-vn", "-ac", "2", "-ar", "44100", audio_out]
subprocess.run(cmd, check=True)

# Let's inspect audio volume / loudness
cmd_loud = ["ffmpeg", "-i", audio_out, "-af", "ebur128=framelog=verbose", "-f", "null", "-"]
res = subprocess.run(cmd_loud, stderr=subprocess.PIPE).stderr.decode()
for line in res.splitlines():
    if "Integrated loudness" in line or "Loudness range" in line or "True peak" in line:
        print(line.strip())

