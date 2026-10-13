"""Genera conocimiento.txt (texto plano del sitio) para que Castanha responda con los datos reales del viaje.
Uso: python3 knowledge.py   (correr después de cada cambio del sitio, junto con build.py)
"""
import asyncio, pathlib
from playwright.async_api import async_playwright

async def main():
    path = pathlib.Path("index.html").resolve().as_uri()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto(path)
        await pg.wait_for_timeout(800)
        txt = await pg.evaluate("""()=>{
          document.querySelectorAll("details").forEach(d=>d.open=true);document.querySelectorAll("section [hidden]").forEach(e=>e.hidden=false);
          const g=id=>{const e=document.getElementById(id);return e?e.innerText.trim():""};
          return "ITINERARIO:\\n"+g("roteiro")+"\\n\\nHISTORIAS (episodios de Castanha y Caju):\\n"+g("historias")+"\\n\\nCOMIDA Y AUTO:\\n"+g("comer")+"\\n\\nCOSTOS:\\n"+g("costos");
        }""")
        await b.close()
    pathlib.Path("conocimiento.txt").write_text(txt, encoding="utf-8")
    print(len(txt), "caracteres")

asyncio.run(main())
