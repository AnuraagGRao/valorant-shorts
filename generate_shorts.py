"""
VALORANT SHORTS GENERATOR — FFmpeg & Remotion Pipeline
Batch processes Overwolf / NVIDIA Valorant clips into vertical 1080x1920 YouTube Shorts & TikToks.
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

OVERWOLF_DIR = Path(r"C:\Users\anura\Videos\Overwolf\Valorant Tracker\VALORANT")
NVIDIA_DIR = Path(r"C:\Users\anura\Videos\NVIDIA\Valorant")
PROJECT_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = PROJECT_DIR / "public"
OUTPUT_DIR = Path(r"Z:\Coding\Weekend Stuff\output\shorts")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

def find_clips(limit=10):
    """Finds the most recent Valorant MP4 recordings."""
    clips = []
    if OVERWOLF_DIR.exists():
        clips.extend(OVERWOLF_DIR.rglob("*.mp4"))
    if NVIDIA_DIR.exists():
        clips.extend(NVIDIA_DIR.rglob("*.mp4"))
        
    clips.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return clips[:limit]

def get_clip_duration(clip_path: Path) -> float:
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        str(clip_path)
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(res.stdout)
        return float(data["format"]["duration"])
    except Exception:
        return 20.0

def render_ffmpeg_short(clip_path: Path, output_path: Path, duration_sec: int = 10, title: str = "VALORANT 1-TAP") -> bool:
    """Ultra-fast 3-second render using pure FFmpeg with blurred ambient background and killfeed zoom."""
    print(f"[*] Rendering with FFmpeg: {clip_path.name} -> {output_path.name}")
    total_dur = get_clip_duration(clip_path)
    start_time = max(0, total_dur - duration_sec - 1)

    filter_complex = (
        "[0:v]split=3[v_bg][v_fg][v_kf];"
        "[v_bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:6[bg];"
        "[v_fg]scale=1080:-1[fg];"
        "[v_kf]crop=480:180:1420:50,scale=680:-1[kf];"
        "[bg][fg]overlay=0:(H-h)/2[stage1];"
        "[stage1][kf]overlay=(W-w)/2:360[final]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start_time),
        "-t", str(duration_sec),
        "-i", str(clip_path),
        "-filter_complex", filter_complex,
        "-map", "[final]",
        "-map", "0:a?",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "19",
        "-c:a", "aac", "-b:a", "192k",
        str(output_path)
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[OK] Rendered: {output_path} ({output_path.stat().st_size / (1024*1024):.2f} MB)")
        return True
    else:
        print(f"[!] FFmpeg error: {res.stderr[-300:]}")
        return False

def render_remotion_short(clip_path: Path, output_path: Path, title: str = "CLEAN 1-TAP // VANDAL", weapon: str = "VANDAL") -> bool:
    """Full studio-grade Remotion render with kinetic React HUD, spring animations, and kill shake."""
    print(f"[*] Staging clip for Remotion: {clip_path.name}")
    staged_clip = PUBLIC_DIR / "current_clip.mp4"
    
    # Copy/Link clip to public directory for Remotion bundler
    import shutil
    shutil.copy2(clip_path, staged_clip)

    total_dur = get_clip_duration(clip_path)
    # Start ~4s before end of clip where kill occurs
    start_frame = int(max(0, total_dur - 6.5) * 60)

    props = {
        "videoSrc": "current_clip.mp4",
        "startFrame": start_frame,
        "killFrameOffset": 90, # Kill impact at 1.5s
        "title": title,
        "playerTag": "RADIANT // CLUTCH",
        "weapon": weapon,
        "killType": "HEADSHOT"
    }

    cmd = [
        "npx.cmd", "remotion", "render",
        "ValorantShort",
        str(output_path),
        f"--props={json.dumps(props)}",
        "--concurrency=6"
    ]

    print(f"[*] Rendering Remotion composition to {output_path.name}...")
    res = subprocess.run(cmd, cwd=str(PROJECT_DIR), capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[OK] Remotion Short Rendered: {output_path} ({output_path.stat().st_size / (1024*1024):.2f} MB)")
        return True
    else:
        print(f"[!] Remotion error: {res.stderr[-300:] or res.stdout[-300:]}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Generate Valorant Shorts with FFmpeg and Remotion")
    parser.add_argument("--mode", choices=["remotion", "ffmpeg", "both"], default="both", help="Render engine")
    parser.add_argument("--count", type=int, default=1, help="Number of recent clips to process")
    args = parser.parse_args()

    clips = find_clips(args.count)
    if not clips:
        print("[!] No Valorant clips found in Overwolf or NVIDIA folders.")
        return

    print(f"=== Found {len(clips)} Recent Valorant Clip(s) ===")
    for i, clip in enumerate(clips, 1):
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        print(f"\n[{i}/{len(clips)}] Processing: {clip.name}")

        if args.mode in ["ffmpeg", "both"]:
            ff_out = OUTPUT_DIR / f"val_short_ffmpeg_{i}_{timestamp_str}.mp4"
            render_ffmpeg_short(clip, ff_out)

        if args.mode in ["remotion", "both"]:
            remotion_out = OUTPUT_DIR / f"val_short_remotion_{i}_{timestamp_str}.mp4"
            render_remotion_short(clip, remotion_out)

    print(f"\n[OK] All shorts generated in: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
