<#
.SYNOPSIS
    把插件源码仓库同步进 Obsidian vault（源码仓库 → vault，单向）。

.DESCRIPTION
    自研插件的源码唯一真身在 E:\1project\<id>-obsidian\，
    vault 里的 .obsidian\plugins\<id>\ 只是运行副本。
    改完源码跑一次本脚本，再去 Obsidian 里 Reload 即可，不用手工 cp 两处。

    同步方向是单向的：vault → 源码仓库的操作（比如反着抄）不会被自动做，
    避免两边打架。

.PARAMETER VaultPath
    目标 vault 根目录。

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
#>
[CmdletBinding()]
param(
    [string]$VaultPath = "E:\1obsidian\Obsidian Vault",
    [string]$SrcRoot   = "E:\1project",
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
    $dstDir = Join-Path $vaultPlugins $t.Id

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

    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
    }

    $copied = @()
    foreach ($f in $files) {
        $s = Join-Path $srcDir $f
        if (-not (Test-Path $s)) { continue }
        if ($DryRun) {
            $copied += $f
        } else {
            Copy-Item $s $dstDir -Force
            $copied += "$f($([math]::Round((Get-Item $s).Length/1KB,1))KB)"
        }
    }

    if ($copied.Count) {
        Write-Host ("  OK  {0,-26} <- {1,-32} {2}" -f $t.Id, $t.Repo, ($copied -join " ")) -ForegroundColor Green
        $ok++
    } else {
        Write-Warning "跳过 $($t.Id)：没有任何可复制的文件"
        $skipped++
    }
}

Write-Host ""
Write-Host "同步完成：$ok 个插件，跳过 $skipped 个。" -ForegroundColor Cyan
if (-not $DryRun) {
    Write-Host "去 Obsidian 里执行 Ctrl+P → Reload app without saving 生效。" -ForegroundColor Gray
}
