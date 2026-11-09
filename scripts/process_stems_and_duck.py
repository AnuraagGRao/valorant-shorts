"""
Demucs Voice Isolation + Sidechain Audio Ducking Engine
Splits raw Valorant clip audio into vocals and game SFX using Demucs,
then applies dynamic sidechain compression to duck game sounds whenever comms are active.
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def process_audio(clip_path: str, output_audio: str):
    clip_p = Path(clip_path).resolve()
    out_p = Path(output_audio).resolve()
    out_dir = out_p.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    
    stems_dir = out_dir / "demucs_stems"
    stems_dir.mkdir(parents=True, exist_ok=True)

    print(f"[*] Extracting and separating stems for: {clip_p.name}")

    # 1. Run Demucs (two-stems mode for fast separation: vocals vs no_vocals)
    python_exe = Path(sys.prefix) / "Scripts" / "python.exe"
    if not python_exe.exists():
        python_exe = Path("python")

    demucs_cmd = [
        str(python_exe), "-m", "demucs.separate",
        "-n", "htdemucs",
        "--two-stems", "vocals",
        "-o", str(stems_dir),
        str(clip_p)
    ]
    print(f"[*] Running Demucs: {' '.join(demucs_cmd)}")
    res = subprocess.run(demucs_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[!] Demucs error: {res.stderr[-500:]}")
        return False

    # Find generated stem files
    # Demucs outputs to: stems_dir/htdemucs/{clip_stem}/vocals.wav and no_vocals.wav
    stem_name = clip_p.stem
    vocals_wav = stems_dir / "htdemucs" / stem_name / "vocals.wav"
    game_wav = stems_dir / "htdemucs" / stem_name / "no_vocals.wav"

    if not vocals_wav.exists() or not game_wav.exists():
        print(f"[!] Could not locate stem files in {stems_dir}")
        return False

    print(f"[OK] Stems isolated successfully:\n  Vocals: {vocals_wav}\n  Game SFX: {game_wav}")

    # 2. Sidechain ducking via FFmpeg
    # Duck game_wav when vocals_wav is above threshold, amplify vocals by 1.3x, normalize dynamics, clamp with limiter
    filter_complex = (
        "[0:a][1:a]sidechaincompress=threshold=0.06:ratio=6:attack=15:release=250[ducked];"
        "[1:a]volume=1.35[boosted_vox];"
        "[ducked][boosted_vox]amix=inputs=2:weights=1.0 1.2[mixed];"
        "[mixed]dynaudnorm=f=100:g=4:p=0.85,alimiter=limit=0.84[final]"
    )

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", str(game_wav),
        "-i", str(vocals_wav),
        "-filter_complex", filter_complex,
        "-map", "[final]",
        "-c:a", "aac",
        "-b:a", "256k",
        str(out_p)
    ]

    print(f"[*] Applying FFmpeg sidechain compression and peak limiting...")
    f_res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if f_res.returncode == 0:
        print(f"[OK] Mastered ducked audio saved: {out_p} ({out_p.stat().st_size / (1024*1024):.2f} MB)")
        return True
    else:
        print(f"[!] FFmpeg error: {f_res.stderr[-400:]}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Isolate Vocals and Duck Game Audio with Demucs + FFmpeg")
    parser.add_argument("--clip", required=True, help="Input video file")
    parser.add_argument("--out", required=True, help="Output audio file")
    args = parser.parse_args()

    process_audio(args.clip, args.out)

