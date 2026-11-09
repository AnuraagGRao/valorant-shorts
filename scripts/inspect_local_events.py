import glob
import json
import os
import re

log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))

local_kills = []
local_deaths = []

for lf in log_files:
    with open(lf, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if "2026-11-01 16:" in line and "Event Fired" in line:
                idx = line.find('{"name":')
                if idx != -1:
                    try:
                        d = json.loads(line[idx:])
                        ename = d.get("name")
                        ts = line[:23]
                        if ename == "kill":
                            local_kills.append((ts, d.get("data")))
                        elif ename == "death":
                            local_deaths.append((ts, d.get("data")))
                    except Exception:
                        pass

print(f"Local kills fired by Overwolf (when the local player gets a kill): {len(local_kills)}")
for ts, data in local_kills:
    print(f"  KILL at {ts}: {data}")

print(f"\nLocal deaths fired by Overwolf (when the local player dies): {len(local_deaths)}")
for ts, data in local_deaths:
    print(f"  DEATH at {ts}: {data}")

