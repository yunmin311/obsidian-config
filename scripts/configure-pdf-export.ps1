#Requires -Version 7.5
<#
Optional, field-only PDF margin configuration. Ordinary install.ps1 never calls this.
Close Obsidian and other configuration writers before Apply or Restore.
Check is read-only. Restore accepts a backup directory returned by Apply.
#>
[CmdletBinding()]
param(
    [string] $VaultPath,
    [ValidateSet('Check', 'Apply', 'Restore')] [string] $Mode = 'Check',
    [string] $BackupPath,
    [string] $ProfilePath
)

function Assert-PdfPlainPath([string] $Path) {
    if (Test-Path -LiteralPath $Path) {
        $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            throw "Refusing linked configuration path: $Path"
        }
    }
}

function Read-PdfProfileState([string] $Path) {
    Assert-PdfPlainPath $Path
    $exists = [IO.File]::Exists($Path)
    $bytes = if ($exists) { [IO.File]::ReadAllBytes($Path) } else { [byte[]]::new(0) }
    $hash = if ($exists) { [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)) } else { 'ABSENT' }
    $data = [ordered]@{}
    if ($exists) {
        $text = [Text.UTF8Encoding]::new($false, $true).GetString($bytes).TrimStart([char]0xFEFF)
        $data = ConvertFrom-Json -InputObject $text -AsHashtable -Depth 100 -ErrorAction Stop
        if ($data -isnot [Collections.IDictionary]) { throw 'Configuration root must be an object.' }
        if ($data.Contains('pdfExportSettings') -and $data.pdfExportSettings -isnot [Collections.IDictionary]) {
            throw 'pdfExportSettings must be an object.'
        }
    }
    [pscustomobject]@{ Existed = $exists; Bytes = $bytes; Hash = $hash; Data = $data }
}

function Assert-PdfProcessProbe([string] $Text, [int] $ExitCode) {
    if ($ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($Text)) {
        throw 'Windows process check failed; refusing to write.'
    }
    $ids = ConvertFrom-Json -InputObject $Text -NoEnumerate -ErrorAction Stop
    if ($ids -isnot [array]) { throw 'Invalid process response; refusing to write.' }
    if ($ids.Count -gt 0) { throw 'Close every Obsidian process before changing configuration.' }
}

function Assert-ObsidianStopped {
    if ($IsWindows) {
        if ([Diagnostics.Process]::GetProcessesByName('Obsidian').Length -gt 0) {
            throw 'Close every Obsidian process before changing configuration.'
        }
        return
    }
    # WSL delegates only the Windows OS process query to Windows PowerShell.
    $windowsShell = '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'
    if (-not [IO.File]::Exists($windowsShell)) {
        throw 'Cannot confirm Windows Obsidian exit; refusing to write.'
    }
    $query = '$ErrorActionPreference="Stop"; ConvertTo-Json -InputObject @([Diagnostics.Process]::GetProcessesByName("Obsidian") | ForEach-Object { $_.Id }) -Compress'
    $output = & $windowsShell -NoProfile -NonInteractive -Command $query
    Assert-PdfProcessProbe ($output -join "`n") $LASTEXITCODE
}

function New-PdfProfileBackup([string] $Vault, $Snapshot) {
    $root = Join-Path $Vault '.obsidian/.print-paper-backups'
    Assert-PdfPlainPath $root
    [IO.Directory]::CreateDirectory($root) | Out-Null
    # Prevent accidentally committing preference snapshots in the notes repository.
    $ignore = Join-Path $root '.gitignore'
    Assert-PdfPlainPath $ignore
    if (-not [IO.File]::Exists($ignore)) {
        $stream = [IO.File]::Open($ignore, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write)
        try { $stream.Write([Text.Encoding]::UTF8.GetBytes("*`n")) } finally { $stream.Dispose() }
    }
    $folder = Join-Path $root ((Get-Date -AsUTC -Format 'yyyyMMddTHHmmssfffZ') + '-' + [guid]::NewGuid().ToString('N'))
    [IO.Directory]::CreateDirectory($folder) | Out-Null
    if ($Snapshot.Existed) {
        [IO.File]::WriteAllBytes((Join-Path $folder 'app.json'), $Snapshot.Bytes)
        if ((Get-FileHash -LiteralPath (Join-Path $folder 'app.json')).Hash -ne $Snapshot.Hash) {
            throw 'Backup verification failed; target was not changed.'
        }
    }
    $manifest = [ordered]@{
        schemaVersion = 1; vaultPath = $Vault; appExisted = $Snapshot.Existed
        originalSha256 = $Snapshot.Hash; appliedMargin = '1'
    }
    [IO.File]::WriteAllText((Join-Path $folder 'manifest.json'), ($manifest | ConvertTo-Json -Depth 10))
    $folder
}

function Write-PdfProfileAtomic([string] $Path, $Snapshot, [Collections.IDictionary] $Data) {
    $json = ConvertTo-Json -InputObject $Data -Depth 100
    $temporary = Join-Path ([IO.Path]::GetDirectoryName($Path)) ('.pdf-margin-' + [guid]::NewGuid().ToString('N') + '.tmp')
    try {
        [IO.File]::WriteAllText($temporary, $json + "`n", [Text.UTF8Encoding]::new($false))
        $current = Read-PdfProfileState $Path
        if ($current.Hash -ne $Snapshot.Hash) { throw 'Configuration changed after read; refusing to overwrite.' }
        if ($Snapshot.Existed) {
            [IO.File]::Move($temporary, $Path, $true)
        } else {
            [IO.File]::Move($temporary, $Path)
        }
        $actual = Read-PdfProfileState $Path
        if (($actual.Data | ConvertTo-Json -Depth 100 -Compress) -cne ($Data | ConvertTo-Json -Depth 100 -Compress)) {
            throw 'Post-write verification failed. Keep the backup; do not automatically overwrite current settings.'
        }
    } finally {
        if ([IO.File]::Exists($temporary)) { [IO.File]::Delete($temporary) }
    }
}

