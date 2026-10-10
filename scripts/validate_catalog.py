#!/usr/bin/env python3
"""Validate the Baota application catalog without running containers."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "apphub"
errors = []
warnings = []
apps = 0
active = 0

try:
    import yaml
except ImportError:
    sys.exit("Install PyYAML first: python -m pip install pyyaml")

for directory in sorted(path for path in ROOT.iterdir() if path.is_dir()):
    apps += 1
    metadata = directory / "app.json"
    if not metadata.is_file():
        errors.append(f"{directory.name}: missing app.json")
        continue
    try:
        data = json.loads(metadata.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        errors.append(f"{directory.name}: invalid app.json: {exc}")
        continue
    if data.get("appname") != directory.name:
        warnings.append(f"{directory.name}: appname disagrees with folder")
    for key in ("field", "env"):
        names = [item.get("attr" if key == "field" else "key") for item in data.get(key, [])]
        if len(names) != len(set(names)):
            warnings.append(f"{directory.name}: duplicate {key} identifiers")
    versions = []
    for group in data.get("appversion", []):
        major = str(group.get("m_version", ""))
        subs = group.get("s_version", [])
        versions.extend(f"{major}.{minor}" for minor in subs) if subs else versions.append(major)
    if data.get("appstatus") == 1:
        active += 1
        if not versions:
            errors.append(f"{directory.name}: active app has no versions")
    for version in versions:
        target = directory / version
        compose = target / "docker-compose.yml"
        env = target / ".env"
        if not compose.is_file() or not env.is_file():
            errors.append(f"{directory.name}/{version}: missing compose or .env")
            continue
        try:
            parsed = yaml.safe_load(compose.read_text(encoding="utf-8"))
            if not isinstance(parsed, dict) or not isinstance(parsed.get("services"), dict):
                errors.append(f"{directory.name}/{version}: invalid Compose services")
        except yaml.YAMLError as exc:
            errors.append(f"{directory.name}/{version}: invalid YAML: {exc}")
    if not (directory / "icon.png").exists():
        errors.append(f"{directory.name}: missing icon.png")
for warning in warnings:
    print("WARNING:", warning)
for error in errors:
    print("ERROR:", error)
print(f"Checked {apps} apps ({active} active): {len(errors)} errors, {len(warnings)} warnings")
sys.exit(1 if errors else 0)
