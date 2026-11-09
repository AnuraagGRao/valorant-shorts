import glob
import json
import os
import re

log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))

event_names = set()
samples = {}

for lf in log_files:
    with open(lf, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if "2026-11-01 16:" in line and "Event Fired" in line:
                idx = line.find('{"name":')
                if idx != -1:
                    try:
                        d = json.loads(line[idx:])
                        ename = d.get("name")
                        event_names.add(ename)
                        if ename not in samples:
                            samples[ename] = d.get("data")
                    except Exception:
                        pass

print("Event names fired during match:")
for en in sorted(event_names):
    print(f"  {en}: {str(samples[en])[:120]}")

