<#
.SYNOPSIS
    给四个自研插件仓库设置 GitHub 的 About（描述 / 官网 / topics）。

.DESCRIPTION
    About 有三块内容，各有各的用途：

      1. Description —— 仓库列表页和搜索结果里显示的一行字。
         也是别人在 GitHub 上搜到你的第一印象。
      2. Homepage —— 右侧 About 区的链接。四个仓库统一指向 releases/latest：
         用户一步就能拿到三件套，也是插件市场装不上时的兜底安装路径。
      3. Topics —— 可被 GitHub 搜索命中的标签。Obsidian 插件生态里
         `obsidian` / `obsidian-plugin` 是通用标签，用户会按这个筛。

    Description 与 manifest.json 的 description 刻意【同源不同措辞】：
    manifest 那条要在 250 字符内、必须以动作开头（官方市场硬要求）；
    About 这条没有字符限制，可以说得更完整、读起来更像一句话。
    官方目录的 community-plugins.json 抓的是 manifest.json，不抓 About，
    所以两边措辞不同不会导致审核问题 —— 但语义要一致。

    本脚本【幂等】：topics 是先清空再全量加，重复跑结果相同，不会越攒越多。

.ENVIRONMENT
    ⚠️ 两个坑，都在 Windows + 非登录 shell 下出现：

    1. gh 把 token 存在 Windows keyring，靠 APPDATA 环境变量定位配置。
       某些环境（Git Bash 上直接跑、沙箱）里 APPDATA 是空的，gh 会误报
       "not logged in" —— **这不是凭据问题**。补 APPDATA 即可。

    2. 调 gh.exe 时别写 `2>$null` 或 `| ForEach-Object` —— 对原生可执行文件
       PowerShell 会报「无法在管道中间运行文档」。直接 `& $gh @args` 调用，
       用 $LASTEXITCODE 判成败。

.PARAMETER GhPath
    gh.exe 的完整路径。默认自动探测常见安装位置 + PATH。
    （实测沙箱环境的 PowerShell 吞掉了子进程输出，那种情况下改用 Git Bash 跑。）

.PARAMETER DryRun
    只打印将要执行的命令，不实际调用 gh。

.EXAMPLE
    .\set-repo-about.ps1 -DryRun
    .\set-repo-about.ps1
    .\set-repo-about.ps1 -GhPath "C:\Program Files\GitHub CLI\gh.exe"
#>
[CmdletBinding()]
param(
    [string]$GhPath,
    [switch]$DryRun
)

$DryRun = $PSBoundParameters.ContainsKey("DryRun")

# gh 在 Windows 上把 token 存进 keyring，且【依赖 APPDATA 环境变量】去找配置。
# 从 Git Bash / 某些沙箱环境跑时 APPDATA 可能是空的，gh 就会误报 "not logged in" ——
# 这不是凭据问题，是找不到配置文件。补一句 $env:APPDATA 即可。
if (-not $env:APPDATA) {
    $env:APPDATA = Join-Path $env:USERPROFILE "AppData\Roaming"
}

# gh 未必在 PATH 上（比如从非登录 shell 跑）。自己找一遍，
# 免得报"术语 'gh' 不会被识别"这种与真实问题无关的错。
$GhExe = "gh"
if ($GhPath) {
    $GhExe = $GhPath
} else {
    # ⚠️ 不能用 Join-Path 硬拼这几条：某些环境下 $env:ProgramFiles 是 null
    # （实测沙箱 PowerShell），Join-Path 会直接抛「自变量为 null」而不是跳过。
    # 所以先过滤掉空值再拼。
    $bases = @(
        $env:ProgramFiles,
        ${env:ProgramFiles(x86)},
        (Join-Path $env:LOCALAPPDATA "Programs")
    ) | Where-Object { $_ }

    foreach ($b in $bases) {
        $c = Join-Path $b "GitHub CLI\gh.exe"
        if (Test-Path $c) { $GhExe = $c; break }
    }
}

