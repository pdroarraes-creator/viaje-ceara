"""Arma index.html (cabecera fija + cuerpo del artifact) y news.json para los avisos.

Uso: python3 build.py RUTA/viaje-ceara.html
"""
import json, re, sys

src = open(sys.argv[1], encoding="utf-8").read()
page = open("index.html", encoding="utf-8").read()
head = page[: page.index("<body>\n") + 7]
open("index.html", "w", encoding="utf-8").write(head + src + "\n</body>\n</html>\n")

version = re.search(r'const SITE_VERSION="([^"]+)"', src).group(1)
block = src[src.index("const CHANGES=[") : src.index("];", src.index("const CHANGES=["))]
items = [list(m) for m in re.findall(r'\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)"\]', block)][:3]
json.dump({"version": version, "items": items}, open("news.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(version, items[0])
