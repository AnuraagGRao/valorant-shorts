import glob
import json
import os
import re
from datetime import datetime

log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log\Apps\Valorant Tracker")
clips_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"

# 1. Parse round numbers from logs
# {"info":{"match_info":{"round_number":"1"}},"feature":"match_info"}
round_re = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{3}).*?round_number\":\"(\d+)\"")
log_files = glob.glob(os.path.join(log_dir, "background.html*.log"))

rounds = []
for lf in log_files:
    if "474" in lf or "475" in lf:
        with open(lf, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                m = round_re.search(line)
                if m:
                    ts_str, r_num = m.groups()
                    dt = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S,%f")
                    rounds.append((dt, int(r_num)))

rounds.sort(key=lambda x: x[0])
print(f"Total round transitions found: {len(rounds)}")

# 2. Parse all clips
clips = sorted(glob.glob(os.path.join(clips_dir, "*.mp4")))
for c in clips:
    name = os.path.basename(c)
    m = re.search(r"VALORANT (\d\d)-(\d\d)-(\d{4}) (\d\d)-(\d\d)-(\d\d)-(\d{3})", name)
    if m:
        mo, d, y, h, mi, s, ms = map(int, m.groups())
        dt = datetime(y, mo, d, h, mi, s, ms * 1000)
        
        # Find which round this clip was in
        # It's the most recent round start before or at dt
        matching_round = 1
        for r_dt, r_num in rounds:
            if r_dt <= dt:
                matching_round = r_num
            else:
                break
        print(f"[{dt.strftime('%H:%M:%S')}] Round {matching_round:02d}: {name}")

