"""
VALORANT SHORTS GENERATOR — FFmpeg & Remotion Pipeline (Kei OS)
Autonomous vertical 1080x1920 YouTube Shorts & TikTok pipeline.
Pulls directly from Valkyrie Native Rust Engine, Overwolf, or NVIDIA recordings.
Parses Valkyrie ground-truth sidecar JSON for millisecond-perfect killframe synchronization.
"""

import os
import sys
import time
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

VALKYRIE_DIR = Path(r"C:\Users\anura\Videos\Valkyrie")
OVERWOLF_DIR = Path(r"C:\Users\anura\Videos\Overwolf\Valorant Tracker\VALORANT")
NVIDIA_DIR = Path(r"C:\Users\anura\Videos\NVIDIA\Valorant")
PROJECT_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = PROJECT_DIR / "public"
OUTPUT_DIR = Path(r"Z:\Coding\Weekend Stuff\output\shorts")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)


def read_sidecar(clip_path: Path) -> dict | None:
    """Reads the Valkyrie ground-truth sidecar JSON if it exists alongside the clip."""
    sidecar_path = clip_path.with_suffix(".json")
    if sidecar_path.exists():
        try:
            with open(sidecar_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Warning: Failed to parse sidecar {sidecar_path.name}: {e}")
    return None


def find_clips(limit=10):
    """Finds the most recent Valorant MP4 recordings across Valkyrie, Overwolf, and NVIDIA."""
    clips = []
    # 1. Primary: Valkyrie native capture
    if VALKYRIE_DIR.exists():
        for p in VALKYRIE_DIR.glob("*.mp4"):
            if p.stat().st_size > 1024 * 512:  # Ignore 0-byte or corrupt files
                clips.append(p)
    # 2. Secondary fallbacks
    if OVERWOLF_DIR.exists():
        clips.extend([p for p in OVERWOLF_DIR.rglob("*.mp4") if p.stat().st_size > 1024 * 512])
    if NVIDIA_DIR.exists():
        clips.extend([p for p in NVIDIA_DIR.rglob("*.mp4") if p.stat().st_size > 1024 * 512])

    clips.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return clips[:limit]


def get_clip_duration(clip_path: Path) -> float:
    """Queries exact clip duration via ffprobe."""
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


def render_ffmpeg_short(clip_path: Path, output_path: Path, duration_sec: int = 8, sidecar: dict | None = None) -> bool:
    """
    Ultra-fast hardware/CPU render using pure FFmpeg with blurred ambient background,
    centered gameplay, and magnified top killfeed PIP overlay.
    """
    print(f"[*] Rendering with FFmpeg: {clip_path.name} -> {output_path.name}")
    total_dur = get_clip_duration(clip_path)

    # In Valkyrie, kill impact happens exactly 3.0s before the end of the clip (post-roll window)
    post_roll = 3.0
    if sidecar and "estimated_impact_sec" in sidecar:
        raw_impact = float(sidecar["estimated_impact_sec"])
        if 0.5 < raw_impact < total_dur:
            impact_sec = raw_impact
        else:
            impact_sec = max(1.0, total_dur - post_roll)
    else:
        impact_sec = max(1.0, total_dur - post_roll)

    # Center short: 2.5s pre-kill buildup, then kill impact, then aftermath
    start_time = max(0.0, impact_sec - 2.5)
    actual_duration = min(float(duration_sec), max(2.0, total_dur - start_time))

    filter_complex = (
        "[0:v]split=3[v_bg][v_fg][v_kf];"
        "[v_bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:6[bg];"
        "[v_fg]scale=1080:-1[fg];"
        "[v_kf]crop=480:180:1420:50,scale=680:-1[kf];"
        "[bg][fg]overlay=0:(H-h)/2[stage1];"
        "[stage1][kf]overlay=(W-w)/2:360,format=yuv420p[final]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-ss", f"{start_time:.2f}",
        "-t", f"{actual_duration:.2f}",
        "-i", str(clip_path),
        "-filter_complex", filter_complex,
        "-map", "[final]",
        "-map", "0:a?",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "19",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        str(output_path)
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[OK] FFmpeg Short Rendered: {output_path.name} ({output_path.stat().st_size / (1024*1024):.2f} MB)")
        return True
    else:
        print(f"[!] FFmpeg error: {res.stderr[-300:]}")
        return False


def render_remotion_short(clip_path: Path, output_path: Path, sidecar: dict | None = None) -> bool:
    """
    Full studio-grade Remotion render with kinetic React HUD, spring animations,
    kill shake, dynamic typography, and sidecar ground-truth props.
    """
    print(f"[*] Staging clip for Remotion: {clip_path.name}")
    staged_clip = PUBLIC_DIR / "current_clip.mp4"

    import shutil
    shutil.copy2(clip_path, staged_clip)

    total_dur = get_clip_duration(clip_path)

    # Derive metadata from sidecar if available
    killer = "RadiCalzMad"
    victim = "Enemy"
    weapon = "VANDAL"
    headshot = True
    event_type = "Kill"
    post_roll = 3.0
    impact_sec = max(1.0, total_dur - post_roll)

    if sidecar:
        raw_impact = float(sidecar.get("estimated_impact_sec", 0.0))
        if 0.5 < raw_impact < total_dur:
            impact_sec = raw_impact
        event = sidecar.get("event", {})
        if event:
            killer = event.get("killer", killer)
            victim = event.get("victim", victim)
            weapon = event.get("weapon", weapon).upper()
            headshot = event.get("headshot", headshot)
            event_type = event.get("event_type", event_type)

    # Align start frame so kill impact lands exactly at frame 90 (1.5s into short)
    kill_offset_frames = 90
    kill_offset_sec = kill_offset_frames / 60.0
    start_sec = max(0.0, impact_sec - kill_offset_sec)
    start_frame = int(start_sec * 60)

    # Format dynamic titles
    if event_type == "Ace":
        title = f"1v5 ACE // {weapon}"
        kill_type = "ACE CLUTCH"
    elif event_type == "Death":
        title = f"DELETED BY {killer.upper()}"
        kill_type = "ELIMINATED"
    elif headshot:
        title = f"CLEAN 1-TAP // {weapon}"
        kill_type = "HEADSHOT"
    else:
        title = f"CLUTCH ELIMINATION // {weapon}"
        kill_type = "FRAG"

    player_tag = f"{killer.upper()} // RADIANT"

    props = {
        "videoSrc": "current_clip.mp4",
        "startFrame": start_frame,
        "killFrameOffset": kill_offset_frames,
        "title": title,
        "playerTag": player_tag,
        "weapon": weapon,
        "killType": kill_type
    }

    cmd = [
        "npx.cmd", "remotion", "render",
        "ValorantShort",
        str(output_path),
        f"--props={json.dumps(props)}",
        "--concurrency=6"
    ]

    print(f"[*] Rendering Remotion composition ({title})...")
    res = subprocess.run(cmd, cwd=str(PROJECT_DIR), capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[OK] Remotion Short Rendered: {output_path.name} ({output_path.stat().st_size / (1024*1024):.2f} MB)")
        return True
    else:
        print(f"[!] Remotion error: {res.stderr[-300:] or res.stdout[-300:]}")
        return False


def watch_valkyrie_folder(mode="both"):
    """Monitors Valkyrie directory for newly saved clips and renders shorts autonomously."""
    print(f"[*] Watching {VALKYRIE_DIR} for new Valkyrie highlights (mode: {mode}). Press Ctrl+C to stop.\n")
    processed = set()
    for p in VALKYRIE_DIR.glob("*.mp4"):
        processed.add(str(p.resolve()))

    while True:
        try:
            time.sleep(2.0)
            if not VALKYRIE_DIR.exists():
                continue

            for clip in VALKYRIE_DIR.glob("*.mp4"):
                clip_resolved = str(clip.resolve())
                if clip_resolved in processed:
                    continue

                # Wait for file to finish writing (size must be stable and >1MB)
                size1 = clip.stat().st_size
                time.sleep(1.0)
                size2 = clip.stat().st_size
                if size2 < 1024 * 1024 or size1 != size2:
                    continue  # Still writing

                # Sidecar check
                sidecar = read_sidecar(clip)

                print(f"\n⚡ [NEW CLIP DETECTED] {clip.name} ({size2 / (1024*1024):.1f} MB)")
                processed.add(clip_resolved)
                timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")

                if mode in ["ffmpeg", "both"]:
                    ff_out = OUTPUT_DIR / f"val_short_ffmpeg_{timestamp_str}.mp4"
                    render_ffmpeg_short(clip, ff_out, sidecar=sidecar)

                if mode in ["remotion", "both"]:
                    remotion_out = OUTPUT_DIR / f"val_short_remotion_{timestamp_str}.mp4"
                    render_remotion_short(clip, remotion_out, sidecar=sidecar)

        except KeyboardInterrupt:
            print("\n[*] Exiting watch mode.")
            break
        except Exception as e:
            print(f"[!] Error in watch loop: {e}")
            time.sleep(2.0)


def main():
    parser = argparse.ArgumentParser(description="Generate Valorant Shorts with FFmpeg and Remotion (Kei OS)")
    parser.add_argument("--mode", choices=["remotion", "ffmpeg", "both"], default="both", help="Render engine")
    parser.add_argument("--count", type=int, default=1, help="Number of recent clips to process")
    parser.add_argument("--clip", type=str, default=None, help="Process a specific clip file directly")
    parser.add_argument("--watch", action="store_true", help="Watch Valkyrie folder for new clips and auto-render")
    args = parser.parse_args()

    if args.watch:
        watch_valkyrie_folder(mode=args.mode)
        return

    if args.clip:
        clip_path = Path(args.clip)
        if not clip_path.exists():
            print(f"[!] Specified clip does not exist: {clip_path}")
            return
        clips = [clip_path]
    else:
        clips = find_clips(args.count)

    if not clips:
        print("[!] No Valorant clips found in Valkyrie, Overwolf, or NVIDIA folders.")
        return

    print(f"=== Found {len(clips)} Valorant Clip(s) ===")
    for i, clip in enumerate(clips, 1):
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        sidecar = read_sidecar(clip)
        sidecar_tag = f" (Sidecar detected: {sidecar.get('event', {}).get('event_type', 'Kill')})" if sidecar else ""
        print(f"\n[{i}/{len(clips)}] Processing: {clip.name}{sidecar_tag}")

        if args.mode in ["ffmpeg", "both"]:
            ff_out = OUTPUT_DIR / f"val_short_ffmpeg_{i}_{timestamp_str}.mp4"
            render_ffmpeg_short(clip, ff_out, sidecar=sidecar)

        if args.mode in ["remotion", "both"]:
            remotion_out = OUTPUT_DIR / f"val_short_remotion_{i}_{timestamp_str}.mp4"
            render_remotion_short(clip, remotion_out, sidecar=sidecar)

    print(f"\n[OK] All shorts generated in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
