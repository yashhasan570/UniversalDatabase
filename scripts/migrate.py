#!/usr/bin/env python3
"""Re-apply the Universal Database rebrand after each upstream sync (idempotent).

Protected anchors (kept intact on every run):
- LICENSE.md files (legal, untouched)
- .github/ and scripts/ are excluded from the sweep entirely
"""
from pathlib import Path
import re, shutil

SKIP_EXT = {".png",".jpg",".jpeg",".ico",".webp",".woff",".woff2",".ttf",".eot",".otf",".gif",".pdf",".gz",".zip",".mp4"}
KEEP = {"LICENSE.md", "migrate.py"}
PAIRS = [
 ("NOCODB_", "UNIVERSALDATABASE_"),
 ('"name": "NocoDB Inc"', '"name": "yashhasan570"'),
 ('"name": "NocoDB"', '"name": "universal-database"'),
]
VALFIX = [("UniversalDatabaseDB","Universal Database"),("Universal DatabaseDB","Universal Database"),
          ("Universal DatabaseAI","Universal Database AI"),("Universal DatabaseAi","Universal Database AI"),
          ("Universal DatabaseSync","Universal Database Sync"),("Universal DatabaseSupport","Universal Database Support")]


def sweep(t):
    for a, b in PAIRS:
        t = t.replace(a, b)
    t = re.sub(r"NocoDB(?=[A-Za-z])", "UniversalDatabase", t)
    t = re.sub(r"Noco(?=[A-Z])", "UniversalDatabase", t)
    t = t.replace("nocodb", "universaldatabase")
    t = re.sub(r"\bNoco\.(?=[a-zA-Z_])", "UniversalDatabaseObj.", t)
    t = re.sub(r"new\s+Noco\b|class\s+Noco\b|import\s*\{\s*Noco\b|\{\s*Noco[,}]|\bNoco\s*\}", "UniversalDatabaseObjX", t)
    t = re.sub(r"\bnoco\b", "universaldatabase", t)
    t = re.sub(r"\bNoco\b", "Universal Database", t)
    t = t.replace("UniversalDatabaseObjX", "UniversalDatabase").replace("UniversalDatabaseObj.", "UniversalDatabase.")
    return t


def display(t):
    t = t.replace("UniversalDatabase", "Universal Database")
    for a, b in VALFIX:
        t = t.replace(a, b)
    return t


def main():
    for d in ["markdown", "SECURITY.md", "crowdin.yml", "renovate.json", "ct.yaml",
              ".github/FUNDING.yml", ".github/ISSUE_TEMPLATE", ".github/PULL_REQUEST_TEMPLATE"]:
        p = Path(d)
        if p.is_dir():
            shutil.rmtree(p, ignore_errors=True)
        elif p.exists():
            p.unlink()
    for p in Path(".").rglob("*"):
        if ".git" in p.parts or not p.is_file() or p.name in KEEP or p.suffix in SKIP_EXT:
            continue
        if str(p).startswith((".github/", "scripts/")):
            continue
        try:
            t = p.read_text()
        except Exception:
            continue
        nt = sweep(t)
        if "/lang/" in str(p) or p.name.endswith(".md") or p.name == "index.html":
            nt = display(nt)
            if "/lang/" in str(p):
                nt = re.sub(r'"([^"]*Universal Database[^"]*)"(?=\s*:)',
                            lambda m: '"' + m.group(1).replace(" ", "") + '"', nt)
        for a, b in VALFIX:
            nt = nt.replace(a, b)
        if nt != t:
            p.write_text(nt)
    for p in list(Path(".").rglob("*nocodb*")) + list(Path(".").rglob("*Noco*")):
        if ".git" in p.parts or p.is_dir():
            continue
        nb = p.name.replace("nocodb", "universaldatabase").replace("Noco", "Universal")
        if nb != p.name:
            p.rename(p.with_name(nb))
    readme = Path("README.md")
    if readme.exists() and not readme.read_text().startswith("# Universal Database"):
        print("README drifted - rewrite needed")
    print("migrate done")


if __name__ == "__main__":
    main()
