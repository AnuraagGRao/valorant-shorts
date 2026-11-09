import glob
import json
import os

log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))

roster = set()

for lf in log_files:
    with open(lf, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if "2026-11-01 16:0" in line and "scoreboard_" in line:
                idx = line.find('{"info":')
                if idx != -1:
                    try:
                        d = json.loads(line[idx:])
                        mi = d.get("info", {}).get("match_info", {})
                        for k, v in mi.items():
                            if k.startswith("scoreboard_"):
                                raw = json.loads(v) if isinstance(v, str) else v
                                pname = raw.get("name")
                                is_loc = raw.get("is_local")
                                char = raw.get("character")
                                team = raw.get("team")
                                roster.add((pname, char, is_loc, team))
                    except Exception:
                        pass

print("Scoreboard roster:")
for p in sorted(roster):
    print(p)
