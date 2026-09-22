<#
.SYNOPSIS
    把插件源码仓库同步进 vault（以及可选的 config 仓库），单向。

.DESCRIPTION
    自研插件的源码唯一真身在 E:\1project\<id>-obsidian\，
    它有三个下游副本：

      1. vault 的 .obsidian\plugins\<id>\        —— 运行副本，Reload 后生效
      2. config 仓库的 .obsidian\plugins\<id>\   —— 备份副本，换机器时一份恢复全部
      3. demo vault 的 .obsidian\plugins\<id>\   —— 截图 / 演示用（_scratch\plugin-demo-vault）

    改完源码跑一次本脚本，三个副本一起更新，不用手工 cp。
    同步方向是单向的（源码 → 下游），避免两边打架。

    ⚠️ 改伴随模块（i18n.js / locales.js / sponsor.js）后，必须先重跑打包器
    （_scratch\_i18n\bundle-inline.js）把改动内联进 main.js，再跑本脚本；
    否则改的只是「可读源码」，Obsidian 加载的 main.js 里还是旧副本。

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

# 同步目标（下游副本）。顺序无关。
#   vault  : 主运行仓库，qy 日常用
#   config : 配置备份副本，换机器时一份恢复全部
#   demo   : 截图 / 演示用的独立 vault（在 _scratch 下，不属于任何仓库）
#
# ⚠️ 为什么 demo 也要进这个脚本：它曾经是手工 cp 出来的，
#    结果主 vault 修好后 demo 里还是旧版，qy 一打开就报「插件加载失败」，
#    排查了半天才发现是副本没跟着走。**凡是「Obsidian 会加载的插件副本」，
#    都应该由这一个脚本统一推送，不要再手工复制。**
$demoVault = "E:\1project\_scratch\plugin-demo-vault"

# 源码仓库目录名 → vault 里的插件目录名（= manifest.json 里的 id）
# 两者刻意不同名：仓库用 <id>-obsidian 后缀（沿用 zheng-tally-obsidian 的先例），
# vault 目录必须严格等于 id，否则 Obsidian 不认。
$map = [ordered]@{
    "quiet-shelf-obsidian"          = "quiet-shelf"
    "reading-rail-sidebar-obsidian" = "reading-rail-sidebar"
    "toolbar-pin-toggle-obsidian"   = "toolbar-pin-toggle"
    "dense-reading-obsidian"        = "dense-reading"
    "paper-desk-obsidian"           = "paper-desk"
}
# 注：ym-homepage 曾在这里，2026-09-22 合并进 paper-desk 后已移除。
#    那个插件只存在了一天、从未发布，vault 里三个副本也一并按上面 §「清理」删掉了。

# 插件本体。前三个是核心三件套，styles.css 不是每个插件都有 —— 没有就跳过，不是错误。
#
# ⚠️ 关于后面的伴随模块（i18n.js / locales.js / sponsor.js）：
#   Obsidian 注入给插件的 require 是**白名单函数**（只有 obsidian 和 @codemirror|@lezer），
#   `require("./i18n")` 会返回 undefined 并让插件加载失败。
#   所以 main.js 里已把这三个模块**内联**进同一词法作用域（打包器 _scratch/_i18n/bundle-inline.js），
#   main.js 本身是自足的。
#   这里仍然复制它们，是因为它们同时是**可读的源码真身**（改它们 → 重跑打包器 → 再跑本脚本），
#   列全一点没有代价：不存在的会被逐个跳过。
$files = @(
    "main.js",
    "manifest.json",
    "styles.css",
    # 多语言与赞助区块（四个自研插件共用同一套文件名）
    "i18n.js",
    "locales.js",
    "sponsor.js"
)

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

# 下游副本清单。vault 是运行副本（必须有）；
# config 是备份副本（可能整个不存在，比如在别的机器上只 clone 了 config 仓库
# —— 那就不写它，只同步 vault，不报错）；
# demo 是截图/演示用的独立 vault（可能不存在，同理跳过）。
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
if ($demoVault) {
    $demoPlugins = Join-Path $demoVault ".obsidian\plugins"
    if (Test-Path (Join-Path $demoVault ".obsidian")) {
        $destRoots += [pscustomobject]@{ Label = "demo"; Path = $demoPlugins }
    } else {
        Write-Warning "跳过 demo 同步：$demoVault 不是 vault"
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

    # 源码里已删掉、副本里还留着的 .js 要一并清掉，否则会留下一个永远不会被用到的
    # 幽灵文件，下次查「为什么改了没生效」时极难发现。
    # 只碰我们自己管理的那几个名字 + 任何 *.js，data.json 一律不动。
    if (-not $DryRun) {
        $managed = $files
        foreach ($dst in $destRoots) {
            $dstDir = Join-Path $dst.Path $t.Id
            foreach ($stale in (Get-ChildItem $dstDir -File -ErrorAction SilentlyContinue)) {
                $keep = ($toCopy -contains $stale.Name) -or ($stale.Name -eq "data.json")
                if ($keep) { continue }
                if ($managed -contains $stale.Name -or $stale.Extension -eq ".js") {
                    Remove-Item $stale.FullName -Force
                    $report += "清理:$($stale.Name)"
                }
            }
        }
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
    Write-Host "!! 以下文件各副本不一致，需复查：" -ForegroundColor Red
    $drift | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    exit 2
} elseif (-not $DryRun) {
    Write-Host "校验：源码 / 各下游副本逐字节一致 ✓" -ForegroundColor Green
}
if (-not $DryRun) {
    Write-Host "去 Obsidian 里执行 Ctrl+P → Reload app without saving 生效。" -ForegroundColor Gray
}
