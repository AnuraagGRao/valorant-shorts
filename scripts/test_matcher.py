import re
import os
import glob
import json
from datetime import datetime

log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
clips_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"

# 1. Parse all clips
clips = sorted(glob.glob(os.path.join(clips_dir, "*.mp4")))
clip_info = []
for c in clips:
    name = os.path.basename(c)
    m = re.search(r"VALORANT (\d\d)-(\d\d)-(\d{4}) (\d\d)-(\d\d)-(\d\d)-(\d{3})", name)
    if m:
        month, day, year, hour, minute, second, ms = m.groups()
        dt = datetime(int(year), int(month), int(day), int(hour), int(minute), int(second), int(ms)*1000)
        clip_info.append({"path": c, "name": name, "dt": dt, "size_mb": os.path.getsize(c)/(1024*1024)})

# 2. Parse all relevant logs
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))
event_re = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{3}).*?Event Fired.*?(\{.*\})")

events = []
for lf in log_files:
    # Only read logs modified around Nov 1, 2026
    mtime = datetime.fromtimestamp(os.path.getmtime(lf))
    if mtime.year == 2026 and mtime.month == 11 and mtime.day in [1, 2]:
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
print(f"Loaded {len(events)} events across all active logs.")

# 3. Classify each clip
results = []
for c in clip_info:
    # Overwolf writes the clip timestamp right as the event concludes
    # Event usually happens 0 to 4 seconds before or at clip dt
    matched = [e for e in events if -1.0 <= (c["dt"] - e["dt"]).total_seconds() <= 4.5]
    
    kills = []
    deaths = []
    headshots = 0
    kill_feed = []

    for e in matched:
        name = e["data"].get("name")
        if name == "kill":
            kills.append(e["data"].get("data"))
        elif name == "death":
            deaths.append(e["data"].get("data"))
        elif name == "headshot":
            headshots += 1
        elif name == "kill_feed":
            raw_feed = e["data"].get("data")
            if isinstance(raw_feed, str):
                try:
                    feed_obj = json.loads(raw_feed)
                    kill_feed.append(feed_obj)
                except Exception:
                    pass
            elif isinstance(raw_feed, dict):
                kill_feed.append(raw_feed)

    # Determine classification
    # Did Radi kill anyone?
    radi_kills = [k for k in kill_feed if k.get("attacker") == "RadiCalzMad"]
    radi_died = any(k for k in kill_feed if k.get("victim") == "RadiCalzMad") or len(deaths) > 0

    if radi_kills:
        clip_type = "KILL"
    elif radi_died:
        clip_type = "DEATH"
    elif kills:
        clip_type = "KILL"
    else:
        clip_type = "UNKNOWN"

    weapon = radi_kills[0].get("weapon", "Unknown") if radi_kills else "None"
    # Simplify weapon names
    if "Volcano" in weapon:
        weapon = "Vandal"
    elif "AR10A2" in weapon:
        weapon = "Phantom"
    elif "Pistol_Luger" in weapon:
        weapon = "Ghost"
    elif "Deadeye_Q" in weapon or "Headhunter" in weapon:
        weapon = "Headhunter"
    elif "tx_hud_dmr" in weapon.lower() or "operator" in weapon.lower():
        weapon = "Operator"
    elif "MP5" in weapon:
        weapon = "Spectre"

    victims = [k.get("victim", "") for k in radi_kills]

    res = {
        "filename": c["name"],
        "path": c["path"],
        "time": c["dt"].strftime("%H:%M:%S"),
        "type": clip_type,
        "kill_count": len(radi_kills) if radi_kills else len(kills),
        "weapon": weapon,
        "headshots": headshots,
        "victims": victims,
        "size_mb": round(c["size_mb"], 1)
    }
    results.append(res)

print("\n" + "="*80)
print(f"{'TIME':<10} | {'TYPE':<6} | {'KILLS':<5} | {'WEAPON':<12} | {'HEADSHOTS':<9} | {'VICTIMS'}")
print("="*80)
for r in results:
    v_str = ", ".join(r["victims"]) if r["victims"] else "-"
    print(f"{r['time']:<10} | {r['type']:<6} | {r['kill_count']:<5} | {r['weapon']:<12} | {r['headshots']:<9} | {v_str}")

# Filter only pure KILL clips
pure_kills = [r for r in results if r["type"] == "KILL"]
print(f"\nTotal KILL clips found: {len(pure_kills)} out of {len(results)} total clips!")
