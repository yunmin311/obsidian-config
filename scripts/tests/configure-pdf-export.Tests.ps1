#Requires -Version 7.5
BeforeAll {
    . "$PSScriptRoot/../configure-pdf-export.ps1"
    $script:profile = "$PSScriptRoot/../../templates/pdf-export-profile.json"
}

Describe 'PDF margin opt-in and field-only recovery' {
    BeforeEach {
        $script:vault = Join-Path $TestDrive ([guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory "$vault/.obsidian" | Out-Null
        $script:app = "$vault/.obsidian/app.json"
        $script:original = '{"pdfExportSettings":{"margin":"0","pageSize":"A4","includeName":false,"landscape":true,"downscalePercent":85},"alwaysUpdateLinks":true,"unknown":{"x":42}}'
        [IO.File]::WriteAllText($app, $original)
        Mock Assert-ObsidianStopped {}
    }

    It 'Check reports the change without writing or creating backups' {
        $result = Invoke-PdfExportProfile -VaultPath $vault
        $result.ChangeRequired | Should -BeTrue
        [IO.File]::ReadAllText($app) | Should -BeExactly $original
        Test-Path "$vault/.obsidian/.print-paper-backups" | Should -BeFalse
    }

    It 'Apply preserves every other export and application field' {
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        $actual = Get-Content -Raw $app | ConvertFrom-Json -AsHashtable
        $actual.pdfExportSettings.margin | Should -BeExactly '1'
        $actual.pdfExportSettings.Remove('margin')
        ($actual | ConvertTo-Json -Depth 100 -Compress) | Should -BeExactly '{"pdfExportSettings":{"pageSize":"A4","includeName":false,"landscape":true,"downscalePercent":85},"alwaysUpdateLinks":true,"unknown":{"x":42}}'
        Test-Path "$($result.BackupPath)/manifest.json" | Should -BeTrue
        [IO.File]::ReadAllText("$($result.BackupPath)/app.json") | Should -BeExactly $original
    }

    It 'a second Apply is a byte-identical no-op without a new backup' {
        Invoke-PdfExportProfile -VaultPath $vault -Mode Apply | Out-Null
        $before = (Get-FileHash $app).Hash
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        $result.ChangeRequired | Should -BeFalse
        (Get-FileHash $app).Hash | Should -BeExactly $before
        @(Get-ChildItem "$vault/.obsidian/.print-paper-backups" -Directory).Count | Should -Be 1
    }

    It 'Restore preserves fields added after Apply' {
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        $current = Get-Content -Raw $app | ConvertFrom-Json -AsHashtable
        $current.pdfExportSettings.later = 'keep'
        $current.later = 123
        [IO.File]::WriteAllText($app, ($current | ConvertTo-Json -Depth 100))
        Invoke-PdfExportProfile -VaultPath $vault -Mode Restore -BackupPath $result.BackupPath | Out-Null
        $restored = Get-Content -Raw $app | ConvertFrom-Json -AsHashtable
        $restored.pdfExportSettings.margin | Should -BeExactly '0'
        $restored.pdfExportSettings.later | Should -BeExactly 'keep'
        $restored.later | Should -Be 123
    }

    It 'Restore distinguishes missing margin from explicit null: <state>' -ForEach @(
        @{state='missing'; text='{"pdfExportSettings":{"pageSize":"Letter"}}'; exists=$false},
        @{state='null'; text='{"pdfExportSettings":{"margin":null}}'; exists=$true},
        @{state='missing export object'; text='{"keep":true}'; exists=$false}
    ) {
        [IO.File]::WriteAllText($app, $text)
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        Invoke-PdfExportProfile -VaultPath $vault -Mode Restore -BackupPath $result.BackupPath | Out-Null
        $restored = Get-Content -Raw $app | ConvertFrom-Json -AsHashtable
        $restored.pdfExportSettings.Contains('margin') | Should -Be $exists
        if ($exists) { $restored.pdfExportSettings.margin | Should -BeNullOrEmpty }
    }

    It 'a missing app.json can be initialized and field-only restored' {
        Remove-Item $app
        Invoke-PdfExportProfile -VaultPath $vault | Out-Null
        Test-Path $app | Should -BeFalse
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        Invoke-PdfExportProfile -VaultPath $vault -Mode Restore -BackupPath $result.BackupPath | Out-Null
        (Get-Content -Raw $app | ConvertFrom-Json -AsHashtable).pdfExportSettings.Count | Should -Be 0
    }

    It 'refuses malformed or non-object configuration without replacing it: <text>' -ForEach @(
        @{text='not JSON'}, @{text='[]'}, @{text='null'},
        @{text='{"pdfExportSettings":"wrong"}'}, @{text='{"pdfExportSettings":null}'},
        @{text='{"pdfExportSettings":[]}'}
    ) {
        [IO.File]::WriteAllText($app, $text)
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Apply } | Should -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly $text
    }

    It 'refuses an unknown profile version before any write' {
        $bad = "$vault/profile.json"
        [IO.File]::WriteAllText($bad, '{"schemaVersion":2,"pdfExportSettings":{"margin":"1"}}')
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Apply -ProfilePath $bad } | Should -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly $original
    }

    It 'refuses writes when the application exit check fails' {
        Mock Assert-ObsidianStopped { throw 'Obsidian is running or status is unknown' }
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Apply } | Should -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly $original
        Test-Path "$vault/.obsidian/.print-paper-backups" | Should -BeFalse
    }

    It 'rejects coerced schema versions: <version>' -ForEach @(
        @{version='true'}, @{version='"1"'}
    ) {
        $bad = "$vault/profile.json"
        [IO.File]::WriteAllText($bad, ('{"schemaVersion":' + $version + ',"pdfExportSettings":{"margin":"1"}}'))
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Apply -ProfilePath $bad } | Should -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly $original
    }

    It 'does not write the target when backup creation fails' {
        Mock New-PdfProfileBackup { throw 'disk unavailable' }
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Apply } | Should -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly $original
    }

    It 'rejects a configuration changed since it was read' {
        $snapshot = Read-PdfProfileState $app
        [IO.File]::WriteAllText($app, '{"concurrent":"keep"}')
        { Write-PdfProfileAtomic $app $snapshot @{pdfExportSettings=@{margin='1'}} } | Should -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly '{"concurrent":"keep"}'
    }

    It 'does not restore over a manually changed margin' {
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        [IO.File]::WriteAllText($app, '{"pdfExportSettings":{"margin":"2"}}')
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Restore -BackupPath $result.BackupPath } | Should -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly '{"pdfExportSettings":{"margin":"2"}}'
    }

    It 'rejects a backup belonging to another vault' {
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        $other = "$TestDrive/other"
        New-Item -ItemType Directory "$other/.obsidian" -Force | Out-Null
        [IO.File]::WriteAllText("$other/.obsidian/app.json", '{"pdfExportSettings":{"margin":"1"}}')
        { Invoke-PdfExportProfile -VaultPath $other -Mode Restore -BackupPath $result.BackupPath } | Should -Throw
    }

    It 'rejects a corrupted original backup without changing the target' {
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        [IO.File]::WriteAllText("$($result.BackupPath)/app.json", '{}')
        $before = (Get-FileHash $app).Hash
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Restore -BackupPath $result.BackupPath } | Should -Throw
        (Get-FileHash $app).Hash | Should -BeExactly $before
    }

    It 'Restore also refuses writes when the application check fails' {
        $result = Invoke-PdfExportProfile -VaultPath $vault -Mode Apply
        $before = (Get-FileHash $app).Hash
        Mock Assert-ObsidianStopped { throw 'still running' }
        { Invoke-PdfExportProfile -VaultPath $vault -Mode Restore -BackupPath $result.BackupPath } | Should -Throw
        (Get-FileHash $app).Hash | Should -BeExactly $before
    }

    It 'Check stays read-only without requiring Obsidian to be stopped' {
        Mock Assert-ObsidianStopped { throw 'still running' }
        { Invoke-PdfExportProfile -VaultPath $vault } | Should -Not -Throw
        [IO.File]::ReadAllText($app) | Should -BeExactly $original
    }

    It 'preserves ISO-shaped strings and numeric types in unrelated preferences' {
        [IO.File]::WriteAllText($app, '{"pdfExportSettings":{"margin":"0"},"stamp":"2026-10-20T01:02:03+08:00","id":"0007","flag":false,"number":123.25}')
        Invoke-PdfExportProfile -VaultPath $vault -Mode Apply | Out-Null
        $restored = Get-Content -Raw $app | ConvertFrom-Json -AsHashtable -DateKind String
        $restored.stamp | Should -BeOfType ([string])
        $restored.stamp | Should -BeExactly '2026-10-20T01:02:03+08:00'
        $restored.id | Should -BeExactly '0007'
        $restored.flag | Should -BeFalse
        $restored.number | Should -Be 123.25
    }

    It 'accepts an explicit empty process array, not a blank or failed probe' {
        { Assert-PdfProcessProbe '[]' 0 } | Should -Not -Throw
        { Assert-PdfProcessProbe '' 0 } | Should -Throw
        { Assert-PdfProcessProbe '[]' 1 } | Should -Throw
        { Assert-PdfProcessProbe '[123]' 0 } | Should -Throw
        { Assert-PdfProcessProbe 'null' 0 } | Should -Throw
        { Assert-PdfProcessProbe '{}' 0 } | Should -Throw
    }
}
