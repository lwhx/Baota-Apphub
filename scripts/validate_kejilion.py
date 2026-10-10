#!/usr/bin/env python3
"""Check imported kejilion template names, source references, ports and secret policy."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "apphub"


def validate():
    errors = []
    apps = sorted(p for p in ROOT.glob("kejilion-*") if p.is_dir())
    if len(apps) < 23:
        errors.append(f"Expected at least 23 imported applications, found {len(apps)}")
    ports = {}
    for directory in apps:
        name = directory.name
        upstream_name = name.removeprefix("kejilion-")
        meta = json.loads((directory / "app.json").read_text(encoding="utf-8"))
        compose = (directory / "latest/docker-compose.yml").read_text(encoding="utf-8")
        env_text = (directory / "latest/.env").read_text(encoding="utf-8")

        if meta.get("appname") != name:
            errors.append(f"{name}: appname/folder mismatch")
        if not meta.get("apptitle", "").startswith("kejilion - "):
            errors.append(f"{name}: display title missing 'kejilion - '")
        allowed_types = {"BuildWebsite", "Database", "Storage", "Tools", "Middleware", "AI", "Media", "Email", "DevOps", "System"}
        if meta.get("apptype") not in allowed_types:
            errors.append(f"{name}: unknown Baota application category")
        if not meta.get("help", "").endswith("/" + upstream_name + ".conf"):
            errors.append(f"{name}: upstream file attribution missing")
        fields = {f["attr"]: f for f in meta.get("field", [])}
        mapping = {f["key"] for f in meta.get("env", [])}
        for key in ("web_port", "bind_ip"):
            if key not in fields or key not in mapping:
                errors.append(f"{name}: missing {key} field or environment mapping")
        port = fields.get("web_port", {}).get("default")
        if port in ports:
            errors.append(f"{name}: reused default port {port} from {ports[port]}")
        ports[port] = name
        if not re.search(r"^BIND_IP=", env_text, re.MULTILINE):
            errors.append(f"{name}: no bind address in .env")
        if "source: kejilion-apps" not in compose:
            errors.append(f"{name}: missing origin label")
        for forbidden in ("/var/run/docker.sock", "privileged: true", "network_mode: host"):
            if forbidden in compose:
                errors.append(f"{name}: dangerous Compose privilege: {forbidden}")

        for field in meta.get("field", []):
            if "必填" not in str(field.get("suffix", "")):
                continue
            upper = field["attr"].upper()
            if field.get("default") not in ("", None):
                errors.append(f"{name}: publicly shared value for {upper}")
            match = re.search(r"^" + re.escape(upper) + r"=(.*)$", env_text, re.MULTILINE)
            if match is None or match.group(1).strip().strip('"').strip("'"):
                errors.append(f"{name}: {upper} must be empty in template .env")
            guard = "$" + "{" + upper + ":?"
            if guard not in compose:
                errors.append(f"{name}: missing required-variable guard for {upper}")

    for problem in errors:
        print("ERROR:", problem)
    print(f"Checked {len(apps)} kejilion app templates: {len(errors)} errors")
    return bool(errors)


if __name__ == "__main__":
    sys.exit(int(validate()))
