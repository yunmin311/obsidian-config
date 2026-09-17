<#
.SYNOPSIS
    把插件源码仓库同步进 vault（以及可选的 config 仓库），单向。

.DESCRIPTION
    自研插件的源码唯一真身在 E:\1project\<id>-obsidian\，
    它有两个下游副本：

      1. vault 的 .obsidian\plugins\<id>\   —— 运行副本，Reload 后生效
      2. config 仓库的 .obsidian\plugins\<id>\ —— 备份副本，换机器时一份恢复全部

    改完源码跑一次本脚本，两个副本一起更新，不用手工 cp 三处。
    同步方向是单向的（源码 → 下游），避免两边打架。

.PARAMETER VaultPath
    目标 vault 根目录。

.PARAMETER ConfigPath
    配置仓库根目录。传空字符串则跳过 config 同步。

.PARAMETER SrcRoot
    插件源码仓库所在的项目根。

.PARAMETER PluginId
    只同步指定插件（可传多个）。省略则同步全部。

.PARAMETER DryRun
    只打印将要做什么，不实际复制。

.EXAMPLE
    .\sync-plugins.ps1
    .\sync-plugins.ps1 -PluginId reading-rail-sidebar
    .\sync-plugins.ps1 -DryRun
    .\sync-plugins.ps1 -ConfigPath ""      # 只更新 vault
#>
[CmdletBinding()]
param(
    [string]$VaultPath  = "E:\1obsidian\Obsidian Vault",
    [string]$ConfigPath = "E:\1project\obsidian-config",
    [string]$SrcRoot    = "E:\1project",
    [string[]]$PluginId,
    [switch]$DryRun
)

# 源码仓库目录名 → vault 里的插件目录名（= manifest.json 里的 id）
# 两者刻意不同名：仓库用 <id>-obsidian 后缀（沿用 zheng-tally-obsidian 的先例），
# vault 目录必须严格等于 id，否则 Obsidian 不认。
$map = [ordered]@{
    "quiet-shelf-obsidian"          = "quiet-shelf"
    "reading-rail-sidebar-obsidian" = "reading-rail-sidebar"
    "toolbar-pin-toggle-obsidian"   = "toolbar-pin-toggle"
}

# 插件本体三件套。styles.css 不是每个插件都有 —— 没有就跳过，不是错误。
$files = @("main.js", "manifest.json", "styles.css")

# 试运行开关。刻意不叫 WhatIf：那是 [CmdletBinding()] 的保留参数名，
# 用它当普通变量名会让脚本在 param 之后静默退出（踩过：日志一片空白查了半天）。
$DryRun = $PSBoundParameters.ContainsKey("DryRun")

# zheng-tally 走 TypeScript 构建，产物在 dist/ 里，单独处理。
$builtMap = [ordered]@{
    "zheng-tally-obsidian" = @{ id = "zheng-tally"; from = "dist" }
}

$vaultPlugins = Join-Path $VaultPath ".obsidian\plugins"
if (-not (Test-Path $vaultPlugins)) {
    Write-Error "找不到 vault 插件目录：$vaultPlugins"
    exit 1
}

# 下游副本清单。第一个是运行副本（必须有），第二个是备份副本（可能整个不存在，
# 比如在别的机器上只 clone 了 config 仓库 —— 那就不写它，只同步 vault，不报错）。
$destRoots = @(
    [pscustomobject]@{ Label = "vault";  Path = $vaultPlugins }
)
if ($ConfigPath) {
    $configPlugins = Join-Path $ConfigPath ".obsidian\plugins"
    if (Test-Path (Join-Path $ConfigPath ".git")) {
        $destRoots += [pscustomobject]@{ Label = "config"; Path = $configPlugins }
    } else {
        Write-Warning "跳过 config 同步：$ConfigPath 不是 git 仓库"
    }
}

$targets = @()
foreach ($repo in $map.Keys) {
    $id = $map[$repo]
    if ($PluginId -and ($PluginId -notcontains $id)) { continue }
    $targets += [pscustomobject]@{ Repo = $repo; Id = $id; From = "." }
}
foreach ($repo in $builtMap.Keys) {
    $info = $builtMap[$repo]
    if ($PluginId -and ($PluginId -notcontains $info.id)) { continue }
    $targets += [pscustomobject]@{ Repo = $repo; Id = $info.id; From = $info.from }
}

if (-not $targets.Count) {
    Write-Warning "没有匹配的插件。可用的 id：$(($map.Values + $builtMap.Values.id) -join ', ')"
    exit 0
}

