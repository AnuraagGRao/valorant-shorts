import glob
import json
import os
import re
from datetime import datetime

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

match_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"
mp4_files = sorted(glob.glob(os.path.join(match_dir, "*.mp4")))

print("=== DEATH CLIPS & TRADES IN MATCH ===")
for c in mp4_files:
    name = os.path.basename(c)
    m = re.search(r"VALORANT (\d\d)-(\d\d)-(\d{4}) (\d\d)-(\d\d)-(\d\d)-(\d{3})", name)
    if not m:
        continue
    mo, d, y, h, mi, s, ms = map(int, m.groups())
    dt = datetime(y, mo, d, h, mi, s, ms * 1000)

    # Check deaths
    c_events = [e for e in events if -1.0 <= (dt - e[0]).total_seconds() <= 4.5]
    kill_feeds = []
    for dt_e, e in c_events:
        if e.get("name") == "kill_feed":
            raw = e.get("data")
            if isinstance(raw, str):
                try:
                    kill_feeds.append(json.loads(raw))
                except Exception:
                    pass
            elif isinstance(raw, dict):
                kill_feeds.append(raw)

    radi_deaths = [kf for kf in kill_feeds if kf.get("victim") == "RadiCalzMad"]
    radi_kills = [kf for kf in kill_feeds if kf.get("attacker") == "RadiCalzMad"]

    if radi_deaths and not radi_kills:
        d = radi_deaths[0]
        killer = d.get("attacker", "Unknown")
        weapon = d.get("weapon", "Weapon")
        hs = d.get("headshot", False)
        print(f"DEATH [{dt.strftime('%H:%M:%S')}] by {killer} with {weapon} (HS: {hs}) -> {name}")
    elif radi_deaths and radi_kills:
        d = radi_deaths[0]
        k = radi_kills[0]
        print(f"TRADE [{dt.strftime('%H:%M:%S')}] killed {k.get('victim')} then died to {d.get('attacker')} -> {name}")

