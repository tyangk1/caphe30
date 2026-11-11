# MỘT GIỌT: inbox -> work/clean (Gemini mark removed on full-bleed photos) and work/cut (studio shots, background removed)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$pc = "$env:LOCALAPPDATA\Programs\PhotoCraft\photocraft-cli.exe"
$clean = "$root\work\clean"; $cut = "$root\work\cut"
New-Item -ItemType Directory -Force $clean, $cut | Out-Null
Add-Type -AssemblyName System.Drawing

$full = 'phin-giot','crema','dat-do','m1996','m1998','m2003','m2018','m2026'
$studio = 'nhan-xanh','robusta','arabica','excelsa','catimor','culi','qua-chin','la-ca-phe','nam-dam','nam-vua','phin','goi-xe','ly-sua-da','da'

foreach ($n in $full) {
  $src = "$root\inbox\$n.png"
  $img = [System.Drawing.Image]::FromFile($src); $W = $img.Width; $H = $img.Height; $img.Dispose()
  $p = '{"strokes":[{"points":[[' + ($W-142) + ',' + ($H-112) + '],[' + ($W-82) + ',' + ($H-112) + ']],"size":150,"hardness":60}]}'
  & $pc run $src --cmd paint.remove --params $p --out "$clean\$n.png" | Out-Null
  if ($LASTEXITCODE) { throw "paint.remove failed on $n" }
  "clean $n"
}
foreach ($n in $studio) {
  & $pc run "$root\inbox\$n.png" --cmd layer.removeBackground --params '{"refine":true}' --out "$cut\$n.png" | Out-Null
  if ($LASTEXITCODE) { throw "removeBackground failed on $n" }
  "cut $n"
}
"done"
