#!/usr/bin/env pwsh
# .specify/scripts/init-feature.ps1
# Consolidated script to create a new feature and setup its implementation plan.
# Combines logic from create-new-feature.ps1 and setup-plan.ps1.

[CmdletBinding()]
param(
    [switch]$Json,
    [string]$ShortName,
    [Parameter()]
    [int]$Number = 0,
    [switch]$Help,
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$FeatureDescription
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Host "Usage: ./init-feature.ps1 [-Json] [-ShortName <name>] [-Number N] <feature description>"
    Write-Host "Options:"
    Write-Host "  -Json               Output in JSON format"
    Write-Host "  -ShortName <name>   Provide a custom short name for the branch"
    Write-Host "  -Number N           Specify branch number manually"
    exit 0
}

# Load common functions
if (Test-Path "$PSScriptRoot/common.ps1") {
    . "$PSScriptRoot/common.ps1"
} else {
    Write-Error "Error: common.ps1 not found in $PSScriptRoot"
    exit 1
}

# 1. CREATE FEATURE LOGIC
if (-not $FeatureDescription -or $FeatureDescription.Count -eq 0) {
    Write-Error "Error: Feature description required."
    exit 1
}

$featureDesc = ($FeatureDescription -join ' ').Trim()
$repoRoot = (git rev-parse --show-toplevel 2>$null) || $PSScriptRoot

# Determine branch suffix
function Get-BranchSuffix {
    param([string]$Description, [string]$ShortName)
    if ($ShortName) { return $ShortName.ToLower() -replace '[^a-z0-9]', '-' }
    
    $clean = $Description.ToLower() -replace '[^a-z0-9\s]', ' '
    $words = $clean -split '\s+' | Where-Object { $_.Length -ge 3 } | Select-Object -First 3
    return $words -join '-'
}

$branchSuffix = Get-BranchSuffix -Description $featureDesc -ShortName $ShortName

# Determine Number (Simplified for consolidation)
if ($Number -eq 0) {
    $specsDir = Join-Path $repoRoot 'specs'
    $highest = 0
    if (Test-Path $specsDir) {
        Get-ChildItem -Path $specsDir -Directory | ForEach-Object {
            if ($_.Name -match '^(\d+)') {
                $num = [int]$matches[1]
                if ($num -gt $highest) { $highest = $num }
            }
        }
    }
    $Number = $highest + 1
}

$featureNum = ('{0:000}' -f $Number)
$branchName = "$featureNum-$branchSuffix"

# Create Branch
if (git rev-parse --git-dir 2>$null) {
    git checkout -b $branchName 2>$null
    Write-Host "Branch created: $branchName" -ForegroundColor Green
}

# Create Directory and Files
$featureDir = Join-Path $repoRoot "specs/$branchName"
New-Item -ItemType Directory -Path $featureDir -Force | Out-Null

# 2. SETUP PLAN LOGIC (Consolidated)
function Copy-Template {
    param($TemplateName, $DestFile)
    $templatePath = Join-Path $repoRoot ".specify/templates/$TemplateName.md"
    if (Test-Path $templatePath) {
        Copy-Item $templatePath $DestFile -Force
        Write-Host "Initialized $TemplateName: $DestFile" -ForegroundColor Cyan
    } else {
        New-Item -ItemType File -Path $DestFile -Force | Out-Null
        Write-Warning "Template $TemplateName not found, created empty file."
    }
}

Copy-Template -TemplateName "spec-template" -DestFile (Join-Path $featureDir "spec.md")
Copy-Template -TemplateName "plan-template" -DestFile (Join-Path $featureDir "plan.md")

if ($Json) {
    @{ BRANCH=$branchName; DIR=$featureDir } | ConvertTo-Json
} else {
    Write-Host "Feature '$branchName' initialized successfully." -ForegroundColor Green
}
