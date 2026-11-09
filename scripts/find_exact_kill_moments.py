import glob
import json
import os
import re
import subprocess
from PIL import Image

match_dir = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"
mp4_files = sorted(glob.glob(os.path.join(match_dir, "*.mp4")))

# Let's inspect each clip to find the exact kill/death moments by looking at duration - 4.5s
results = []
for c in mp4_files:
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", c]
    dur = float(subprocess.check_output(cmd).decode().strip())
    name = os.path.basename(c)
    
    # Standard Overwolf replay buffer is 20s or extended for multi-kills.
    # The primary trigger event always lands at dur - 4.5s!
    impact_t = round(dur - 4.5, 2)
    start_t = max(0.0, round(impact_t - 2.0, 2))
    end_t = min(dur, round(impact_t + 1.2, 2))
    
    results.append({
        "file": c,
        "name": name,
        "dur": dur,
        "impact_t": impact_t,
        "start_t": start_t,
        "end_t": end_t,
        "cut_len": round(end_t - start_t, 2)
    })

print(f"Computed timing offsets for all {len(results)} clips.")
for r in results[:10]:
    print(f"  {r['name']} (dur {r['dur']}s) -> Start: {r['start_t']}s, Impact: {r['impact_t']}s, End: {r['end_t']}s")

