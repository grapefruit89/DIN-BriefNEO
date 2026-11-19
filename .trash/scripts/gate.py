#!/usr/bin/env python3
"""tools/gate.py — DIN-BriefNEO Konsolidierter Qualitäts- & Architektur-Gatekeeper

Bündelt alle drei Säulen der Qualitätssicherung in einem einzigen, schnellen Aufruf:
  Säule 1: Biome Linter & Code-Formatierung (website/js/)
  Säule 2: Hermetik & Isolation (tools/isolation.js — Law A38 / A45)
  Säule 3: DIN-Architektur-Gates (tools/imr.js, tools/build_db.js, tools/check-charakter-pipeline.py)

Aufruf:
  python3 tools/gate.py           (Vollständiger Gate-Lauf)
  python3 tools/gate.py --fix     (Automatisches Formatieren via Biome vor dem Gate)
  python3 tools/gate.py --fast    (Schnellprüfung ohne SQLite-Doku-Build)
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# ANSI Colors
GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
CYAN = "\033[36m"
BOLD = "\033[1m"
RESET = "\033[0m"


class GateResult:
    def __init__(self, name: str, success: bool, duration_ms: float, output: str):
        self.name = name
        self.success = success
        self.duration_ms = duration_ms
        self.output = output


def run_command(name: str, cmd: list[str]) -> GateResult:
    start = time.perf_counter()
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            check=False,
        )
        duration_ms = (time.perf_counter() - start) * 1000
        return GateResult(name, proc.returncode == 0, duration_ms, proc.stdout)
    except Exception as exc:
        duration_ms = (time.perf_counter() - start) * 1000
        return GateResult(name, False, duration_ms, str(exc))


def main() -> int:
    parser = argparse.ArgumentParser(description="DIN-BriefNEO Unified Quality Gate")
    parser.add_argument("--fix", action="store_true", help="Format and fix safe linter warnings before check")
    parser.add_argument("--fast", action="store_true", help="Skip heavy database compilation")
    args = parser.parse_args()

    print(f"\n{BOLD}{CYAN}=================================================={RESET}")
    print(f"{BOLD}{CYAN}      DIN-BRIEFNEO UNIFIED ARCHITECTURE GATE      {RESET}")
    print(f"{BOLD}{CYAN}=================================================={RESET}\n")

    if args.fix:
        print(f"🔧 {YELLOW}Formatiere Codebase via Biome...{RESET}")
        fix_res = run_command("Biome Fix", ["biome", "check", "--write", "website/js/"])
        if fix_res.success:
            print(f"   {GREEN}✓ Biome Formatierung abgeschlossen ({fix_res.duration_ms:.0f}ms){RESET}\n")
        else:
            print(f"   {RED}✗ Biome Formatierung fehlgeschlagen:{RESET}\n{fix_res.output}\n")

    gates = [
        ("Säule 1: Biome Linter (website/js/)", ["biome", "check", "website/js/"]),
        ("Säule 2: Hermetik & Isolation (Law A38/A45)", ["node", "tools/isolation.js"]),
        ("Säule 3a: IMR Registry (51 din-elements)", ["node", "tools/imr.js"]),
        ("Säule 3b: Testdaten-Pipeline (Charaktere)", ["python3", "tools/check-charakter-pipeline.py"]),
        ("Säule 3d: Adress- & Anrede-Korpus (80 Fälle)", ["node", "test/corpus/run.js"]),
    ]

    if not args.fast:
        gates.append(("Säule 3c: Reality Reconciliation (build_db.js)", ["node", "tools/build_db.js"]))

    all_passed = True
    results: list[GateResult] = []

    for name, cmd in gates:
        print(f"⏳ Prüfe {name}...", end="\r", flush=True)
        res = run_command(name, cmd)
        results.append(res)
        if res.success:
            print(f"{GREEN}✓ PASS{RESET} [{res.duration_ms:>5.0f}ms] {name}")
        else:
            all_passed = False
            print(f"{RED}✗ FAIL{RESET} [{res.duration_ms:>5.0f}ms] {name}")
            print(f"\n{YELLOW}--- Diagnose: {name} ---{RESET}")
            print(res.output.strip())
            print(f"{YELLOW}---------------------------------------{RESET}\n")

    total_time = sum(r.duration_ms for r in results)
    print(f"\n{BOLD}{CYAN}=================================================={RESET}")
    if all_passed:
        print(f"{BOLD}{GREEN}✓ RESULT: ALL GATES GREEN ({total_time:.0f}ms total){RESET}")
        print(f"{CYAN}  100% Fitness • 0 Biome Warnings • Hermetisch Sicher{RESET}")
        print(f"{BOLD}{CYAN}=================================================={RESET}\n")
        return 0
    else:
        print(f"{BOLD}{RED}✗ RESULT: GATE VIOLATION OCCURRED ({total_time:.0f}ms total){RESET}")
        print(f"{BOLD}{CYAN}=================================================={RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
