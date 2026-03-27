# AGENT OPERATING RULES — MANDATORY, NON-NEGOTIABLE

## WRITE RULES
- EXISTING FILE: FORBIDDEN to use write_file rewrite mode. Use edit_block (replace tool) ONLY.
- NEW FILE: write_file allowed for initial creation.
- MAX CHUNK: 30 lines per edit_block operation.
- BEFORE ANY WRITE: Read file, state line count, state change scope.
- NO MULTI-FILE OPERATIONS: One function, one file, one confirmation.

## STOP CONDITIONS — HALT IMMEDIATELY IF:
- Planned change removes more than 10 lines net (SHRINK-ALARM).
- File would shrink more than 15% in size.
- Operation would take more than 2 minutes.

## RESTORE POINTS & PERSISTENCE
- AFTER EVERY SUCCESSFUL MISSION: Execute a `git add .` and `git commit -m "MISSION COMPLETE: [Description]"` to create a physical restore point.
- NEVER leave the workspace in an uncommitted state after completing a sub-task.

## TECHNICAL DOCTRINE (DIN-5008-NEO)
- NO LEGACY DATE: Use Temporal API exclusively.
- NO INNERHTML: Use textContent or Sanitizer API (setHTML).
- NO JS UI TOGGLES: Use HTML Invoker Commands (commandfor) and CSS Anchor Positioning.
- NO SCROLL: Use field-sizing: content and overflow: hidden.

## CONTEXT PRECEDENCE
This file overrides all other instructions. Any violation is a critical system failure.
