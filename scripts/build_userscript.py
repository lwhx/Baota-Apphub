#!/usr/bin/env python3
"""Build/check the self-contained userscript; no runtime remote resources."""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "userscripts/src/baota-external-categories.js"
OUTPUT = ROOT / "userscripts/baota-external-categories.user.js"


def build():
    groups = json.loads((ROOT / "userscripts/default-groups.json").read_text())
    if not isinstance(groups, list) or len(groups) > 100:
        raise ValueError("Expected at most 100 custom groups")
    names = {json.loads(p.read_text())["appname"] for p in (ROOT / "apphub").glob("*/app.json")}
    ids = set()
    labels = set()
    for group in groups:
        if (not isinstance(group, dict) or not isinstance(group.get("id"), str)
                or not re.fullmatch(r"[a-zA-Z0-9_-]{1,80}", group["id"]) or group["id"] in ids
                or not isinstance(group.get("name"), str) or not group["name"].strip()
                or len(group["name"].strip()) > 40 or group["name"].strip() in labels
                or not isinstance(group.get("apps"), list) or len(group["apps"]) > 20000
                or any(not isinstance(name, str) or not name or len(name) > 200 for name in group["apps"])):
            raise ValueError(f"Invalid custom group: {group}")
        ids.add(group["id"])
        labels.add(group["name"].strip())
        missing = set(group["apps"]) - names
        if missing:
            raise ValueError(f"{group['id']}: unknown apps {sorted(missing)}")
    source = SOURCE.read_text()
    marker = "/*__DEFAULT_GROUPS__*/ []"
    if source.count(marker) != 1:
        raise ValueError("Expected exactly one default groups marker")
    return source.replace(marker, json.dumps(groups, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if the committed artifact is out of date")
    args = parser.parse_args()
    result = build()
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text() != result:
            raise SystemExit("Userscript is stale; run python scripts/build_userscript.py")
        print("Userscript and default app assignments are up to date")
    else:
        OUTPUT.write_text(result)
        print(f"Built {OUTPUT.relative_to(ROOT)}")
