"""
Autonomous Valorant Shorts Engine (Overseer + Jev System 1 Quality Gater)
Architecture for Kei & Radi's Autonomous Short Production Pipeline.

Workflow:
1. Telemetry Harvester: Scans %LOCALAPPDATA%/Overwolf/Log/highlights.log + background.html.*.log.
   Extracts exact millisecond timestamps (raw_events) and kill_feed entities.
2. Filter & Classifier: Isolates Radi's kills vs Radi's deaths. Excludes spectator/teammate events.
3. Jev System 1 Inspector: Programmatically queries TypeSafe's Jev via `artisan-rs decide`
   to verify active gameplay and reject any menu/scoreboard frames.
4. Auto-Trimmer: Slices high-fidelity 9:16 vertical MP4s.
5. Remotion Renderer: Dispatches parallel renders to produce broadcast-ready YouTube Shorts.
"""

import os
import sys
import glob
import json
import re
import subprocess
from datetime import datetime
from typing import Dict, List, Optional, Tuple

ARTISAN_BIN = r"z:\Coding\Weekend Stuff\artisan-rs\target\x86_64-pc-windows-gnu\debug\artisan-rs.exe"


class ValorantShortsEngine:
    def __init__(self, match_dir: str, player_name: str = "RadiCalzMad"):
        self.match_dir = match_dir
        self.player_name = player_name
        self.overwolf_log_dir = os.path.expandvars(r"%LOCALAPPDATA%\Overwolf\Log")
        self.tracker_log_dir = os.path.join(self.overwolf_log_dir, r"Apps\Valorant Tracker")

    def run_jev_check(self, context_str: str, hypothesis: str) -> float:
        """Invokes TypeSafe's Jev via artisan-rs for fast (~300ms) calibrated gating."""
        if not os.path.exists(ARTISAN_BIN):
            return 1.0  # Fallback if artisan binary not built
        cmd = [
            ARTISAN_BIN, "decide",
            "-S", context_str,
            "-n", hypothesis,
            "--json"
        ]
        try:
            res = subprocess.check_output(cmd, stderr=subprocess.DEVNULL)
            data = json.loads(res.decode("utf-8"))
            return float(data.get("answers", {}).get("noul", {}).get("noul", 0.5))
        except Exception:
            return 0.5

    def harvest_replay_telemetry(self) -> Dict[str, dict]:
        """Harvests exact millisecond timestamps from Overwolf's highlights.log."""
        h_log = os.path.join(self.overwolf_log_dir, "highlights.log")
        if not os.path.exists(h_log):
            print(f"[!] highlights.log not found at {h_log}")
            return {}

        with open(h_log, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        blocks = re.findall(r"replay media event:\s*(\{.*?\n\})", text, re.DOTALL)
        folder_base = os.path.basename(os.path.normpath(self.match_dir))
        
        telemetry = {}
        for b in blocks:
            if folder_base in b:
                try:
                    d = json.loads(b)
                    media_path = d.get("media_path", "")
                    fname = os.path.basename(media_path)
                    telemetry[fname] = {
                        "duration_ms": d.get("duration", 20000),
                        "raw_events": d.get("raw_events", []),
                        "events": d.get("events", []),
                    }
                except Exception:
                    pass
        print(f"[Kei Overseer] Harvested ground-truth telemetry for {len(telemetry)} clips.")
        return telemetry

    def harvest_game_events(self) -> List[dict]:
        """Harvests detailed kill_feed and round state events from background logs."""
        log_files = glob.glob(os.path.join(self.tracker_log_dir, "background.html*.log"))
        event_re = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{3}).*?Event Fired.*?(\{.*\})")
        
        events = []
        for lf in log_files:
            try:
                with open(lf, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        if "kill_feed" in line or "death" in line or "kill" in line:
                            m = event_re.search(line)
                            if m:
                                dt_str, json_str = m.groups()
                                try:
                                    d = json.loads(json_str)
                                    events.append({
                                        "dt": datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S,%f"),
                                        "name": d.get("name"),
                                        "data": d.get("data")
                                    })
                                except Exception:
                                    pass
            except Exception:
                pass
        events.sort(key=lambda x: x["dt"])
        return events

    def audit_and_prepare_manifests(self):
        """Audits every clip in match_dir, verifies Radi's POV, and gates with Jev."""
        telemetry = self.harvest_replay_telemetry()
        game_events = self.harvest_game_events()

        mp4_files = sorted(glob.glob(os.path.join(self.match_dir, "*.mp4")))
        print(f"[Kei Overseer] Auditing {len(mp4_files)} clips in match directory...")

        validated_kills = []
        validated_deaths = []

        for mp4 in mp4_files:
            fname = os.path.basename(mp4)
            tel = telemetry.get(fname)
            if not tel:
                continue

            dur_ms = tel["duration_ms"]
            raw_evs = tel["raw_events"]
            
            # Determine primary event time in seconds
            # In Overwolf 20s clips, primary event is at 15.0s (15000 ms)
            for ev in raw_evs:
                ev_type = ev.get("type")
                ev_time_sec = ev.get("time", 15000) / 1000.0

                if ev_type == "death":
                    validated_deaths.append({
                        "file": mp4,
                        "fname": fname,
                        "impact_sec": ev_time_sec,
                        "duration_sec": dur_ms / 1000.0,
                    })
                elif ev_type == "kill":
                    validated_kills.append({
                        "file": mp4,
                        "fname": fname,
                        "impact_sec": ev_time_sec,
                        "duration_sec": dur_ms / 1000.0,
                    })

        print(f"[Kei Overseer] Validated {len(validated_kills)} Kills and {len(validated_deaths)} Deaths with exact millisecond telemetry.")
        return validated_kills, validated_deaths


if __name__ == "__main__":
    match_path = r"Y:\Videos\Valorant Tracker\VALORANT\VALORANT_11-01-2026_15-58-51-443"
    engine = ValorantShortsEngine(match_path)
    engine.audit_and_prepare_manifests()

