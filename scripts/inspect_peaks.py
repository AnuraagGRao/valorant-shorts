import wave
import numpy as np

with wave.open("valorant-shorts/scripts/reference/ewilly_audio.wav", "rb") as wf:
    sr = wf.getframerate()
    n_frames = wf.getnframes()
    data = np.frombuffer(wf.readframes(n_frames), dtype=np.int16)
    data = data.reshape(-1, 2)

print(f"Sample Rate: {sr}, Duration: {n_frames / sr:.2f}s")
# Find peaks/energy
energy = np.mean(np.abs(data), axis=1)
# 100ms windows
window_size = int(sr * 0.1)
n_windows = len(energy) // window_size
window_energy = [np.mean(energy[i*window_size:(i+1)*window_size]) for i in range(n_windows)]

top_peaks = np.argsort(window_energy)[-10:]
print("Loudest energy timestamps (drops/kills):")
for p in sorted(top_peaks):
    print(f"  t = {p * 0.1:.2f}s (energy: {window_energy[p]:.0f})")

