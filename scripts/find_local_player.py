import glob
import json
import os
import re

log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))

found = set()

for lf in log_files:
    with open(lf, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if "Event Fired" in line:
                m = re.search(r"Event Fired:.*(\{.*\})", line)
                if m:
                    try:
                        d = json.loads(m.group(1))
                        name = d.get("name")
                        if name in ["me", "roster", "match_info", "kill", "death"]:
                            raw_data = d.get("data")
                            if name == "me":
                                print(f"[ME EVENT]: {raw_data}")
                            elif name in ["kill", "death"]:
                                print(f"[{name.upper()} EVENT]: {raw_data}")
                    except Exception:
                        pass

