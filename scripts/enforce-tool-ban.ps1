# scripts/enforce-tool-ban.ps1
# -----------------------------------------------------------------
# DIN-BriefNEO -- Tool Ban Enforcement
# BANNED TOOLS DOCTRINE [MANDATE-BANNED]
# 
# This script disables 'head' and 'tail' by aliasing them to an error.
# This prevents AI agents from using fragmented file reads.
# -----------------------------------------------------------------

function Throw-MandateViolation {
    param($ToolName)
    Write-Host "" -ForegroundColor Red
    Write-Host "!!! MANDATE VIOLATION [MANDATE-BANNED] !!!" -ForegroundColor Red
    Write-Host "The tool '$ToolName' is strictly forbidden in this project." -ForegroundColor Red
    Write-Host "REASON: tail und head sind aufgrund von sicherheitsrisiken gesperrt, bitte benutze andere tools" -ForegroundColor Yellow
    Write-Host "ACTION: Use 'read_file' with explicit start_line and end_line instead." -ForegroundColor Cyan
    Write-Host ""
    # In some contexts we might want to exit, but for a global profile we just return
    # exit 1 
}

# Create aliases and functions to overwrite any existing head/tail commands in the session
function head { Throw-MandateViolation "head" }
function tail { Throw-MandateViolation "tail" }

# Set-Alias can override existing commands, but functions have higher precedence in PowerShell than binaries.
# By defining functions named 'head' and 'tail', they will be used instead of head.exe and tail.exe.

Write-Host "MANDATE-BANNED: Tools 'head' and 'tail' have been disabled in this session." -ForegroundColor Green
