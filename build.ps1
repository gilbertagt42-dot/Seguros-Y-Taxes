# ---------------------------------------------------------------------------
# build.ps1 — sincroniza el encabezado y el pie (_partials) en todas las páginas.
#
# Uso:  powershell -ExecutionPolicy Bypass -File .\build.ps1
#
# Cómo funciona:
#   1. Si la página tiene los marcadores <!-- @@HEADER@@ --> / <!-- @@FOOTER@@ -->,
#      los sustituye por el contenido de los parciales.
#   2. Si ya fueron sustituidos (no hay marcadores), localiza el bloque actual
#      del encabezado (topbar … scrim) y del pie (footer … main.js) y lo
#      reemplaza por la versión actualizada. Así puedes editar los parciales
#      y volver a ejecutar el script cuantas veces quieras.
#
# Siempre lee y escribe en UTF-8 sin BOM.
# ---------------------------------------------------------------------------
$root   = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8   = New-Object System.Text.UTF8Encoding($false)
$header = ([System.IO.File]::ReadAllText("$root\_partials\header.html", [System.Text.Encoding]::UTF8)).TrimEnd()
$footer = ([System.IO.File]::ReadAllText("$root\_partials\footer.html", [System.Text.Encoding]::UTF8)).TrimEnd()

$headerBlock = '(?s)  <div class="topbar">.*?<div class="scrim" id="scrim"[^>]*></div>'
$footerBlock = '(?s)  <footer class="footer">.*?<script src="assets/js/main\.js"></script>'

Get-ChildItem $root -Filter *.html | ForEach-Object {
  $path    = $_.FullName
  $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  $before  = $content

  if ($content.Contains('<!-- @@HEADER@@ -->')) {
    $content = $content.Replace('<!-- @@HEADER@@ -->', $header)
  } elseif ([regex]::IsMatch($content, $headerBlock)) {
    $content = [regex]::Replace($content, $headerBlock, { param($m) $header })
  }

  if ($content.Contains('<!-- @@FOOTER@@ -->')) {
    $content = $content.Replace('<!-- @@FOOTER@@ -->', $footer)
  } elseif ([regex]::IsMatch($content, $footerBlock)) {
    $content = [regex]::Replace($content, $footerBlock, { param($m) $footer })
  }

  if ($content -ne $before) {
    [System.IO.File]::WriteAllText($path, $content, $utf8)
    Write-Host ("actualizado: " + $_.Name)
  }
}
Write-Host "Listo."
