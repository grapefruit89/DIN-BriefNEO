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
    Write-Host "REASON: Legacy tools like head/tail lead to context fragmentation." -ForegroundColor Red
    Write-Host "ACTION: Use 'read_file' with explicit start_line and end_line instead." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Create aliases to overwrite any existing head/tail commands in the session
Set-Alias -Name head -Value (New-Item -Path function:head -Value { Throw-MandateViolation "head" } -Force) -Option Constant -ErrorAction SilentlyContinue
Set-Alias -Name tail -Value (New-Item -Path function:tail -Value { Throw-MandateViolation "tail" } -Force) -Option Constant -ErrorAction SilentlyContinue

Write-Host "MANDATE-BANNED: Tools 'head' and 'tail' have been disabled in this session." -ForegroundColor Green
