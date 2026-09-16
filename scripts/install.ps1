<#>
.SYNOPSIS
    Obsidian 配置包一键安装脚本

.DESCRIPTION
    将配置文件复制到指定的 Vault 目录

.PARAMETER VaultPath
    目标 Vault 的绝对路径

.PARAMETER Backup
    是否备份现有配置（默认 $true）

.EXAMPLE
    .\install.ps1 -VaultPath "D:\MyVault"
    .\install.ps1 -VaultPath "D:\MyVault" -Backup $false
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$VaultPath,

    [Parameter(Mandatory=$false)]
    [bool]$Backup = $true
)

$ConfigRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent
$SourceObsidian = Join-Path $ConfigRoot ".obsidian"
$TargetObsidian = Join-Path $VaultPath ".obsidian"

Write-Host "=== Obsidian 配置包安装脚本 ===" -ForegroundColor Cyan
Write-Host "源配置目录: $SourceObsidian" -ForegroundColor Gray
Write-Host "目标 Vault: $VaultPath" -ForegroundColor Gray
Write-Host ""

# 检查源目录
if (-not (Test-Path $SourceObsidian)) {
    Write-Error "源配置目录不存在: $SourceObsidian"
    exit 1
}

# 检查目标 Vault
if (-not (Test-Path $VaultPath)) {
    Write-Error "目标 Vault 路径不存在: $VaultPath"
    exit 1
}

if (-not (Test-Path (Join-Path $VaultPath ".obsidian"))) {
    Write-Warning "目标 Vault 中未找到 .obsidian 文件夹，将创建新的"
}

# 备份现有配置
if ($Backup -and (Test-Path $TargetObsidian)) {
    $BackupDir = Join-Path $VaultPath ".obsidian.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Write-Host "备份现有配置到: $BackupDir" -ForegroundColor Yellow
    Copy-Item -Path $TargetObsidian -Destination $BackupDir -Recurse -Force
    Write-Host "备份完成" -ForegroundColor Green
}

# 复制配置文件
$FilesToCopy = @(
    "appearance.json",
    "community-plugins.json",
    "core-plugins.json",
    "hotkeys.json",
    "graph.json"
)

Write-Host "`n复制核心配置文件..." -ForegroundColor Cyan
foreach ($file in $FilesToCopy) {
    $src = Join-Path $SourceObsidian $file
    $dst = Join-Path $TargetObsidian $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Warning "  ✗ $file (源文件不存在)"
    }
}

# 复制 CSS 片段
Write-Host "`n复制 CSS 片段..." -ForegroundColor Cyan
$SnippetsSrc = Join-Path $SourceObsidian "snippets"
$SnippetsDst = Join-Path $TargetObsidian "snippets"
if (Test-Path $SnippetsSrc) {
    if (-not (Test-Path $SnippetsDst)) {
        New-Item -ItemType Directory -Path $SnippetsDst -Force | Out-Null
    }
    Get-ChildItem $SnippetsSrc -Filter "*.css" | ForEach-Object {
        Copy-Item $_.FullName -Destination (Join-Path $SnippetsDst $_.Name) -Force
        Write-Host "  ✓ $($_.Name)" -ForegroundColor Green
    }
}

# 复制插件配置
Write-Host "`n复制插件配置..." -ForegroundColor Cyan
$PluginsSrc = Join-Path $SourceObsidian "plugins"
$PluginsDst = Join-Path $TargetObsidian "plugins"

# 自研插件：整体复制（含本体 main.js / styles.css / manifest.json）
# 其余插件本体按惯例不入库，只恢复 data.json，本体需重装
$OwnPlugins = @("toolbar-pin-toggle", "reading-rail-sidebar")

if (Test-Path $PluginsSrc) {
    if (-not (Test-Path $PluginsDst)) {
        New-Item -ItemType Directory -Path $PluginsDst -Force | Out-Null
    }

    foreach ($name in $OwnPlugins) {
        $src = Join-Path $PluginsSrc $name
        if (Test-Path $src) {
            $dst = Join-Path $PluginsDst $name
            if (-not (Test-Path $dst)) {
                New-Item -ItemType Directory -Path $dst -Force | Out-Null
            }
            Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force
            Write-Host "  ✓ $name/ (自研插件，含本体)" -ForegroundColor Green
        } else {
            Write-Warning "  ✗ $name (仓库里没有这个自研插件)"
        }
    }

    Get-ChildItem $PluginsSrc -Directory | ForEach-Object {
        $PluginName = $_.Name
        if ($OwnPlugins -contains $PluginName) { return }
        $SrcData = Join-Path $_.FullName "data.json"
        $DstDir = Join-Path $PluginsDst $PluginName
        $DstData = Join-Path $DstDir "data.json"
        if (Test-Path $SrcData) {
            if (-not (Test-Path $DstDir)) {
                New-Item -ItemType Directory -Path $DstDir -Force | Out-Null
            }
            Copy-Item -Path $SrcData -Destination $DstData -Force
            Write-Host "  ✓ $PluginName/data.json" -ForegroundColor Green
        }
    }
}

# 复制模板
Write-Host "`n复制模板..." -ForegroundColor Cyan
$TemplatesSrc = Join-Path $ConfigRoot "templates"
$TemplatesDst = Join-Path $VaultPath "templates"
if (Test-Path $TemplatesSrc) {
    if (-not (Test-Path $TemplatesDst)) {
        New-Item -ItemType Directory -Path $TemplatesDst -Force | Out-Null
    }
    Get-ChildItem $TemplatesSrc -Filter "*.md" | ForEach-Object {
        Copy-Item $_.FullName -Destination (Join-Path $TemplatesDst $_.Name) -Force
        Write-Host "  ✓ $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`n=== 安装完成 ====" -ForegroundColor Cyan
Write-Host "请执行以下步骤：" -ForegroundColor Yellow
Write-Host "1. 重启 Obsidian"
Write-Host "2. 设置 → 外观 → 主题 → 选择 Border"
Write-Host "3. 设置 → 外观 → CSS 代码片段 → 刷新 → 勾选 9 个片段（启用清单见 appearance.json）"
Write-Host "4. 设置 → 社区插件 → 确认 20 个插件已启用（crisp 系列需先经 BRAT 安装；两个自研插件已随脚本装好）"
Write-Host "5. 设置 → Style Settings → 确认配色（灰青蓝：浅 #5A7F9A / 深 #6B9FE8，深色背景 #0A0E1A）"
Write-Host "6. Flexplorer / Crisp File Explorer 的设置不含在仓库里，按 docs/plugins.md 手动补设"
Write-Host "7. 填入 GLM API / Crisp 激活码 / ASR Key"
Write-Host "8. 重启 Obsidian 验证"
Write-Host ""