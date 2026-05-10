# backup-supabase.ps1
# Royal Ledger -- Weekly Supabase Backup Script (Windows / PowerShell)
#
# HOW TO RUN:
#   1. Copy this file to $HOME\scripts\backup-supabase.ps1
#   2. Open PowerShell
#   3. Run: & "$HOME\scripts\backup-supabase.ps1"
#
# FIRST TIME SETUP (one-time):
#   1. Allow PowerShell scripts to run:
#        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#   2. Store your database password in the pgpass file so it is not in this script:
#        $pgpassDir = "$env:APPDATA\postgresql"
#        New-Item -ItemType Directory -Path $pgpassDir -Force | Out-Null
#        Set-Content -Path "$pgpassDir\pgpass.conf" -Value "aws-0-eu-west-1.pooler.supabase.com:5432:postgres:postgres.wcylrbfczdmofxrxffrg:YOUR-DB-PASSWORD" -Encoding UTF8
#
# REQUIREMENTS:
#   - pg_dump installed and in PATH (comes with PostgreSQL client tools)
#   - pgpass.conf created (see FIRST TIME SETUP above)

# ---- CONFIGURATION -- edit BACKUP_DIR if you want a different folder --------
$PROJECT_REF = "wcylrbfczdmofxrxffrg"
$PG_HOST     = "aws-0-eu-west-1.pooler.supabase.com"
$PG_PORT     = "5432"
$PG_USER     = "postgres.wcylrbfczdmofxrxffrg"
$PG_DB       = "postgres"
$BACKUP_DIR  = "$HOME\RoyalLedger-Backups"
# ------------------------------------------------------------------------------

# ---- Generate ISO week-based filename (e.g. 2026-W19-royal-ledger-full.sql) -
$culture  = [System.Globalization.CultureInfo]::InvariantCulture
$weekNum  = $culture.Calendar.GetWeekOfYear(
    (Get-Date),
    [System.Globalization.CalendarWeekRule]::FirstFourDayWeek,
    [System.DayOfWeek]::Monday
)
$year     = (Get-Date).Year
$filename = "$year-W$($weekNum.ToString('00'))-royal-ledger-full.sql"
$filepath = Join-Path $BACKUP_DIR $filename
# ------------------------------------------------------------------------------

Write-Host ""
Write-Host "Royal Ledger -- Supabase Backup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Project ref : $PROJECT_REF"
Write-Host "Output file : $filepath"
Write-Host ""

# ---- Create backup directory if it doesn't exist yet ------------------------
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "Created backup directory: $BACKUP_DIR" -ForegroundColor Yellow
}

# ---- Check that pg_dump is installed and reachable --------------------------
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: pg_dump not found in PATH." -ForegroundColor Red
    Write-Host "Install PostgreSQL client tools from: https://www.postgresql.org/download/windows/"
    Write-Host "Select only 'Command Line Tools' during install."
    Write-Host "Then add C:\Program Files\PostgreSQL\18\bin to your PATH and restart PowerShell."
    exit 1
}

# ---- Check that pgpass.conf exists (password file) --------------------------
$pgpassFile = "$env:APPDATA\postgresql\pgpass.conf"
if (-not (Test-Path $pgpassFile)) {
    Write-Host "ERROR: pgpass.conf not found at: $pgpassFile" -ForegroundColor Red
    Write-Host "Create it with your database password (see FIRST TIME SETUP in this script)."
    exit 1
}

# ---- Check if a backup for this week already exists -------------------------
if (Test-Path $filepath) {
    Write-Host "Note: A backup for this week already exists at:" -ForegroundColor Yellow
    Write-Host "  $filepath"
    Write-Host ""
    $overwrite = Read-Host "Overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Aborted. Existing backup kept."
        exit 0
    }
}

# ---- Run the database dump --------------------------------------------------
Write-Host "Running backup..." -ForegroundColor Yellow
pg_dump -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DB -f $filepath

# ---- Check that the dump command succeeded ----------------------------------
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Backup failed (exit code $LASTEXITCODE)." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common causes:"
    Write-Host "  - Wrong password  -> update pgpass.conf at: $pgpassFile"
    Write-Host "  - Password reset  -> update pgpass.conf to match new password"
    Write-Host "  - Project paused  -> unpause at supabase.com (free plan auto-pauses after 1 week idle)"
    Write-Host "  - Network issue   -> check internet connection and try again"
    exit 1
}

# ---- Verify the output file exists and is not suspiciously small ------------
if (-not (Test-Path $filepath)) {
    Write-Host "ERROR: Backup file was not created even though the command reported success." -ForegroundColor Red
    Write-Host "This is unusual. Check your disk space and try again."
    exit 1
}

$fileSize   = (Get-Item $filepath).Length
$fileSizeKB = [math]::Round($fileSize / 1KB, 1)

if ($fileSize -lt 500) {
    Write-Host ""
    Write-Host "WARNING: Backup file is only $fileSize bytes -- this is suspiciously small." -ForegroundColor Yellow
    Write-Host "Open the file in a text editor and confirm it contains real SQL."
    Write-Host "It may indicate an empty database or a connection issue."
}

# ---- Success ----------------------------------------------------------------
Write-Host ""
Write-Host "Backup complete!" -ForegroundColor Green
Write-Host "  File : $filename"
Write-Host "  Size : $fileSizeKB KB"
Write-Host "  Path : $filepath"
Write-Host ""
Write-Host "Next step: upload to Google Drive" -ForegroundColor Yellow
Write-Host "  1. Open Google Drive in your browser"
Write-Host "  2. Navigate to the 'RoyalLedger Backups' folder (create it if it doesn't exist yet)"
Write-Host "  3. Drag this file into it:"
Write-Host "     $filepath"
Write-Host ""

# ---- Remind to prune old local backups --------------------------------------
Write-Host "Also: delete any local backups older than 8 weeks." -ForegroundColor Yellow
Write-Host "Your local backups folder: $BACKUP_DIR"
Write-Host ""
Write-Host "Done. See you next Friday." -ForegroundColor Cyan
Write-Host ""
