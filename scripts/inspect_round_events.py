import re
import json

log_file = r"C:\Users\anura\AppData\Local\Overwolf\Log\Apps\Valorant Tracker\background.html.474.log"
with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        if "16:05:" in line or "16:06:" in line:
            if "kill_feed" in line or '"name":"kill"' in line:
                # Extract timestamp and message
                m = re.search(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{3}).*?(kill_feed|Event Fired).*?(\{.*\})", line)
                if m:
                    ts, kind, data = m.groups()
                    print(f"[{ts}] {kind}: {data[:120]}")

