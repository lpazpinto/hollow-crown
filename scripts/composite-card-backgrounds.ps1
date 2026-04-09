Param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$bgBase = Join-Path $root 'assets\_raw\pixellab\cards'
$outBase = Join-Path $root 'public\assets\cards'
$targetW = 192
$targetH = 120
$targetRatio = [double]$targetW / $targetH

function Get-AlphaBounds([System.Drawing.Bitmap]$bmp) {
  $minX = $bmp.Width
  $minY = $bmp.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      $a = $bmp.GetPixel($x, $y).A
      if ($a -gt 8) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) {
    return [System.Drawing.Rectangle]::new(0, 0, $bmp.Width, $bmp.Height)
  }

  return [System.Drawing.Rectangle]::new($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
}

function Draw-BgCover([System.Drawing.Graphics]$g, [System.Drawing.Bitmap]$bg) {
  $srcRatio = [double]$bg.Width / $bg.Height
  if ($srcRatio -gt $targetRatio) {
    $cropH = $bg.Height
    $cropW = [int]([Math]::Round($cropH * $targetRatio))
    $cropX = [int](($bg.Width - $cropW) / 2)
    $cropY = 0
  } else {
    $cropW = $bg.Width
    $cropH = [int]([Math]::Round($cropW / $targetRatio))
    $cropX = 0
    $cropY = [int](($bg.Height - $cropH) / 2)
  }

  $srcRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)
  $dstRect = [System.Drawing.Rectangle]::new(0, 0, $targetW, $targetH)
  $g.DrawImage($bg, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

$map = @(
  @{ bg = 'background forest covered.png'; fg = 'art-golden-shield.png'; out = 'art-golden-shield.png'; h = 84; yOffset = 4 },
  @{ bg = 'background royal tree.png'; fg = 'art-unicorn-strike.png'; out = 'art-unicorn-strike.png'; h = 98; yOffset = 3 },
  @{ bg = 'background forest.png'; fg = 'art-charge.png'; out = 'art-charge.png'; h = 82; yOffset = 5 },
  @{ bg = 'background flower field.png'; fg = 'art-crown-diamonds.png'; out = 'art-crown-diamonds.png'; h = 88; yOffset = 4 }
)

$backupDir = Join-Path $outBase 'backup-before-bg-composite'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

foreach ($item in $map) {
  $bgPath = Join-Path $bgBase $item.bg
  $fgPath = Join-Path $outBase $item.fg
  $outPath = Join-Path $outBase $item.out
  $tmpOutPath = "$outPath.tmp.png"

  Copy-Item $fgPath (Join-Path $backupDir $item.fg) -Force

  $bgBmp = [System.Drawing.Bitmap]::new($bgPath)
  $fgBmp = [System.Drawing.Bitmap]::new($fgPath)
  try {
    $canvas = [System.Drawing.Bitmap]::new($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      Draw-BgCover $g $bgBmp

      $bounds = Get-AlphaBounds $fgBmp
      $dstH = [int]$item.h
      $dstW = [int]([double]$bounds.Width / $bounds.Height * $dstH)
      if ($dstW -gt 122) {
        $dstW = 122
        $dstH = [int](122 * $bounds.Height / $bounds.Width)
      }
      $dstX = [int](($targetW - $dstW) / 2)
      $dstY = [int]($targetH - $dstH - $item.yOffset)
      $dstRect = [System.Drawing.Rectangle]::new($dstX, $dstY, $dstW, $dstH)

      $g.DrawImage($fgBmp, $dstRect, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
      if (Test-Path $tmpOutPath) {
        Remove-Item $tmpOutPath -Force
      }
      $canvas.Save($tmpOutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $g.Dispose()
      $canvas.Dispose()
    }
  } finally {
    $bgBmp.Dispose()
    $fgBmp.Dispose()
  }

  Move-Item -Force $tmpOutPath $outPath

  Write-Output ("composited {0} with {1}" -f $item.out, $item.bg)
}

foreach ($item in $map) {
  $p = Join-Path $outBase $item.out
  $bmp = [System.Drawing.Bitmap]::new($p)
  try {
    Write-Output ("{0} => {1}x{2}" -f $item.out, $bmp.Width, $bmp.Height)
  } finally {
    $bmp.Dispose()
  }
}