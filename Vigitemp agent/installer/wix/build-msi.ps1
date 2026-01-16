param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message)
    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$stamp] $Message"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$agentRoot = Resolve-Path (Join-Path $scriptDir "..\\..")
$agentProjectRoot = Join-Path $agentRoot "Vigitemp agent"
$buildOutput = Join-Path (Join-Path $agentProjectRoot "bin") $Configuration
$wxsMain = Join-Path $scriptDir "VigitempAgent.wxs"
$harvestFile = Join-Path $scriptDir "Harvest.wxs"
$outDir = Join-Path $scriptDir "out"
$outMsi = Join-Path $outDir "VigitempAgent.msi"

if (-not (Test-Path $buildOutput)) {
    throw "Build output introuvable: $buildOutput"
}

if (-not (Get-Command wix -ErrorAction SilentlyContinue)) {
    throw "WiX v4 introuvable. Installez-le avec: dotnet tool install --global wix"
}

New-Item -Path $outDir -ItemType Directory -Force | Out-Null

function Ensure-WixExtension {
    param([string]$ExtensionId)
    $list = wix extension list 2>$null
    if ($list -match [regex]::Escape($ExtensionId)) {
        return
    }

    $wixVersion = (wix --version).Split("+")[0].Trim()
    $extRef = "{0}/{1}" -f $ExtensionId, $wixVersion
    Write-Log "Ajout extension WiX: $extRef"
    & wix extension add -g $extRef | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Echec installation extension WiX: $extRef"
    }
}

Ensure-WixExtension "WixToolset.UI.wixext"
Ensure-WixExtension "WixToolset.Util.wixext"

Write-Log "Generation de Harvest.wxs..."
$files = Get-ChildItem -Path $buildOutput -Recurse -File | Sort-Object FullName
$dirs = Get-ChildItem -Path $buildOutput -Recurse -Directory | Sort-Object FullName
$dirMap = @{}
$dirIndex = 0

$relRoot = $buildOutput.TrimEnd("\") + "\"
foreach ($dir in $dirs) {
    $rel = $dir.FullName.Substring($relRoot.Length)
    $dirIndex++
    $dirMap[$rel] = "DIR_$dirIndex"
}

$components = New-Object System.Collections.Generic.List[string]
$fileIndex = 0

function Get-DirId {
    param([string]$relDir)
    if ([string]::IsNullOrWhiteSpace($relDir)) {
        return "INSTALLFOLDER"
    }
    return $dirMap[$relDir]
}

$tree = @{}
foreach ($dir in $dirs) {
    $rel = $dir.FullName.Substring($relRoot.Length)
    $parts = $rel -split "\\\\"
    $node = $tree
    foreach ($part in $parts) {
        if (-not $node.ContainsKey($part)) {
            $node[$part] = @{}
        }
        $node = $node[$part]
    }
}

function Render-DirTree {
    param(
        [hashtable]$Node,
        [string]$BaseRel,
        [int]$Indent
    )
    $pad = " " * $Indent
    $lines = New-Object System.Collections.Generic.List[string]
    foreach ($name in $Node.Keys) {
        $rel = if ([string]::IsNullOrWhiteSpace($BaseRel)) { $name } else { "$BaseRel\\$name" }
        $dirId = $dirMap[$rel]
        $lines.Add("$pad<Directory Id=`"$dirId`" Name=`"$name`">")
        $childLines = Render-DirTree -Node $Node[$name] -BaseRel $rel -Indent ($Indent + 2)
        if ($childLines.Count -gt 0) {
            $lines.AddRange($childLines)
        }
        $lines.Add("$pad</Directory>")
    }
    return $lines
}

$dirTreeXml = Render-DirTree -Node $tree -BaseRel "" -Indent 4

$dirRefBlocks = @{}
foreach ($dir in $dirs) {
    $rel = $dir.FullName.Substring($relRoot.Length)
    $dirId = $dirMap[$rel]
    $dirRefBlocks[$dirId] = New-Object System.Collections.Generic.List[string]
}
$dirRefBlocks["INSTALLFOLDER"] = New-Object System.Collections.Generic.List[string]

foreach ($file in $files) {
    $fileIndex++
    $rel = $file.FullName.Substring($relRoot.Length)
    $relDir = [System.IO.Path]::GetDirectoryName($rel)
    $dirId = Get-DirId -relDir $relDir
    $compId = "cmp_$fileIndex"
    $fileId = "fil_$fileIndex"
    $source = "$buildOutput\\$rel"
    $component = @"
<Component Id="$compId" Guid="*">
  <File Id="$fileId" Source="$source" KeyPath="yes" />
</Component>
"@
    $dirRefBlocks[$dirId].Add($component)
    $components.Add("<ComponentRef Id=`"$compId`" />")
}

$dirRefXml = New-Object System.Collections.Generic.List[string]
foreach ($kvp in $dirRefBlocks.GetEnumerator()) {
    if ($kvp.Value.Count -eq 0) {
        continue
    }
    $dirRefXml.Add("<DirectoryRef Id=`"$($kvp.Key)`">")
    $dirRefXml.AddRange($kvp.Value)
    $dirRefXml.Add("</DirectoryRef>")
}

$harvestContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://wixtoolset.org/schemas/v4/wxs">
  <Fragment>
    <DirectoryRef Id="INSTALLFOLDER">
$(($dirTreeXml -join "`n"))
    </DirectoryRef>
  </Fragment>
  <Fragment>
    $($dirRefXml -join "`n")
  </Fragment>
  <Fragment>
    <ComponentGroup Id="AppFiles">
      $($components -join "`n")
    </ComponentGroup>
  </Fragment>
</Wix>
"@

Set-Content -Path $harvestFile -Value $harvestContent -Encoding UTF8

Write-Log "Build MSI..."
wix build "$wxsMain" "$harvestFile" `
    -ext WixToolset.UI.wixext `
    -ext WixToolset.Util.wixext `
    -arch x64 `
    -o "$outMsi"

Write-Log "MSI genere: $outMsi"
