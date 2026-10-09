#!/usr/bin/env python3
"""http.server with HTTP Range support (needed for video seeking) and no-cache for data.json."""
import os, re, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
ROOT = os.path.dirname(os.path.abspath(__file__))
class H(SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def end_headers(s):
        s.send_header("Accept-Ranges", "bytes")
        if s.path.split("?")[0].endswith((".json", ".html", "/")): s.send_header("Cache-Control", "no-store")
        super().end_headers()
    def send_head(s):
        rng = s.headers.get("Range")
        path = s.translate_path(s.path)
        if not rng or not os.path.isfile(path): return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)$", rng.strip())
        size = os.path.getsize(path)
        if not m or (not m[1] and not m[2]): return super().send_head()
        if m[1]: a = int(m[1]); b = int(m[2]) if m[2] else size - 1
        else: a = max(0, size - int(m[2])); b = size - 1
        b = min(b, size - 1)
        if a > b:
            s.send_error(416); return None
        f = open(path, "rb"); f.seek(a)
        s.send_response(206)
        s.send_header("Content-Type", s.guess_type(path))
        s.send_header("Content-Range", f"bytes {a}-{b}/{size}")
        s.send_header("Content-Length", str(b - a + 1))
        s.end_headers()
        s._left = b - a + 1
        return f
    def copyfile(s, src, dst):
        left = getattr(s, "_left", None)
        if left is None: return super().copyfile(src, dst)
        while left > 0:
            d = src.read(min(65536, left))
            if not d: break
            dst.write(d); left -= len(d)
if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
