import wave
import subprocess
import numpy as np

# Convert to wav temporarily
cmd = ["ffmpeg", "-y", "-i", "music-stuff/public/audio/mp3/Final_Boss_Pursuit.mp3", "-ar", "44100", "-ac", "2", "valorant-shorts/scripts/debug_spectate/final_boss.wav"]
subprocess.run(cmd, check=True)

with wave.open("valorant-shorts/scripts/debug_spectate/final_boss.wav", "rb") as wf:
    sr = wf.getframerate()
    n_frames = wf.getnframes()
    data = np.frombuffer(wf.readframes(n_frames), dtype=np.int16)

print(f"Final Boss Pursuit: {n_frames / sr:.2f}s, Peak: {np.max(np.abs(data))}")