function Invoke-PdfExportProfile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [string] $VaultPath,
        [ValidateSet('Check', 'Apply', 'Restore')] [string] $Mode = 'Check',
        [string] $BackupPath,
        [string] $ProfilePath = (Join-Path $PSScriptRoot '../templates/pdf-export-profile.json')
    )
    if (-not [IO.Path]::IsPathFullyQualified($VaultPath)) { throw 'VaultPath must be an absolute path.' }
    $vault = [IO.Path]::TrimEndingDirectorySeparator([IO.Path]::GetFullPath($VaultPath))
    $config = Join-Path $vault '.obsidian'
    if (-not [IO.Directory]::Exists($config)) { throw 'Vault .obsidian directory does not exist.' }
    Assert-PdfPlainPath $vault
    Assert-PdfPlainPath $config
    $profile = Get-Content -LiteralPath $ProfilePath -Raw -ErrorAction Stop | ConvertFrom-Json -AsHashtable -Depth 10 -ErrorAction Stop
    if ($profile -isnot [Collections.IDictionary] -or
        ($profile.schemaVersion -isnot [long] -and $profile.schemaVersion -isnot [int]) -or $profile.schemaVersion -ne 1 -or
        $profile.pdfExportSettings -isnot [Collections.IDictionary] -or
        $profile.pdfExportSettings.margin -isnot [string] -or $profile.pdfExportSettings.margin -cne '1' -or
        $profile.Count -ne 2 -or $profile.pdfExportSettings.Count -ne 1) {
        throw 'Unsupported PDF profile. Only schemaVersion 1 and margin="1" are allowed.'
    }
    $app = Join-Path $config 'app.json'
    $snapshot = Read-PdfProfileState $app
    $data = $snapshot.Data
    $marginPresent = $data.Contains('pdfExportSettings') -and $data.pdfExportSettings.Contains('margin')
    $alreadyApplied = $marginPresent -and $data.pdfExportSettings.margin -is [string] -and $data.pdfExportSettings.margin -ceq '1'
    if ($Mode -eq 'Check') {
        return [pscustomobject]@{ Mode = $Mode; ChangeRequired = -not $alreadyApplied; VaultPath = $vault; BackupPath = $null }
    }
    Assert-ObsidianStopped
    if ($Mode -eq 'Apply') {
        if ($alreadyApplied) {
            return [pscustomobject]@{ Mode = $Mode; ChangeRequired = $false; VaultPath = $vault; BackupPath = $null }
        }
        $backup = New-PdfProfileBackup $vault $snapshot
        if (-not $data.Contains('pdfExportSettings')) { $data.pdfExportSettings = [ordered]@{} }
        $data.pdfExportSettings.margin = '1'
        Write-PdfProfileAtomic $app $snapshot $data
        return [pscustomobject]@{ Mode = $Mode; ChangeRequired = $true; VaultPath = $vault; BackupPath = $backup }
    }
    if (-not $alreadyApplied) { throw 'Margin is no longer the applied value; refusing automatic restore.' }
    if (-not $BackupPath -or -not [IO.Path]::IsPathFullyQualified($BackupPath)) {
        throw 'Restore requires the absolute BackupPath returned by Apply.'
    }
    Assert-PdfPlainPath $BackupPath
    $manifestPath = Join-Path $BackupPath 'manifest.json'
    Assert-PdfPlainPath $manifestPath
    $manifest = Get-Content -LiteralPath $manifestPath -Raw -ErrorAction Stop | ConvertFrom-Json -AsHashtable -ErrorAction Stop
    if ($manifest -isnot [Collections.IDictionary] -or
        ($manifest.schemaVersion -isnot [long] -and $manifest.schemaVersion -isnot [int]) -or $manifest.schemaVersion -ne 1 -or
        $manifest.vaultPath -cne $vault -or $manifest.appExisted -isnot [bool] -or $manifest.appliedMargin -cne '1') {
        throw 'Unsupported backup or backup belongs to a different vault.'
    }
    $original = Read-PdfProfileState (Join-Path $BackupPath 'app.json')
    if ($original.Existed -ne $manifest.appExisted -or $original.Hash -cne $manifest.originalSha256) {
        throw 'Original backup is missing or corrupt.'
    }
    if ($original.Data.Contains('pdfExportSettings') -and $original.Data.pdfExportSettings.Contains('margin')) {
        $data.pdfExportSettings.margin = $original.Data.pdfExportSettings.margin
    } else {
        $data.pdfExportSettings.Remove('margin') | Out-Null
    }
    Write-PdfProfileAtomic $app $snapshot $data
    [pscustomobject]@{ Mode = $Mode; ChangeRequired = $true; VaultPath = $vault; BackupPath = $BackupPath }
}

if ($MyInvocation.InvocationName -ne '.') {
    try {
        if (-not $VaultPath) { throw 'Supply -VaultPath <absolute vault path>.' }
        $arguments = @{ VaultPath = $VaultPath; Mode = $Mode }
        if ($BackupPath) { $arguments.BackupPath = $BackupPath }
        if ($ProfilePath) { $arguments.ProfilePath = $ProfilePath }
        Invoke-PdfExportProfile @arguments | ConvertTo-Json -Depth 10
    } catch {
        Write-Error $_
        exit 1
    }
}
