#!/usr/bin/env python3
"""Re-apply the Universal Database rebrand after each upstream sync (idempotent).

Protected anchors (kept intact on every run):
- LICENSE.md files (legal, untouched)
- .github/ and scripts/ are excluded from the sweep entirely

Identifier safety: NocoDB/Noco become single-token identifiers
("UniversalDatabase", "universaldatabase") in CODE. Spaced display
wording ("Universal Database") is applied ONLY to user-visible files
(markdown, i18n lang files, index.html).
"""
from pathlib import Path
import re, shutil

SKIP_EXT = {"B.png",".jpg",".jpeg",".ico",".webp",".woff",".woff2",".ttf",".eot",".otf",".gif",".pdf",".gz",".zip",".mp4"}
SKIP_EXT.discard("B.png")
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
    # Identifier-safe token replacements (no spaces: code must stay valid)
    t = re.sub(r"NocoDB(?=[A-Za-z0-9_])", "UniversalDatabase", t)
    t = re.sub(r"\bNocoDB\b", "UniversalDatabase", t)
    t = re.sub(r"\bNoco\.(?=[a-zA-Z_])", "UniversalDatabaseObj.", t)
    t = re.sub(r"new\s+Noco\b|class\s+Noco\b|import\s*\{\s*Noco\b|\{\s*Noco[,}]|\bNoco\s*\}", "UniversalDatabaseObjX", t)
    t = t.replace("nocodb", "universaldatabase")
    t = re.sub(r"\bnoco\b", "universaldatabase", t)
    t = re.sub(r"\bNoco\b", "UniversalDatabase", t)
    t = t.replace("UniversalDatabaseObjX", "UniversalDatabase").replace("UniversalDatabaseObj.", "UniversalDatabase.")
    return t


def display(t):
    t = sweep(t)
    t = t.replace("UniversalDatabase", "Universal Database")
    for a, b in VALFIX:
        t = t.replace(a, b)
    return t


def rename_paths():
    # Files first, then dirs deepest-first so children keep valid paths
    for p in sorted(list(Path(".").rglob("*"))):
        if ".git" in p.parts or p.is_dir():
            continue
        nb = p.name.replace("nocodb", "universaldatabase").replace("Noco", "Universal")
        if nb != p.name:
            p.rename(p.with_name(nb))
    dirs = sorted([p for p in Path(".").rglob("*") if ".git" not in p.parts and p.is_dir()
                   and ("nocodb" in p.name or "Noco" in p.name)],
                  key=lambda p: len(p.parts), reverse=True)
    for p in dirs:
        nb = p.name.replace("nocodb", "universaldatabase").replace("Noco", "Universal")
        if nb != p.name:
            tgt = p.with_name(nb)
            if tgt.exists():
                shutil.rmtree(tgt, ignore_errors=True)
            p.rename(tgt)


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
        if nt != t:
            p.write_text(nt)
    rename_paths()
    readme = Path("README.md")
    if readme.exists() and not readme.read_text().startswith("# Universal Database"):
        print("README drifted - rewrite needed")
    print("migrate done")


if __name__ == "__main__":
    main()
