# safe-write.ps1 - Aviation Grade Backup-Before-Write
param (
    [Parameter(Mandatory=$true)] [string]$FilePath,
    [Parameter(Mandatory=$true)] [string]$Content
)

$file = Get-Item $FilePath
if ($file.Exists) {
    $backupPath = $FilePath + ".old"
    Copy-Item $FilePath $backupPath -Force
    Write-Host "Shadow Backup created: $backupPath"
}

Set-Content -Path $FilePath -Value $Content -Encoding UTF8
Write-Host "File written successfully: $FilePath"

# Basic Integrity Check (Line Count)
$oldLines = (Get-Content $backupPath).Count
$newLines = (Get-Content $FilePath).Count
if ($newLines -lt ($oldLines * 0.5)) {
    Write-Warning "MASSIVE DATA LOSS DETECTED ($newLines vs $oldLines lines)!"
    Write-Warning "Consider restoring from $backupPath"
}