# 判定：能作为路径找到，或在 PATH 上能找到命令，都算可用。
$resolved = $null
if (Test-Path $GhExe) {
    $resolved = $GhExe
} else {
    $cmd = Get-Command $GhExe -ErrorAction SilentlyContinue
    if ($cmd) { $resolved = $cmd.Source }
}
if (-not $resolved) {
    Write-Error ("找不到 gh.exe（试过 '$GhExe'）。" +
        "装了 GitHub CLI 的话用 -GhPath 指定完整路径，" +
        '例如 -GhPath "C:\Program Files\GitHub CLI\gh.exe"。')
    exit 1
}
$GhExe = $resolved

$owner = "yunmin311"

# 每个仓库：About 描述 / Homepage / topics
#
# Homepage 统一指向 releases/latest —— 与 zheng-tally 既有值一致。
# 不要填仓库自身地址（自我链接对访问者毫无用处）；
# 指向 Release 页能让用户一步拿到三件套，也是市场装不成功时的兜底安装路径。
$repos = [ordered]@{

    "quiet-shelf-obsidian" = @{
        Description = "Hide archived and index notes from the Obsidian file explorer without moving them, and focus the tree on one set of folders at a time."
        Homepage    = "https://github.com/yunmin311/quiet-shelf-obsidian/releases/latest"
        Topics      = @(
            "obsidian", "obsidian-plugin", "markdown",
            "file-explorer", "note-organization", "focus-mode", "productivity"
        )
    }

    "reading-rail-sidebar-obsidian" = @{
        Description = "Reading progress in the Obsidian sidebar: percentage, live heading outline, scroll-to-heading, and a density rail that shows where the text is thick."
        Homepage    = "https://github.com/yunmin311/reading-rail-sidebar-obsidian/releases/latest"
        Topics      = @(
            "obsidian", "obsidian-plugin", "markdown",
            "reading-progress", "outline", "sidebar", "productivity"
        )
    }

    "toolbar-pin-toggle-obsidian" = @{
        Description = "Pin either toolbar in Obsidian with one hotkey: keep the mobile-style bottom toolbar on, or stop the top toolbar from hiding while you read."
        Homepage    = "https://github.com/yunmin311/toolbar-pin-toggle-obsidian/releases/latest"
        Topics      = @(
            "obsidian", "obsidian-plugin",
            "toolbar", "hotkeys", "ui", "productivity"
        )
    }

    # zheng-tally 的 About 是既有资产，2026-09-17 已核对过内容良好（8 个 topics）。
    # 这里保留它的原值，只作为「其他三个的写法参照」列在脚本里 —— 重跑本脚本不会改变它。
    "zheng-tally-obsidian" = @{
        Description = "A native-feeling Zheng (正) tally counter for Obsidian. Count stroke by stroke inline, commit a plain-text tally, and resume it later."
        Homepage    = "https://github.com/yunmin311/zheng-tally-obsidian/releases/latest"
        Topics      = @(
            "obsidian", "obsidian-plugin", "markdown", "productivity",
            "tally-counter", "zheng", "chinese", "typescript"
        )
    }
}

