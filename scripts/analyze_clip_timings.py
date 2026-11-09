import glob
import json
import os
import re
import subprocess
from datetime import datetime

match_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"
mp4_files = sorted(glob.glob(os.path.join(match_dir, "*.mp4")))

# Parse Overwolf log events
log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))
match_start_dt = datetime(2026, 11, 1, 15, 58, 51)

events = []
event_re = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{3}).*?Event Fired.*?(\{.*\})")
for lf in log_files:
    mtime = datetime.fromtimestamp(os.path.getmtime(lf))
    if abs((mtime - match_start_dt).total_seconds()) < 86400:
        with open(lf, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                m = event_re.search(line)
                if m:
                    dt_str, json_str = m.groups()
                    try:
                        events.append((datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S,%f"), json.loads(json_str)))
                    except Exception:
                        pass
events.sort(key=lambda x: x[0])

print(f"Total events: {len(events)}")

for c in mp4_files:
    name = os.path.basename(c)
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", c]
    dur = float(subprocess.check_output(cmd).decode().strip())
    
    m = re.search(r"VALORANT (\d\d)-(\d\d)-(\d{4}) (\d\d)-(\d\d)-(\d\d)-(\d{3})", name)
    mo, d, y, h, mi, s, ms = map(int, m.groups())
    clip_end_dt = datetime(y, mo, d, h, mi, s, ms * 1000)
    clip_start_dt = clip_end_dt.timestamp() - dur
    
    # Check events inside or around this clip window
    # Overwolf filenames are the END time when the buffer was written to disk!
    c_events = [e for e in events if clip_start_dt - 2.0 <= e[0].timestamp() <= clip_end_dt.timestamp() + 2.0]
    
    kills = []
    deaths = []
    for dt_e, e in c_events:
        ename = e.get("name")
        offset = dt_e.timestamp() - clip_start_dt
        if ename == "kill_feed":
            raw = e.get("data")
            if isinstance(raw, str):
                try: raw = json.loads(raw)
                except: pass
            if isinstance(raw, dict):
                if raw.get("attacker") == "RadiCalzMad":
                    kills.append((offset, raw.get("victim"), raw.get("weapon"), raw.get("headshot")))
                elif raw.get("victim") == "RadiCalzMad":
                    deaths.append((offset, raw.get("attacker"), raw.get("weapon"), raw.get("headshot")))
    
    info_str = f"{name} (dur: {dur:.1f}s) -> "
    if kills:
        info_str += f"KILLS: {kills} "
    if deaths:
        info_str += f"DEATHS: {deaths}"
    if kills or deaths:
        print(info_str)

