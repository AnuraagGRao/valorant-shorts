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

# Parse round reports to get exact round numbers
round_starts = []
for dt_e, e in events:
    if e.get("name") in ["round_start", "round_report"]:
        data = e.get("data")
        if isinstance(data, str):
            try: data = json.loads(data)
            except: pass
        if isinstance(data, dict):
            r_num = data.get("round_number") or data.get("round")
            round_starts.append((dt_e.timestamp(), r_num))

def get_weapon_label(raw_str):
    if not raw_str:
        return "Aeris Vandal"
    raw = str(raw_str).lower()
    if "volcano" in raw:
        return "Aeris Vandal"
    if "mp5" in raw:
        return "Spectre"
    if "luger" in raw:
        return "Ghost"
    if "glock" in raw:
        return "Classic"
    if "ar10a2" in raw:
        return "Phantom"
    if "operator" in raw:
        return "Operator"
    if "deadeye_q" in raw:
        return "Headhunter"
    if "deadeye_x" in raw:
        return "Tour De Force"
    return "Vandal"

all_kills = []
all_deaths = []

# Process each clip
for c in mp4_files:
    name = os.path.basename(c)
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", c]
    dur = float(subprocess.check_output(cmd).decode().strip())
    
    m = re.search(r"VALORANT (\d\d)-(\d\d)-(\d{4}) (\d\d)-(\d\d)-(\d\d)-(\d{3})", name)
    mo, d, y, h, mi, s, ms = map(int, m.groups())
    clip_end_dt = datetime(y, mo, d, h, mi, s, ms * 1000)
    clip_start_ts = clip_end_dt.timestamp() - dur
    
    c_events = [e for e in events if clip_start_ts - 2.0 <= e[0].timestamp() <= clip_end_dt.timestamp() + 2.0]
    
    for dt_e, e in c_events:
        ename = e.get("name")
        offset = dt_e.timestamp() - clip_start_ts
        if ename == "kill_feed":
            raw = e.get("data")
            if isinstance(raw, str):
                try: raw = json.loads(raw)
                except: pass
            if isinstance(raw, dict):
                attacker = raw.get("attacker")
                victim = raw.get("victim")
                weapon_raw = raw.get("weapon")
                headshot = bool(raw.get("headshot"))
                
                if attacker == "RadiCalzMad":
                    # Offset within clip
                    t_event = max(0.5, min(dur - 0.2, offset))
                    t_start = max(0.0, t_event - 1.6)
                    t_end = min(dur, t_event + 0.8)
                    all_kills.append({
                        "file": c,
                        "filename": name,
                        "time_str": dt_e.strftime("%H:%M:%S"),
                        "t_event": round(t_event, 2),
                        "t_start": round(t_start, 2),
                        "t_end": round(t_end, 2),
                        "duration": round(t_end - t_start, 2),
                        "victim": victim,
                        "weapon": get_weapon_label(weapon_raw),
                        "headshot": headshot,
                    })
                elif victim == "RadiCalzMad":
                    t_event = max(0.5, min(dur - 0.2, offset))
                    t_start = max(0.0, t_event - 1.6)
                    t_end = min(dur, t_event + 0.8)
                    all_deaths.append({
                        "file": c,
                        "filename": name,
                        "time_str": dt_e.strftime("%H:%M:%S"),
                        "t_event": round(t_event, 2),
                        "t_start": round(t_start, 2),
                        "t_end": round(t_end, 2),
                        "duration": round(t_end - t_start, 2),
                        "killer": attacker,
                        "weapon": get_weapon_label(weapon_raw),
                        "headshot": headshot,
                    })

# In the Ace clip (VALORANT 11-01-2026 16-06-07-502.mp4), Radi killed 5 players!
# Let's check all 5 kills in that round
print(f"Detected {len(all_kills)} kill events and {len(all_deaths)} death events.")

# Deduplicate events that occur within 0.5s of each other (sometimes logged twice)
def dedup(events_list):
    res = []
    for ev in events_list:
        if not res:
            res.append(ev)
        else:
            prev = res[-1]
            if prev["filename"] == ev["filename"] and abs(prev["t_event"] - ev["t_event"]) < 0.8:
                continue
            res.append(ev)
    return res

kills_clean = dedup(all_kills)
deaths_clean = dedup(all_deaths)

print(f"Clean Unique Kills: {len(kills_clean)}")
for i, k in enumerate(kills_clean, 1):
    hs_mark = "[HS]" if k["headshot"] else "[BODY]"
    print(f"  Kill #{i:02d}: [{k['time_str']}] {k['weapon']} vs {k['victim']} ({hs_mark}) | {k['filename']} [{k['t_start']}s - {k['t_end']}s]")

print(f"\nClean Unique Deaths: {len(deaths_clean)}")
for i, d in enumerate(deaths_clean, 1):
    hs_mark = "[HS]" if d["headshot"] else "[HIT]"
    print(f"  Death #{i:02d}: [{d['time_str']}] to {d['killer']} with {d['weapon']} ({hs_mark}) | {d['filename']} [{d['t_start']}s - {d['t_end']}s]")

with open("valorant-shorts/scripts/match_manifest_clean.json", "w", encoding="utf-8") as f:
    json.dump({"kills": kills_clean, "deaths": deaths_clean}, f, indent=2)

print("\nSaved to match_manifest_clean.json")
