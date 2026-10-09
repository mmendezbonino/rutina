"""Marca una versión nueva de la app para que los celulares que la tienen instalada se actualicen.
Uso: python3 release.py            (versión automática con la fecha de hoy)
     python3 release.py 2026.10.20-2
Después: git commit y git push. GitHub Pages publica solo en 1–2 minutos."""
import re, sys, datetime
cur = re.search(r"const VERSION='([^']*)';", open('sw.js').read()).group(1)
if len(sys.argv) > 1:
    ver = sys.argv[1]
else:
    today = datetime.date.today().strftime('%Y.%m.%d')
    n = int(cur.split('-')[1]) + 1 if cur.startswith(today + '-') else 1
    ver = f'{today}-{n}'
for f, pat, rep in [('sw.js', r"const VERSION='[^']*';", f"const VERSION='{ver}';"),
                    ('index.html', r'window\.__APP_VERSION="[^"]*";', f'window.__APP_VERSION="{ver}";')]:
    s = open(f).read(); s2 = re.sub(pat, rep, s)
    assert s != s2 or ver == cur, f'no se encontró la versión en {f}'
    open(f, 'w').write(s2)
print(cur, '->', ver)
