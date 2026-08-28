#!/usr/bin/env python3
"""
scripts/dev_server.py -- Lokaler Dev-Server mit Live-Reload fuer DIN-BriefNEO.

Zero-Dependency (nur Python-Stdlib): serviert website/ auf Port 8088,
deaktiviert Caching, und injiziert bei jeder .html-Antwort ein kleines
Polling-Skript, das automatisch neu laedt, sobald sich irgendeine Datei
in website/ aendert -- kein manueller Server-Neustart, kein manuelles
Browser-Neuladen noetig waehrend der Entwicklung.

Aufruf: python scripts/dev_server.py
Wird normalerweise von scripts/start.bat aufgerufen, nicht direkt.
"""

import http.server
import os
import socketserver

PORT = 8088
WEBSITE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "website")

RELOAD_SNIPPET = b"""
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
"""


def latest_mtime():
    """Neuester mtime ueber alle Dateien in website/, rekursiv."""
    newest = 0.0
    for root, _dirs, files in os.walk(WEBSITE_DIR):
        for name in files:
            try:
                m = os.path.getmtime(os.path.join(root, name))
                if m > newest:
                    newest = m
            except OSError:
                continue
    return newest


class LiveReloadHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEBSITE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/__livereload"):
            body = str(latest_mtime()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        local_path = self.translate_path(self.path)
        if os.path.isdir(local_path):
            local_path = os.path.join(local_path, "index.html")

        if local_path.endswith(".html") and os.path.isfile(local_path):
            with open(local_path, "rb") as f:
                content = f.read()
            if b"</body>" in content:
                content = content.replace(b"</body>", RELOAD_SNIPPET + b"</body>", 1)
            else:
                content += RELOAD_SNIPPET
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        super().do_GET()


def main():
    with socketserver.TCPServer(("", PORT), LiveReloadHandler) as httpd:
        print(f"[dev_server] Live-Reload-Server laeuft auf http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