$ok = 0
$skipped = 0

foreach ($t in $targets) {
    $srcDir = Join-Path (Join-Path $SrcRoot $t.Repo) $t.From

    if (-not (Test-Path $srcDir)) {
        Write-Warning "跳过 $($t.Id)：源码目录不存在 $srcDir"
        $skipped++
        continue
    }

    # 装之前先确认 manifest 的 id 与目录名一致 —— Obsidian 靠这个对应，
    # 对不上插件会装上但加载不了，且报错很难懂。
    $manifestPath = Join-Path $srcDir "manifest.json"
    if (Test-Path $manifestPath) {
        $manifestId = (Get-Content $manifestPath -Raw | ConvertFrom-Json).id
        if ($manifestId -ne $t.Id) {
            Write-Warning "跳过 $($t.Id)：manifest 里的 id 是 '$manifestId'，与目标目录名不符"
            $skipped++
            continue
        }
    } else {
        Write-Warning "跳过 $($t.Id)：$srcDir 下没有 manifest.json"
        $skipped++
        continue
    }

    # 先数一遍要复制哪些文件（styles.css 可能不存在，跳过不算错误）。
    $toCopy = @()
    foreach ($f in $files) {
        $s = Join-Path $srcDir $f
        if (Test-Path $s) { $toCopy += $f }
    }

    if (-not $toCopy.Count) {
        Write-Warning "跳过 $($t.Id)：没有任何可复制的文件"
        $skipped++
        continue
    }

    $report = @()
    foreach ($dst in $destRoots) {
        $dstDir = Join-Path $dst.Path $t.Id
        if (-not $DryRun) {
            New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
        }

        $size = 0
        foreach ($f in $toCopy) {
            $s = Join-Path $srcDir $f
            if (-not $DryRun) {
                Copy-Item $s $dstDir -Force
                $size += (Get-Item $s).Length
            }
        }
        $report += "$($dst.Label):$($toCopy.Count)件"
    }

    # data.json 不在 $files 里，所以永远不会被覆盖 —— 每个副本的设置各自保留。
    if ($DryRun) {
        Write-Host ("  ??  {0,-26} <- {1,-32} {2}" -f $t.Id, $t.Repo, ($toCopy -join " ")) -ForegroundColor Yellow
    } else {
        Write-Host ("  OK  {0,-26} <- {1,-32} {2}  [{3}]" -f `
            $t.Id, $t.Repo, ($toCopy -join " "), ($report -join " ")) -ForegroundColor Green
    }
    $ok++
}

Write-Host ""

# 复制之外再核一遍「源码 ↔ vault ↔ config」是否逐字节一致。
# 手工 cp 过、或改了源码忘了跑脚本时，这里会立刻暴露。
function Get-FileHashOrNull($p) {
    if (Test-Path $p) { return (Get-FileHash $p -Algorithm SHA256).Hash }
    return $null
}

$drift = @()
foreach ($t in $targets) {
    $srcDir = Join-Path (Join-Path $SrcRoot $t.Repo) $t.From
    if (-not (Test-Path $srcDir)) { continue }
    foreach ($f in $files) {
        $srcFile = Join-Path $srcDir $f
        if (-not (Test-Path $srcFile)) { continue }
        $srcHash = (Get-FileHash $srcFile -Algorithm SHA256).Hash
        foreach ($dst in $destRoots) {
            $dstFile = Join-Path (Join-Path $dst.Path $t.Id) $f
            $dstHash = Get-FileHashOrNull $dstFile
            if ($dstHash -ne $srcHash) {
                $drift += "$($t.Id)/$f  [$($dst.Label)]"
            }
        }
    }
}

Write-Host "同步完成：$ok 个插件，跳过 $skipped 个。" -ForegroundColor Cyan
if ($destRoots.Count -gt 1) {
    Write-Host "下游副本：$(($destRoots | ForEach-Object { $_.Label }) -join ' + ')" -ForegroundColor Gray
}
if ($drift.Count) {
    Write-Host ""
    Write-Host "!! 以下文件三处不一致，需复查：" -ForegroundColor Red
    $drift | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    exit 2
} elseif (-not $DryRun) {
    Write-Host "校验：源码 / vault / config 逐字节一致 ✓" -ForegroundColor Green
}
if (-not $DryRun) {
    Write-Host "去 Obsidian 里执行 Ctrl+P → Reload app without saving 生效。" -ForegroundColor Gray
}
