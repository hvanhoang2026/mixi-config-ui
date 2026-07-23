#!/usr/bin/env python3
"""Validate a Next.js/React project against the reusable mandatory baseline."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Finding:
    severity: str
    code: str
    message: str


class Validator:
    def __init__(self, root: Path, mode: str) -> None:
        self.root = root
        self.mode = mode
        self.findings: list[Finding] = []
        self.package: dict[str, Any] = {}
        self.is_next = False
        self.is_application = False

    def error(self, code: str, message: str) -> None:
        self.findings.append(Finding("ERROR", code, message))

    def warn(self, code: str, message: str) -> None:
        self.findings.append(Finding("WARN", code, message))

    def required(self, relative: str, code: str) -> Path:
        path = self.root / relative
        if not path.exists():
            self.error(code, f"Missing required path: {relative}")
        return path

    def load_json(self, relative: str, code: str) -> dict[str, Any]:
        path = self.required(relative, code)
        if not path.is_file():
            return {}
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            self.error(code, f"Invalid JSON in {relative}: {exc}")
            return {}
        if not isinstance(value, dict):
            self.error(code, f"Expected an object in {relative}")
            return {}
        return value

    def run(self) -> list[Finding]:
        self.package = self.load_json("package.json", "PKG001")
        dependencies = self.all_dependencies()
        self.is_next = "next" in dependencies
        self.is_application = self.is_next or (
            bool(self.package.get("private")) and "react-dom" in dependencies
        )

        if "react" not in dependencies:
            self.error("PKG002", "Target is not a React project: react is missing")
        self.validate_files()
        self.validate_package()
        self.validate_typescript()
        self.validate_environment()
        self.validate_nextjs()
        self.validate_sources()
        return self.findings

    def validate_files(self) -> None:
        for relative, code in (
            (".env.example", "FILE001"),
            (".gitignore", "FILE002"),
            ("README.md", "FILE003"),
            ("tsconfig.json", "FILE004"),
        ):
            self.required(relative, code)

        if not any(self.root.glob("eslint.config.*")):
            self.error("FILE005", "Missing flat ESLint config: eslint.config.*")

        lockfiles = [
            name
            for name in (
                "package-lock.json",
                "pnpm-lock.yaml",
                "yarn.lock",
                "bun.lock",
                "bun.lockb",
            )
            if (self.root / name).is_file()
        ]
        if not lockfiles:
            self.error("FILE006", "Missing package-manager lockfile")
        if len(lockfiles) > 1:
            self.error("FILE007", f"Multiple package-manager lockfiles: {lockfiles}")

        if self.is_application:
            has_unit = self.has_match(
                (
                    "src/**/*.test.*",
                    "src/**/*.spec.*",
                    "test/**/*.test.*",
                    "test/**/*.spec.*",
                )
            )
            if not has_unit:
                self.error("FILE008", "Missing unit/component test")
            has_e2e = self.has_match(
                (
                    "e2e/**/*",
                    "tests/**/*",
                    "test/e2e/**/*",
                    "playwright.config.*",
                    "cypress.config.*",
                )
            )
            if not has_e2e:
                self.error("FILE009", "Missing browser E2E test/config")

    def validate_package(self) -> None:
        dependencies = self.all_dependencies()
        dev_dependencies = self.package.get("devDependencies", {})
        scripts = self.package.get("scripts", {})
        if not isinstance(scripts, dict):
            self.error("PKG003", "package.json scripts must be an object")
            return

        for dependency in ("typescript", "eslint", "prettier"):
            if dependency not in dependencies:
                self.error("PKG004", f"Missing development dependency: {dependency}")

        required_scripts = [
            "build",
            "lint",
            "typecheck",
            "format",
            "format:check",
            "test",
            "standards:check",
        ]
        if self.is_application:
            required_scripts.append("dev")
        if self.is_next:
            required_scripts.append("start")
        if self.is_application:
            required_scripts.append("test:e2e")
        for script in required_scripts:
            if not scripts.get(script):
                self.error("PKG005", f"Missing package script: {script}")

        for script in ("lint", "format:check", "typecheck", "test"):
            command = str(scripts.get(script, ""))
            if "--fix" in command or "--write" in command:
                self.error("PKG006", f"CI script must be non-mutating: {script}")

        lint = str(scripts.get("lint", ""))
        if "--max-warnings" not in lint:
            self.warn("PKG007", "Lint should fail on warnings with --max-warnings=0")

        if self.is_next and "eslint-config-next" not in dependencies:
            self.error("PKG008", "Next.js project must use eslint-config-next")
        if not self.is_next and not any(
            name in dependencies
            for name in ("eslint-plugin-react-hooks", "@eslint-react/eslint-plugin")
        ):
            self.error("PKG009", "React project must enforce React Hooks lint rules")

        engines = self.package.get("engines", {})
        if not isinstance(engines, dict) or not engines.get("node"):
            self.warn("PKG010", "Declare the supported Node version in package.json engines")

    def validate_typescript(self) -> None:
        tsconfig = self.load_json("tsconfig.json", "TS001")
        options = tsconfig.get("compilerOptions", {})
        if not isinstance(options, dict):
            self.error("TS002", "tsconfig compilerOptions must be an object")
            return
        for option in (
            "strict",
            "noUncheckedIndexedAccess",
            "noImplicitOverride",
        ):
            if options.get(option) is not True:
                self.error("TS003", f"compilerOptions.{option} must be true")
        if options.get("allowJs") is True:
            self.warn("TS004", "allowJs should be false in a TypeScript-first project")
        if options.get("skipLibCheck") is True and not self.is_next:
            self.warn("TS005", "Review skipLibCheck:true; it can hide dependency type drift")

    def validate_environment(self) -> None:
        path = self.root / ".env.example"
        if path.is_file():
            for number, raw_line in enumerate(
                path.read_text(encoding="utf-8").splitlines(), start=1
            ):
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                if re.search(
                    r"(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY)", key, re.IGNORECASE
                ) and value.strip().strip("'\""):
                    self.error(
                        "ENV001",
                        f"Secret-like value must be empty in .env.example:{number}",
                    )
                if key.startswith("NEXT_PUBLIC_") and re.search(
                    r"(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY)", key, re.IGNORECASE
                ):
                    self.error("ENV002", f"Secret-like public environment name: {key}")

        gitignore = self.root / ".gitignore"
        if gitignore.is_file():
            text = gitignore.read_text(encoding="utf-8")
            if ".env" not in text:
                self.error("ENV003", ".gitignore must ignore local environment files")
            for output in (".next", "coverage"):
                if output not in text:
                    self.warn("ENV004", f".gitignore should ignore {output}")

    def validate_nextjs(self) -> None:
        if not self.is_next:
            return
        app_root = next(
            (
                path
                for path in (self.root / "src/app", self.root / "app")
                if path.is_dir()
            ),
            None,
        )
        if app_root is None:
            self.error("NEXT001", "New Next.js projects must use the App Router")
            return
        for name, code in (
            ("layout.tsx", "NEXT002"),
            ("page.tsx", "NEXT003"),
            ("error.tsx", "NEXT004"),
            ("not-found.tsx", "NEXT005"),
        ):
            if not (app_root / name).is_file():
                self.error(code, f"Missing App Router boundary: {app_root.name}/{name}")

        layout = app_root / "layout.tsx"
        if layout.is_file():
            text = layout.read_text(encoding="utf-8")
            if re.search(r"^[\"']use client[\"']", text.strip()):
                self.error("NEXT006", "Root layout must not be a Client Component")
            if "metadata" not in text and "generateMetadata" not in text:
                self.error("NEXT007", "Root layout must define a metadata baseline")
            if not re.search(r"<html[^>]+lang=", text):
                self.error("NEXT008", "Root layout must set the document language")

        if not any(self.root.glob("next.config.*")):
            self.error("NEXT009", "Missing next.config.*")
        else:
            config_text = "\n".join(
                path.read_text(encoding="utf-8") for path in self.root.glob("next.config.*")
            )
            if "headers" not in config_text:
                self.warn(
                    "NEXT010",
                    "No security headers found in next.config; document external enforcement",
                )

    def validate_sources(self) -> None:
        src_roots = [path for path in (self.root / "src", self.root / "app") if path.is_dir()]
        for src_root in src_roots:
            for path in src_root.rglob("*"):
                if not path.is_file() or path.suffix not in {".ts", ".tsx", ".js", ".jsx"}:
                    continue
                relative = path.relative_to(self.root)
                try:
                    text = path.read_text(encoding="utf-8")
                except OSError:
                    continue
                is_client = bool(
                    re.search(r"^\s*[\"']use client[\"'];?", text, re.MULTILINE)
                )
                if re.search(r"\bconsole\.log\s*\(", text):
                    self.error("STYLE001", f"console.log is forbidden: {relative}")
                if re.search(r"\b(?:it|test|describe)\.only\s*\(", text):
                    self.error("TEST001", f"Focused test is forbidden: {relative}")
                if re.search(r"\b(?:it|test|describe)\.skip\s*\(", text):
                    self.warn("TEST002", f"Review skipped test: {relative}")
                if "@ts-ignore" in text:
                    self.error("TS006", f"@ts-ignore is forbidden: {relative}")
                if re.search(r"\bany\b", text) and not path.name.endswith(".d.ts"):
                    self.warn("TS007", f"Review explicit any usage: {relative}")
                if re.search(
                    r"eslint-disable[^\n]*(react-hooks/exhaustive-deps|react-hooks/rules-of-hooks)",
                    text,
                ):
                    self.error("REACT001", f"React Hooks lint suppression: {relative}")
                if "dangerouslySetInnerHTML" in text:
                    self.warn("SEC001", f"Review and sanitize HTML rendering: {relative}")
                if self.is_next and path.suffix in {".tsx", ".jsx"}:
                    if re.search(r"<img(?:\s|>)", text):
                        self.warn("PERF001", f"Use next/image where applicable: {relative}")
                    if re.search(r'<a\s+[^>]*href=["\']/', text):
                        self.warn("NEXT011", f"Use next/link for internal navigation: {relative}")
                if is_client and (
                    "server-only" in text
                    or re.search(r"from\s+[\"'][^\"']*(?:/server|server/)", text)
                ):
                    self.error(
                        "BOUNDARY001",
                        f"Client module imports a server-only boundary: {relative}",
                    )
                if is_client and re.search(
                    r"process\.env\.(?!NEXT_PUBLIC_)", text
                ):
                    self.error(
                        "ENV005",
                        f"Client module reads a server environment variable: {relative}",
                    )
                for public_name in re.findall(
                    r"process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)", text
                ):
                    if re.search(
                        r"(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY)",
                        public_name,
                        re.IGNORECASE,
                    ):
                        self.error(
                            "ENV006",
                            f"Secret-like browser environment variable {public_name}: {relative}",
                        )
                if "process.env" in text and not self.is_config_boundary(path):
                    self.warn(
                        "ENV007",
                        f"Direct process.env outside config boundary: {relative}",
                    )

    def all_dependencies(self) -> dict[str, Any]:
        merged: dict[str, Any] = {}
        for key in ("dependencies", "devDependencies", "peerDependencies"):
            values = self.package.get(key, {})
            if isinstance(values, dict):
                merged.update(values)
        return merged

    def has_match(self, patterns: tuple[str, ...]) -> bool:
        return any(next(self.root.glob(pattern), None) is not None for pattern in patterns)

    @staticmethod
    def is_config_boundary(path: Path) -> bool:
        return (
            "config" in path.parts
            or path.name.startswith("next.config.")
            or path.name.startswith("instrumentation.")
            or path.name.startswith("proxy.")
            or path.name.startswith("middleware.")
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "project", nargs="?", default=".", help="Next.js/React project root"
    )
    parser.add_argument(
        "--mode",
        choices=("generated", "existing"),
        default="generated",
        help="generated fails on errors; existing reports baseline debt",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON findings")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.project).expanduser().resolve()
    if not root.is_dir():
        print(f"ERROR ROOT001 Project directory does not exist: {root}", file=sys.stderr)
        return 2
    validator = Validator(root, args.mode)
    findings = validator.run()
    errors = [finding for finding in findings if finding.severity == "ERROR"]
    warnings = [finding for finding in findings if finding.severity == "WARN"]
    if args.json:
        print(
            json.dumps(
                {
                    "project": str(root),
                    "mode": args.mode,
                    "errors": [asdict(finding) for finding in errors],
                    "warnings": [asdict(finding) for finding in warnings],
                },
                indent=2,
            )
        )
    else:
        for finding in findings:
            print(f"{finding.severity} {finding.code} {finding.message}")
        print(f"Summary: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if args.mode == "generated" and errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