# GitHub 的 topics 有硬约束，违反会被 API 拒：
#   - 只能用小写字母、数字、连字符
#   - 最长 50 字符
#   - 每个仓库最多 20 个
function Assert-TopicValid($repo, $topics) {
    if ($topics.Count -gt 20) { throw "$repo：topics 超过 20 个" }
    foreach ($t in $topics) {
        if ($t -cne $t.ToLower()) { throw "$repo：topic '$t' 含大写，GitHub 只接受小写" }
        if ($t -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') { throw "$repo：topic '$t' 含非法字符（只允许小写字母/数字/连字符）" }
        if ($t.Length -gt 50) { throw "$repo：topic '$t' 超过 50 字符" }
    }
}

Write-Host "开始设置 $($repos.Count) 个仓库的 About" -ForegroundColor Cyan
Write-Host ""

$failed = @()

foreach ($repo in $repos.Keys) {
    $info = $repos[$repo]
    Assert-TopicValid $repo $info.Topics

    Write-Host "── $repo" -ForegroundColor White
    Write-Host "   desc: $($info.Description)" -ForegroundColor Gray
    Write-Host "   home: $($info.Homepage)" -ForegroundColor Gray
    Write-Host "   tags: $($info.Topics -join ', ')" -ForegroundColor Gray

    if ($DryRun) {
        Write-Host "   [DryRun] 跳过实际调用" -ForegroundColor Yellow
        Write-Host ""
        continue
    }

    # ── 调用 gh 的三个硬注意事项（全是实测踩出来的）──
    #
    # ① 不要把 --remove-topic 和 --add-topic 放在【同一次调用】里。
    #    实测：这样会把 topics 全部清空（remove 先生效，add 被忽略），
    #    跑完 repositoryTopics 变成 null，而命令的退出码是 0 —— 静默失败。
    #    正确做法是分两次调用：先只改 description/homepage（+ 需要时 remove），
    #    再单独一次只做 add-topic。
    #
    # ② 调 gh.exe 时不要写 `2>$null` 或 `| ForEach-Object` —— 对原生可执行文件，
    #    PowerShell 会报「无法在管道中间运行文档」。直接 `& $GhExe @args`。
    #
    # ③ $LASTEXITCODE 在某些沙箱 PowerShell 里拿不到（子进程输出被吞）。
    #    遇到就先验证 gh 能不能跑，不行就换 Git Bash。
    try {
        # 第一步：description + homepage（topics 单独处理）
        & $GhExe repo edit "$owner/$repo" `
            --description $info.Description `
            --homepage $info.Homepage
        if ($LASTEXITCODE -ne 0) { throw "设置 description/homepage 失败，退出码 $LASTEXITCODE" }

        # 第二步：取现有 topics，多余的移除（单独一次调用）
        $existing = @()
        $prev = & $GhExe repo view "$owner/$repo" --json repositoryTopics
        if ($LASTEXITCODE -eq 0 -and $prev) {
            $parsed = $prev | ConvertFrom-Json
            if ($parsed.repositoryTopics) {
                $existing = @($parsed.repositoryTopics | ForEach-Object { $_.name })
            }
        }

        $stale = @($existing | Where-Object { $info.Topics -notcontains $_ })
        if ($stale.Count) {
            $rmArgs = @("repo", "edit", "$owner/$repo")
            foreach ($t in $stale) { $rmArgs += @("--remove-topic", $t) }
            & $GhExe @rmArgs
            if ($LASTEXITCODE -ne 0) { throw "移除过期 topic 失败，退出码 $LASTEXITCODE" }
        }

        # 第三步：单独一次调用，只加 topic。--add-topic 本身是幂等的，
        # 已有的再加不会报错也不会重复。
        $addArgs = @("repo", "edit", "$owner/$repo")
        foreach ($t in $info.Topics) { $addArgs += @("--add-topic", $t) }
        & $GhExe @addArgs
        if ($LASTEXITCODE -ne 0) { throw "添加 topic 失败，退出码 $LASTEXITCODE" }

        # 复核：别信退出码，直接读回来看（上面那个静默清空就是这么发现的）
        $check = & $GhExe repo view "$owner/$repo" --json repositoryTopics -q '[.repositoryTopics[].name] | length'
        $expected = $info.Topics.Count
        if ($check -ne $expected) {
            throw "复核不通过：期望 $expected 个 topic，实际 $check 个"
        }

        Write-Host "   OK  （$check 个 topic 已确认）" -ForegroundColor Green
    } catch {
        Write-Host "   失败：$_" -ForegroundColor Red
        $failed += $repo
    }
    Write-Host ""
}

Write-Host "─────────────────────────────" -ForegroundColor Cyan
if ($failed.Count) {
    Write-Host "失败 $($failed.Count) 个：$($failed -join ', ')" -ForegroundColor Red
    exit 1
} elseif ($DryRun) {
    Write-Host "DryRun 完成，未做任何修改。" -ForegroundColor Yellow
} else {
    Write-Host "全部 $($repos.Count) 个仓库的 About 已设置。" -ForegroundColor Green
    Write-Host "去 https://github.com/$owner 看一眼效果。" -ForegroundColor Gray
}
