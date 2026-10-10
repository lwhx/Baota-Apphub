#!/usr/bin/env python3
"""Validate Baota Docker app metadata, Compose templates, and audited security defaults."""
import json
import pathlib
import re
import sys

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is required: python -m pip install 'PyYAML>=6,<7'")

ROOT = pathlib.Path(__file__).resolve().parents[1] / "apphub"
REQUIRED_USER_SECRETS = {
    "immich": ("PANEL_DB_USER_PASSWORD",),
    "pterodactyl-china": (
        "PANEL_ADMIN_PASSWORD", "PANEL_DB_USER_PASSWORD", "PANEL_REDIS_ROOT_PASSWORD"
    ),
    "vanblog": ("PANEL_DB_ROOT_PASSWORD",),
    "qiandao": ("AES_PWD", "COOKIE_PWD"),
    "firefox-browser": ("HTTP_PWD",),
    "libreoffice": ("HTTP_PWD",),
    "remmina": ("HTTP_PWD",),
    "sqlitebrowser": ("HTTP_PWD",),
    "wps-office": ("HTTP_PWD",),
}


def read_env(path):
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if key in values:
            raise ValueError(f"duplicate env variable {key}")
        values[key] = value.strip().strip('"').strip("'")
    return values


def validate():
    errors = []
    inspected = 0
    enabled = 0
    for directory in sorted(ROOT.iterdir()):
        if not directory.is_dir():
            continue
        inspected += 1
        name = directory.name
        metadata = directory / "app.json"
        if not metadata.is_file():
            errors.append(f"{name}: missing app.json")
            continue
        try:
            data = json.loads(metadata.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                raise ValueError("metadata root must be an object")
        except (UnicodeError, ValueError) as exc:
            errors.append(f"{name}: invalid app.json: {exc}")
            continue

        if data.get("appname") != name:
            errors.append(f"{name}: appname does not match its folder")
        if not (directory / "icon.png").is_file():
            errors.append(f"{name}: missing icon.png")
        for field_type, id_key in (("field", "attr"), ("env", "key")):
            fields = data.get(field_type, [])
            if not isinstance(fields, list):
                errors.append(f"{name}: {field_type} must be an array")
                continue
            identifiers = [x.get(id_key) for x in fields if isinstance(x, dict)]
            if len(identifiers) != len(fields) or any(
                not isinstance(item, str) or not item for item in identifiers
            ) or len(set(identifiers)) != len(identifiers):
                errors.append(f"{name}: invalid or duplicate {field_type} identifiers")

        versions = []
        for group in data.get("appversion", []):
            major = str(group.get("m_version", ""))
            minors = group.get("s_version", [])
            versions.extend(f"{major}.{minor}" for minor in minors) if minors else versions.append(major)
        if len(versions) != len(set(versions)):
            errors.append(f"{name}: duplicate application version")
        if data.get("appstatus") == 1:
            enabled += 1
            if not versions:
                errors.append(f"{name}: active app has no deployable versions")
        for version in versions:
            target = directory / version
            compose_path = target / "docker-compose.yml"
            env_path = target / ".env"
            if not compose_path.is_file() or not env_path.is_file():
                errors.append(f"{name}/{version}: missing docker-compose.yml or .env")
                continue
            try:
                compose_text = compose_path.read_text(encoding="utf-8")
                compose = yaml.safe_load(compose_text)
                if not isinstance(compose, dict) or not isinstance(
                    compose.get("services"), dict
                ) or not compose["services"]:
                    errors.append(f"{name}/{version}: missing Compose services")
            except (yaml.YAMLError, UnicodeError) as exc:
                errors.append(f"{name}/{version}: invalid Compose YAML: {exc}")
                continue
            try:
                values = read_env(env_path)
            except (ValueError, UnicodeError) as exc:
                errors.append(f"{name}/{version}: invalid .env: {exc}")
                continue

            for secret in REQUIRED_USER_SECRETS.get(name, ()):
                if values.get(secret, "missing") != "":
                    errors.append(f"{name}/{version}: {secret} must be blank in published .env")
                placeholder = "$" + "{" + secret + ":?"
                if placeholder not in compose_text:
                    errors.append(f"{name}/{version}: {secret} requires a nonempty Compose guard")
            if name == "bitwarden" and values.get("SIGNUPS_ALLOWED", "").lower() != "false":
                errors.append(f"{name}/{version}: public registration must default to false")

        for secret in REQUIRED_USER_SECRETS.get(name, ()):
            fields = data.get("field", [])
            env_fields = data.get("env", [])
            field = next((f for f in fields if f.get("attr") == secret.lower()), None)
            if field is None or field.get("default") not in ("", None):
                errors.append(f"{name}: {secret} cannot have a public default")
            if not any(e.get("key") == secret.lower() for e in env_fields):
                errors.append(f"{name}: missing env definition for {secret}")
        if name == "bitwarden":
            fields = data.get("field", [])
            signup = next((f for f in fields if f.get("attr") == "signups_allowed"), None)
            if signup is None or str(signup.get("default")).lower() != "false":
                errors.append("bitwarden: registration must be disabled in app.json")

    for problem in errors:
        print("ERROR:", problem)
    print(f"Checked {inspected} apps ({enabled} active): {len(errors)} errors")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(validate())
