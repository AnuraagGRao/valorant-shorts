import soundfile as sf
import numpy as np
from faster_whisper import WhisperModel

audio, sr = sf.read(r"valorant-shorts\scripts\ace_audio.wav")
if audio.ndim > 1:
    audio = np.mean(audio, axis=1)
audio = audio.astype(np.float32)

model = WhisperModel("small", device="cpu", compute_type="int8")

with open(r"valorant-shorts\scripts\detailed_transcript.txt", "w", encoding="utf-8") as f:
    f.write("--- 0 to 14s ---\n")
    seg1, _ = model.transcribe(audio[:int(14 * sr)], beam_size=5)
    for s in seg1:
        f.write(f"[{s.start:.2f} -> {s.end:.2f}]: {s.text}\n")

    f.write("--- 14 to 37s ---\n")
    seg2, _ = model.transcribe(audio[int(14 * sr):], beam_size=5)
    for s in seg2:
        f.write(f"[{14 + s.start:.2f} -> {14 + s.end:.2f}]: {s.text}\n")

print("Detailed transcript written successfully!")
