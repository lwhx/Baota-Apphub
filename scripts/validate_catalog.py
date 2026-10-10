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

# For these audited templates, a missing or publicly shared password is a blocking error.
REQUIRED_USER_SECRETS = {
    "immich": ("PANEL_DB_USER_PASSWORD",),
    "pterodactyl-china": ("PANEL_ADMIN_PASSWORD", "PANEL_DB_USER_PASSWORD", "PANEL_REDIS_ROOT_PASSWORD"),
    "vanblog": ("PANEL_DB_ROOT_PASSWORD",),
    "firefox-browser": ("HTTP_PWD",),
    "libreoffice": ("HTTP_PWD",),
    "remmina": ("HTTP_PWD",),
    "sqlitebrowser": ("HTTP_PWD",),
    "wps-office": ("HTTP_PWD",),
}


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
        errors.append(f"{directory.name}: appname disagrees with folder")
    for key in ("field", "env"):
        names = [item.get("attr" if key == "field" else "key") for item in data.get(key, [])]
        if len(names) != len(set(names)):
            errors.append(f"{directory.name}: duplicate {key} identifiers")
    versions = []
    for group in data.get("appversion", []):
        major = str(group.get("m_version", ""))
        subs = group.get("s_version", [])
        if subs:
            versions.extend(f"{major}.{minor}" for minor in subs)
        else:
            versions.append(major)
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

    # Security regressions: never publish a reusable password for audited apps.
    for secret in REQUIRED_USER_SECRETS.get(directory.name, ()):
        field = next((entry for entry in data.get("field", [])
                      if entry.get("attr") == secret.lower()), None)
        if field is None or field.get("default") not in (None, ""):
            errors.append(f"{directory.name}: {secret} must require a new user-provided value")
        if not any(entry.get("key") == secret.lower() for entry in data.get("env", [])):
            errors.append(f"{directory.name}: missing env mapping for {secret}")
        for version in versions:
            env_file = directory / version / ".env"
            compose_file = directory / version / "docker-compose.yml"
            if not env_file.exists() or not compose_file.exists():
                continue
            env_text = env_file.read_text(encoding="utf-8")
            matches = re.findall(r"^" + re.escape(secret) + r"=(.*)$", env_text, re.MULTILINE)
            if len(matches) != 1 or matches[0].strip().strip(chr(34) + chr(39)):
                errors.append(f"{directory.name}/{version}: {secret} must be blank in public .env")
            required_expression = "$" + "{" + secret + ":?"
            if required_expression not in compose_file.read_text(encoding="utf-8"):
                errors.append(f"{directory.name}/{version}: missing required variable guard for {secret}")

    if directory.name == "bitwarden":
        signup_field = next((entry for entry in data.get("field", [])
                             if entry.get("attr") == "signups_allowed"), None)
        if signup_field is None or str(signup_field.get("default")).lower() != "false":
            errors.append("bitwarden: registration must be disabled by default")
        for version in versions:
            env_file = directory / version / ".env"
            if env_file.exists() and not re.search(
                    r'^SIGNUPS_ALLOWED=["\x27]?false["\x27]?
        errors.append(f"{directory.name}: missing icon.png")
for warning in warnings:
    print("WARNING:", warning)
for error in errors:
    print("ERROR:", error)
print(f"Checked {apps} apps ({active} active): {len(errors)} errors, {len(warnings)} warnings")
sys.exit(1 if errors else 0)
, env_file.read_text(encoding="utf-8"),
                    re.MULTILINE):
                errors.append(f"bitwarden/{version}: public registration must default to false")

    if not (directory / "icon.png").exists():
        errors.append(f"{directory.name}: missing icon.png")
for warning in warnings:
    print("WARNING:", warning)
for error in errors:
    print("ERROR:", error)
print(f"Checked {apps} apps ({active} active): {len(errors)} errors, {len(warnings)} warnings")
sys.exit(1 if errors else 0)
