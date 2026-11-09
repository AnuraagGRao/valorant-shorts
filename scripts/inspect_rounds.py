import glob
import json
import os
import re

log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))

round_events = []
for lf in log_files:
    if "474" in lf or "475" in lf:
        with open(lf, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if "round_report" in line or "round_start" in line or "match_clock" in line or "match_info" in line:
                    m = re.search(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{3}).*?(round_report|round_start|match_info).*?(\{.*\})", line)
                    if m:
                        ts, kind, data = m.groups()
                        try:
                            d = json.loads(data)
                            round_events.append((ts, kind, d))
                        except Exception:
                            pass

print(f"Found {len(round_events)} round events.")
for ts, kind, d in round_events[:20]:
    print(f"[{ts}] {kind}: {str(d)[:120]}")

