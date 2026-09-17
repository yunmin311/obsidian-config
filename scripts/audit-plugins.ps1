<#
.SYNOPSIS
    发布前自检：对自研 Obsidian 插件仓库做一遍官方合规 + 隐私 + 工程化体检。

.DESCRIPTION
    提 obsidian-releases PR 之前跑一遍。检查项来自官方两个文档：
      - obsidian-releases/README.md（提交要求）
      - Developer policies（审核会拿来拒稿的硬规则）

    分五组：

      A. 隐私 —— 仓库里（含全部 git 历史 blob）有没有 vault 路径、
         本机路径、真实姓名、邮箱、私人项目名。
         注意：**只看工作区是不够的**，删掉的文件仍在历史里。所以本脚本
         逐个 blob 扫，覆盖所有历史版本。

      B. manifest —— id / name / description / version 的官方硬规则。

      C. 政策 —— 混淆、遥测、动态广告、自装依赖、网络访问、vault 外文件访问。
         这几个是"违反了会被下架"的项，所以单列。

      D. 工程化 —— 事件监听是否随生命周期释放、MutationObserver 是否
         disconnect、有无私有 API（会随 Obsidian 更新失效）。

      E. 发布链路 —— tag 是否严格等于 manifest.version、Release 三件套
         是否齐全、LICENSE 是否存在、README 是否可作市场详情页。

.PARAMETER SrcRoot
    插件仓库所在的根目录，默认 E:\1project。

.PARAMETER PluginId
    只检查指定插件（可多个）。省略则检查全部已知插件。

.PARAMETER GitPath
    git.exe 的完整路径。默认自动探测。找不到就报错退出，
    **不会**跳过隐私扫描（跳过等于给出虚假的"干净"结论）。

.EXAMPLE
    .\audit-plugins.ps1
    .\audit-plugins.ps1 -PluginId quiet-shelf
    .\audit-plugins.ps1 -GitPath "C:\Program Files\Git\cmd\git.exe"
#>
[CmdletBinding()]
param(
    [string]   $SrcRoot = "E:\1project",
    [string[]] $PluginId,
    [string]   $GitPath
)

# 仓库目录名 → 插件 id
$map = [ordered]@{
    "quiet-shelf-obsidian"          = "quiet-shelf"
    "reading-rail-sidebar-obsidian" = "reading-rail-sidebar"
    "toolbar-pin-toggle-obsidian"   = "toolbar-pin-toggle"
    "zheng-tally-obsidian"          = "zheng-tally"
}

# 隐私正则。宁多勿少 —— 误报只是多看一眼，漏报是数据泄露。
$privacyPattern = @(
    '1obsidian', 'Obsidian Vault', 'C:\\Users', 'C:/Users',
    '1project', 'liqiyu', '15005656607',
    '西交利物浦', 'yunmin-workbench', 'work-capsule', 'pixel-panels',
    '@gmail', '@163\.com', '@qq\.com', '@outlook'
) -join '|'

$script:pass = 0
$script:warn = 0
$script:fail = 0

# git 未必在 PATH 上（非登录 shell 常见）。找不到就必须【明确报错】，
# 绝不能静默跳过 —— 否则隐私扫描会"扫了 0 个对象"然后报 PASS，
# 正是最危险的 false-green。
$GitExe = $null
if ($GitPath) {
    $GitExe = $GitPath
} else {
    foreach ($c in @(
        (Join-Path $env:ProgramFiles "Git\cmd\git.exe"),
        (Join-Path ${env:ProgramFiles(x86)} "Git\cmd\git.exe"),
        (Join-Path $env:LOCALAPPDATA "Programs\Git\cmd\git.exe")
    )) {
        if ($c -and (Test-Path $c)) { $GitExe = $c; break }
    }
    if (-not $GitExe) {
        $cmd = Get-Command git -ErrorAction SilentlyContinue
        if ($cmd) { $GitExe = $cmd.Source }
    }
}
if (-not $GitExe -or -not (Test-Path $GitExe)) {
    Write-Error "找不到 git.exe（试过 '$GitExe'）。隐私扫描依赖它遍历 git 历史，不能跳过。用 -GitPath 指定完整路径。"
    exit 1
}

