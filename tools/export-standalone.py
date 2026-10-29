"""Package the production site into a single HTML file that works offline."""
from pathlib import Path
import base64
import json
import mimetypes
import re
import sys

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
output = Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / "Blue-Catch.html"
cache = {}


def data_uri(url):
    if url not in cache:
        path = dist / url.lstrip("/")
        mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
        cache[url] = f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()
    return cache[url]


html = (dist / "index.html").read_text()
css_link = re.search(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', html)
css = (dist / css_link[1].lstrip("/")).read_text()
css = re.sub(r'url\([\'"]?([^\)\'\"]+)[\'"]?\)', lambda m: f'url("{data_uri(m[1])}")', css)
html = html.replace(css_link[0], f"<style>{css}</style>")

script_link = re.search(r'<script[^>]*src="([^"]+)"[^>]*></script>', html)
script = (dist / script_link[1].lstrip("/")).read_text()
# Vite emits the photographic motion atlas as a cacheable asset. Embed any image
# URL constants in the compiled module so canvas actions also work offline.
script = re.sub(r'''(["'])(/assets/[^"'\s]+\.(?:png|webp|svg))\1''',
                lambda m: json.dumps(data_uri(m[2])), script)
pages = [data_uri(f"/originals/page-{i:02}.webp") for i in range(1, 24)]
script = "window.__BLUE_CATCH_PAGES__=" + json.dumps(pages) + ";\n" + script
# Keep the compiled module deferred, after HTML parsing just like Vite's entry.
html = html.replace(script_link[0], '<script type="module">' + script.replace('</script', '<\\/script') + '</script>')


def inline_attribute(match):
    prefix, url = match[1], match[2]
    return prefix + data_uri(url) + '"' if (dist / url.lstrip("/")).is_file() else match[0]


html = re.sub(r'((?:src|href|data-image)=")(/[^\"]+)"', inline_attribute, html)
output.write_text(html)
print(f"Exported {output} ({output.stat().st_size / 1024 / 1024:.1f} MB)")
