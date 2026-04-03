"""
Tiny HTTP server running inside the db-backup container.
Accepts POST /trigger → runs backup.sh in a background thread.
Listens on port 8080 (internal Docker network only, never exposed to host).
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import threading
import json

_backup_lock = threading.Lock()


def run_backup():
    with _backup_lock:
        subprocess.run(['/backup.sh'])


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/trigger':
            if _backup_lock.locked():
                body = json.dumps({'detail': 'Backup already in progress.'}).encode()
                status = 409
            else:
                threading.Thread(target=run_backup, daemon=True).start()
                body = json.dumps({'detail': 'Backup started.'}).encode()
                status = 200
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # suppress noisy access logs


if __name__ == '__main__':
    HTTPServer(('0.0.0.0', 8080), Handler).serve_forever()
