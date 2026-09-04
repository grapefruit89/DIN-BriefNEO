# scripts/dev_server.ps1
#
# Live-Reload-Webserver fuer DIN-BriefNEO (Port 8088).
# Reines PowerShell + .NET (System.Net.HttpListener) -- kein Python, kein
# Node.js, keine externe Abhaengigkeit. Windows PowerShell 5.1 (im OS
# eingebaut) reicht aus.
#
# Wird von scripts/start.bat aufgerufen:
#   powershell -ExecutionPolicy Bypass -File scripts\dev_server.ps1
# Dadurch KEIN Execution-Policy-Prompt beim Start (gleiches Muster wie
# start.ps1 selbst, siehe README.md/AGENTS.md).
#
# Injiziert bei jeder .html-Antwort ein kleines Polling-Skript, das die
# Seite automatisch neu laedt, sobald sich irgendeine Datei in website/
# geaendert hat -- kein manueller Server-Neustart, kein manuelles
# Browser-Neuladen waehrend der Entwicklung noetig.
#
# Getestet unter PowerShell Core (pwsh) via die Linux-Bridge-VM dieser
# Session (Server hochgefahren, per curl gegen echte HTTP-Requests
# geprueft: Injection, /__livereload, Cache-Header, Content-Types,
# Directory-Traversal-Schutz, 404, / -> index.html -- alle 8 Checks
# gruen). Nicht live unter Windows PowerShell 5.1 getestet, da diese
# Bridge kein Windows hat -- bitte einmal bei dir gegenchecken.

$ErrorActionPreference = "Stop"

$Port = 8088
$WebsiteDir = Join-Path (Split-Path -Parent $PSScriptRoot) "website"

$ReloadSnippet = @"
<script>
(function () {
  var lastMtime = null;
  function poll() {
    fetch('/__livereload')
      .then(function (r) { return r.text(); })
      .then(function (mtime) {
        if (lastMtime === null) {
          lastMtime = mtime;
        } else if (mtime !== lastMtime) {
          location.reload();
        }
      })
      .catch(function () { /* Server kurz weg (z.B. Neustart) -- einfach weiter pollen */ })
      .finally(function () { setTimeout(poll, 700); });
  }
  poll();
})();
</script>
"@

$MimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".svg"   = "image/svg+xml"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".ico"   = "image/x-icon"
    ".woff2" = "font/woff2"
    ".woff"  = "font/woff"
}

function Get-LatestMtimeTicks {
    $newest = Get-ChildItem -Path $WebsiteDir -Recurse -File |
        Measure-Object -Property LastWriteTimeUtc -Maximum
    if ($null -eq $newest.Maximum) { return "0" }
    return $newest.Maximum.Ticks.ToString()
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    Write-Error "Konnte Port $Port nicht oeffnen (evtl. schon belegt?): $_"
    exit 1
}

Write-Host "[dev_server] Live-Reload-Server laeuft auf http://localhost:$Port" -ForegroundColor Green

$WebsiteDirFull = [IO.Path]::GetFullPath($WebsiteDir)

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            $response.Headers.Add("Pragma", "no-cache")
            $response.Headers.Add("Expires", "0")

            $urlPath = $request.Url.AbsolutePath

            if ($urlPath -eq "/__livereload") {
                $body = [Text.Encoding]::UTF8.GetBytes((Get-LatestMtimeTicks))
                $response.ContentType = "text/plain"
                $response.ContentLength64 = $body.Length
                $response.OutputStream.Write($body, 0, $body.Length)
                continue
            }

            if ($urlPath -eq "/") { $urlPath = "/index.html" }

            $relative = $urlPath.TrimStart("/") -replace "/", [IO.Path]::DirectorySeparatorChar
            $localPath = Join-Path $WebsiteDir $relative

            # Sicherheitscheck: Pfad muss innerhalb von website/ bleiben (kein ../-Traversal)
            $resolvedFull = [IO.Path]::GetFullPath($localPath)
            $isInsideWebsite = $resolvedFull.StartsWith($WebsiteDirFull, [StringComparison]::OrdinalIgnoreCase)

            if (-not $isInsideWebsite -or -not (Test-Path -LiteralPath $resolvedFull -PathType Leaf)) {
                $response.StatusCode = 404
                $notFound = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $notFound.Length
                $response.OutputStream.Write($notFound, 0, $notFound.Length)
                continue
            }

            $ext = [IO.Path]::GetExtension($resolvedFull).ToLowerInvariant()

            if ($ext -eq ".html") {
                $content = [IO.File]::ReadAllText($resolvedFull, [Text.Encoding]::UTF8)
                if ($content -match [regex]::Escape("</body>")) {
                    $content = $content -replace [regex]::Escape("</body>"), ($ReloadSnippet + "</body>")
                } else {
                    $content += $ReloadSnippet
                }
                $bytes = [Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $bytes = [IO.File]::ReadAllBytes($resolvedFull)
                $contentType = $MimeTypes[$ext]
                if (-not $contentType) { $contentType = "application/octet-stream" }
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } catch {
            Write-Host "[dev_server] Fehler bei $($request.Url): $_" -ForegroundColor Yellow
            try { $response.StatusCode = 500 } catch {}
        } finally {
            $response.OutputStream.Close()
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
