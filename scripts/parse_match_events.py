"""
Valorant Match Event Parser & Montage Manifest Generator
Autonomous tool for Kei & Radi's Valorant Shorts Production Pipeline.

Correlates raw Overwolf highlight recordings against Overwolf Game Events Service
logs, filters out death clips, extracts kill metadata (weapon, victim, headshot),
and outputs a ready-to-render multi-clip montage JSON manifest.
"""

import argparse
import glob
import json
import os
import re
from datetime import datetime


def parse_match(match_dir: str, output_manifest: str = None, top_n: int = 4):
    print(f"[Kei] Parsing Valorant Match Directory: {match_dir}")
    
    # 1. Locate Overwolf Tracker logs
    log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
    log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))
    if not log_files:
        print("[!] No Overwolf logs found in LocalAppData.")
        return None

    # 2. Extract match folder date from name
    # e.g. VALORANT_11-01-2026_15-58-51-443
    folder_name = os.path.basename(os.path.normpath(match_dir))
    m_folder = re.search(r"VALORANT_(\d\d)-(\d\d)-(\d{4})_(\d\d)-(\d\d)-(\d\d)", folder_name)
    if not m_folder:
        print(f"[!] Could not extract date from folder name: {folder_name}")
        return None

    f_month, f_day, f_year, f_hour, f_min, f_sec = map(int, m_folder.groups())
    match_start_dt = datetime(f_year, f_month, f_day, f_hour, f_min, f_sec)
    print(f"[Kei] Match Start: {match_start_dt.strftime('%Y-%m-%d %H:%M:%S')}")

    # 3. Read events from relevant log files
    event_re = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{3}).*?Event Fired.*?(\{.*\})")
    events = []
    
    for lf in log_files:
        mtime = datetime.fromtimestamp(os.path.getmtime(lf))
        # Filter to logs within 24 hours of match
        if abs((mtime - match_start_dt).total_seconds()) < 86400:
            with open(lf, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    m = event_re.search(line)
                    if m:
                        dt_str, json_str = m.groups()
                        try:
                            dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S,%f")
                            data = json.loads(json_str)
                            events.append({"dt": dt, "data": data})
                        except Exception:
                            pass

    events.sort(key=lambda x: x["dt"])
    print(f"[Kei] Parsed {len(events)} events from Overwolf telemetry.")

    # 4. Parse all MP4 clips in match_dir
    mp4_files = sorted(glob.glob(os.path.join(match_dir, "*.mp4")))
    clip_list = []
    for c in mp4_files:
        name = os.path.basename(c)
        m = re.search(r"VALORANT (\d\d)-(\d\d)-(\d{4}) (\d\d)-(\d\d)-(\d\d)-(\d{3})", name)
        if m:
            mo, d, y, h, mi, s, ms = map(int, m.groups())
            dt = datetime(y, mo, d, h, mi, s, ms * 1000)
            clip_list.append({"path": c, "name": name, "dt": dt, "size_bytes": os.path.getsize(c)})

    print(f"[Kei] Found {len(clip_list)} highlight recordings in match folder.")

    # 5. Classify clips
    classified = []
    for c in clip_list:
        matched_events = [e for e in events if -1.0 <= (c["dt"] - e["dt"]).total_seconds() <= 4.5]
        
        kills = []
        deaths = []
        headshots = 0
        kill_feed = []

        for e in matched_events:
            ename = e["data"].get("name")
            if ename == "kill":
                kills.append(e["data"].get("data"))
            elif ename == "death":
                deaths.append(e["data"].get("data"))
            elif ename == "headshot":
                headshots += 1
            elif ename == "kill_feed":
                feed_raw = e["data"].get("data")
                if isinstance(feed_raw, str):
                    try:
                        kill_feed.append(json.loads(feed_raw))
                    except Exception:
                        pass
                elif isinstance(feed_raw, dict):
                    kill_feed.append(feed_raw)

        # Did Radi kill someone?
        radi_kills = [k for k in kill_feed if k.get("attacker") == "RadiCalzMad"]
        radi_deaths = [k for k in kill_feed if k.get("victim") == "RadiCalzMad"] or deaths

        if radi_kills:
            ctype = "KILL"
        elif radi_deaths:
            ctype = "DEATH"
        elif kills:
            ctype = "KILL"
        else:
            ctype = "UNKNOWN"

        raw_weapon = radi_kills[0].get("weapon", "") if radi_kills else ""
        weapon = "Vandal" if "Volcano" in raw_weapon else (
            "Phantom" if "AR10A2" in raw_weapon else (
                "Ghost" if "Luger" in raw_weapon else (
                    "Operator" if "dmr" in raw_weapon.lower() else (
                        "Spectre" if "MP5" in raw_weapon else "Primary"
                    )
                )
            )
        )

        victims = [k.get("victim", "") for k in radi_kills]

        classified.append({
            "name": c["name"],
            "path": c["path"],
            "time": c["dt"].strftime("%H:%M:%S"),
            "type": ctype,
            "kill_count": max(len(radi_kills), len(kills)),
            "weapon": weapon,
            "headshots": headshots,
            "victims": victims,
            "size_mb": round(c["size_bytes"] / (1024 * 1024), 2),
        })

    kill_clips = [c for c in classified if c["type"] == "KILL"]
    death_clips = [c for c in classified if c["type"] == "DEATH"]

    print(f"\n[Kei] Results: {len(kill_clips)} Kills, {len(death_clips)} Deaths, {len(classified) - len(kill_clips) - len(death_clips)} Other.")

    # 6. Rank kills for montage (Multikills > Headshots > Later in match)
    kill_clips.sort(key=lambda x: (x["kill_count"], x["headshots"]), reverse=True)
    top_picks = kill_clips[:top_n]

    print("\n[Kei] Top Selected Kills for Montage:")
    for i, k in enumerate(top_picks, 1):
        print(f"  #{i}: [{k['time']}] {k['weapon']} - {k['kill_count']}K ({k['headshots']} HS) vs {', '.join(k['victims'])}")

    manifest = {
        "match_id": folder_name,
        "match_date": match_start_dt.strftime("%Y-%m-%d"),
        "total_recordings": len(classified),
        "total_kills": len(kill_clips),
        "total_deaths": len(death_clips),
        "selected_montage_clips": top_picks,
    }

    if output_manifest:
        with open(output_manifest, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
        print(f"\n[OK] Montage Manifest saved to: {output_manifest}")

    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Parse Overwolf Match Events for Valorant Shorts")
    parser.add_argument("--match-dir", required=True, help="Path to match folder containing MP4 clips")
    parser.add_argument("--output", default="manifest.json", help="Path to output JSON manifest")
    parser.add_argument("--top", type=int, default=4, help="Number of top kills to pick for montage")
    args = parser.parse_args()

    parse_match(args.match_dir, args.output, args.top)