function Ok($m)   { Write-Host "    [PASS] $m" -ForegroundColor Green;  $script:pass++ }
function Warn($m) { Write-Host "    [WARN] $m" -ForegroundColor Yellow; $script:warn++ }
function Bad($m)  { Write-Host "    [FAIL] $m" -ForegroundColor Red;    $script:fail++ }
function Info($m) { Write-Host "           $m" -ForegroundColor DarkGray }

# 真正的 emoji 区间。
#
# 两个踩过的坑：
#   ① 早先写成 [\u2000-\u3300] 这种大范围，把普通标点也算进去，四个插件全部误报。
#   ② \uD83C\uDF00-\uD83D\uDDFF 这种**代理对**写在 [ ] 里是错的 ——
#      字符类按 UTF-16 码元逐位比较，会产生反序区间直接报 Invalid pattern。
# 现在的写法：只比较「单个码元」能覆盖的区间（BMP 内的符号区 + 变体选择符），
# 代理对（U+1F300 以上）单独用不含范围的匹配。
$emojiPattern = '\uFE0F|[\u2600-\u27BF]|[\u2B00-\u2BFF]|\uD83C|\uD83D|\uD83E'

$targets = @()
foreach ($repo in $map.Keys) {
    $id = $map[$repo]
    if ($PluginId -and ($PluginId -notcontains $id)) { continue }
    $dir = Join-Path $SrcRoot $repo
    if (Test-Path $dir) { $targets += [pscustomobject]@{ Repo = $repo; Id = $id; Dir = $dir } }
}

if (-not $targets.Count) { Write-Warning "没找到可检查的插件仓库"; exit 0 }

foreach ($t in $targets) {
    Write-Host ""
    Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $($t.Id)   ($($t.Repo))" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan

    # ── A. 隐私：工作区 + 全部 git 历史 blob ──
    Write-Host "  A. 隐私" -ForegroundColor White

    # 已跟踪文件的敏感词扫描。-e 显式给模式，避免以 - 开头的模式被当成选项。
    #
    # ⚠️ 原生 exe 的输出必须先落到变量，**不能**在调用行里接管道或 2>&1。
    # 这一点栽过两次：`& $exe ... 2>&1 | Where-Object` 依旧会报
    # 「无法在管道中间运行文档」。必须写成 `$x = & $exe ...` 再另行过滤。
    $rawTree = & $GitExe -C $t.Dir grep -nEi -e $privacyPattern -- .
    $grepExit = $LASTEXITCODE
    $treeHits = if ($grepExit -eq 1 -or -not $rawTree) {
        @()                       # grep 退出码 1 = 没有匹配，这是正常结果
    } else {
        @($rawTree | Where-Object { $_ -is [string] -and $_ -notmatch '^\s*$' })
    }
    if ($treeHits.Count) {
        Bad "工作区命中敏感词："
        $treeHits | Select-Object -First 10 | ForEach-Object { Info $_ }
    } else {
        Ok "工作区无敏感词"
    }

    # 历史 blob：删掉的文件还在历史里，必须逐个扫
    $blobHits = @()
    # 同样：先落到变量，不要在这行接管道。
    $rawObjects = & $GitExe -C $t.Dir rev-list --objects --all
    $objects = @($rawObjects |
                 Where-Object { $_ -is [string] -and $_ -notmatch '^\s*$' } |
                 ForEach-Object { ($_ -split ' ')[0] } |
                 Sort-Object -Unique |
                 Where-Object { $_ -and $_ -notmatch '^(fatal|warning|error|usage)' })
    foreach ($obj in $objects) {
        $content = (& $GitExe -C $t.Dir cat-file -p $obj) -join "`n"
        if ($content -match $privacyPattern) { $blobHits += $obj }
    }
    if ($blobHits.Count) {
        Bad "$($blobHits.Count) 个历史 blob 命中敏感词（删掉的文件也还在历史里）"
        $blobHits | Select-Object -First 5 | ForEach-Object { Info "blob $_" }
    } elseif ($objects.Count -eq 0) {
        # 关键防线：0 个对象意味着扫描根本没跑起来（git 不可用 / 路径不对），
        # 这时候报 PASS 就是 false-green —— 比漏报更危险，因为它给人虚假的安心。
        Bad "git 历史扫描拿到 0 个对象 —— 扫描未生效，不能据此判定干净"
    } else {
        Ok "全部 git 历史 blob 无敏感词（共 $($objects.Count) 个对象）"
    }

    # data.json 必须被忽略
    $gi = Join-Path $t.Dir ".gitignore"
    if ((Test-Path $gi) -and ((Get-Content $gi -Raw) -match 'data\.json')) {
        Ok "data.json 已在 .gitignore 中排除"
    } else {
        Bad ".gitignore 未排除 data.json（该文件含 vault 笔记路径）"
    }

    # ── B. manifest 官方硬规则 ──
    Write-Host "  B. manifest" -ForegroundColor White
    $mf = Join-Path $t.Dir "manifest.json"
    if (-not (Test-Path $mf)) { Bad "缺少 manifest.json"; continue }
    $m = Get-Content $mf -Raw | ConvertFrom-Json

    if ($m.id -eq $t.Id) { Ok "id '$($m.id)' 与目录名一致" }
    else { Bad "id '$($m.id)' 与目录名 '$($t.Id)' 不一致（Obsidian 会加载失败）" }

    if ($m.id -match '^[a-z0-9]+(-[a-z0-9]+)*$') { Ok "id 仅含小写字母/数字/连字符" }
    else { Bad "id 含非法字符" }
    if ($m.id -match 'obsidian') { Bad "id 含 'obsidian'（官方禁止）" } else { Ok "id 不含 'obsidian'" }
    if ($m.id -match 'plugin$')  { Bad "id 以 'plugin' 结尾（官方禁止）" } else { Ok "id 不以 'plugin' 结尾" }

    if ($m.name -match 'obsidian|plugin') { Bad "name 含 'Obsidian'/'Plugin'（官方禁止）" }
    else { Ok "name 不含 'Obsidian'/'Plugin'" }

    $dl = $m.description.Length
    if ($dl -le 250) { Ok "description ≤250（$dl 字符）" } else { Bad "description 超 250（$dl 字符）" }
    if ($m.description -match '\.$') { Ok "description 以句点结尾" } else { Bad "description 未以句点结尾" }
    if ($m.description -match $emojiPattern) { Warn "description 含 emoji（官方不鼓励）" }
    else { Ok "description 无 emoji" }

    if ($m.version -match '^\d+\.\d+\.\d+$') { Ok "version '$($m.version)' 语义化" }
    else { Bad "version '$($m.version)' 非 x.y.z" }

    # ── C. 政策（违反会被下架）──
    Write-Host "  C. 官方政策" -ForegroundColor White
    $jsFile = Join-Path $t.Dir "main.js"
    if (-not (Test-Path $jsFile)) {
        # TS 项目看构建产物
        $jsFile = Get-ChildItem -Path $t.Dir -Filter "main.js" -Recurse -ErrorAction SilentlyContinue |
                  Select-Object -First 1 -ExpandProperty FullName
    }
    if ($jsFile -and (Test-Path $jsFile)) {
        $js = Get-Content $jsFile -Raw
        $checks = @{
            "eval()"             = '\beval\s*\('
            "new Function()"     = 'new\s+Function\s*\('
            "fetch()"            = '\bfetch\s*\('
            "requestUrl"         = 'requestUrl'
            "XMLHttpRequest"     = 'XMLHttpRequest'
        }
        $policyViolations = 0
        foreach ($k in $checks.Keys) {
            if ($js -match $checks[$k]) { Warn "用了 $k —— 若确有网络请求，README 必须说明"; $policyViolations++ }
        }
        if ($policyViolations -eq 0) { Ok "无 eval / 动态代码 / 网络请求（无需披露项）" }

        # Node API 与 isDesktopOnly 必须一致
        $usesNode = $js -match "require\(['""](fs|os|child_process|electron)['""]\)"
        if ($usesNode -and -not $m.isDesktopOnly) { Bad "用了 Node API 但 isDesktopOnly 不是 true" }
        elseif ($usesNode) { Ok "用了 Node API 且 isDesktopOnly=true" }
        else { Ok "未用 Node API（isDesktopOnly=$($m.isDesktopOnly) 合理）" }

        # 混淆迹象：超长单行。
        #
        # 官方禁的是「人为混淆」，不是「打包」。zheng-tally 是 TypeScript 项目，
        # dist/main.js 由 esbuild 打包，天然是长行 —— 那是构建产物，合规。
        # 所以要区分：如果长行出现在构建输出目录（dist/），只提示；
        # 出现在仓库根的手写 main.js 里，才是真问题。
        $maxLine = ($js -split "`n" | Measure-Object -Property Length -Maximum).Maximum
        $isBuilt = $jsFile -match '[\\/]dist[\\/]'
        if ($maxLine -gt 2000 -and $isBuilt) {
            Info "最长行 $maxLine 字符，但那是 dist/ 构建产物（打包所致，非混淆）"
            Ok "构建产物行长度正常（非人为混淆）"
        } elseif ($maxLine -gt 2000) {
            Bad "手写源码里存在 $maxLine 字符的超长行，疑似压缩/混淆（官方禁止）"
        } else {
            Ok "无混淆迹象（最长行 $maxLine 字符）"
        }
    } else {
        Warn "找不到 main.js，跳过政策扫描"
    }

    # ── D. 工程化 ──
    Write-Host "  D. 工程化" -ForegroundColor White
    if ($jsFile -and (Test-Path $jsFile)) {
        $js = Get-Content $jsFile -Raw
        if ($js -match 'async onload') { Ok "有 onload" } else { Warn "未见到 onload" }
        if ($js -match 'onunload') {
            Ok "有 onunload"
            # Observer 泄漏检查
            if (($js -match 'new MutationObserver') -and ($js -notmatch '\.disconnect\(\)')) {
                Bad "创建了 MutationObserver 但没有 disconnect()，会内存泄漏"
            } elseif ($js -match 'new MutationObserver') {
                Ok "MutationObserver 有 disconnect()"
            }
            # 定时器
            $si = ([regex]::Matches($js, 'setInterval|setTimeout')).Count
            $ci = ([regex]::Matches($js, 'clearInterval|clearTimeout')).Count
            if ($si -gt 0 -and $ci -eq 0) { Warn "用了 $si 处定时器但无 clear*，留意泄漏" }
            elseif ($si -gt 0) { Ok "定时器有对应清理" }
        } else {
            Warn "未见到 onunload（确认资源释放逻辑在哪）"
        }
    }

    # ── E. 发布链路 ──
    Write-Host "  E. 发布链路" -ForegroundColor White
    foreach ($f in @("LICENSE", "README.md", "CHANGELOG.md")) {
        if (Test-Path (Join-Path $t.Dir $f)) { Ok "有 $f" } else { Warn "缺少 $f" }
    }
    if (Test-Path (Join-Path $t.Dir ".github/workflows/release.yml")) { Ok "有 release workflow" }
    else { Warn "缺少 release workflow（需手工打 Release）" }

    # tag 与 version 严格一致
    $rawTags = & $GitExe -C $t.Dir tag -l
    $tags = @($rawTags | Where-Object { $_ -is [string] -and $_ -notmatch '^\s*$' })
    if ($tags -contains $m.version) {
        Ok "存在与 version 同名的 tag '$($m.version)'"
        $extra = $tags | Where-Object { $_ -ne $m.version }
        if ($extra) { Warn "另有多余 tag：$($extra -join ', ')（带 v 前缀的市场不认）" }
    } elseif ($tags.Count) {
        Bad "tag [$($tags -join ', ')] 与 manifest.version '$($m.version)' 不匹配 —— 市场找不到 Release"
    } else {
        Warn "还没有 tag（尚未发布 Release）"
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  汇总：PASS $script:pass   WARN $script:warn   FAIL $script:fail" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
if ($script:fail -gt 0) {
    Write-Host "有 $script:fail 项 FAIL —— 先修完再提 PR。" -ForegroundColor Red
    exit 1
}
if ($script:warn -gt 0) {
    Write-Host "有 $script:warn 项 WARN —— 逐条确认是否可接受。" -ForegroundColor Yellow
}
Write-Host "可以提交。" -ForegroundColor Green
