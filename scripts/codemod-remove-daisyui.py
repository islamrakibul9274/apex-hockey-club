#!/usr/bin/env python3
"""
One-off codemod: removes daisyUI component classes and replaces them with the
project's own Apex component classes (defined in src/app/globals.css).

daisyUI shipped ~90 KB of CSS for a handful of button/badge/alert styles and its
class names collided with plain Tailwind utilities (`btn`, `card`, `input`,
`label`, `badge`, `menu`, `hero`, `modal`), which made the markup ambiguous.
These classes are now Apex-prefixed and defined locally.
"""
import os
import re

# daisyUI class -> apex class
DIRECT = {
    # buttons
    "btn-primary": "apex-btn apex-btn-primary",
    "btn-secondary": "apex-btn apex-btn-secondary",
    "btn-ghost": "apex-btn apex-btn-ghost",
    "btn-outline": "apex-btn apex-btn-secondary",
    "btn-block": "apex-btn-block",
    "btn-circle": "apex-btn-icon",
    "btn-sm": "apex-btn-sm",
    "btn-xs": "apex-btn-sm",
    "btn-lg": "apex-btn-lg",
    "btn": "apex-btn",
    # badges
    "badge-ghost": "apex-badge",
    "badge-primary": "apex-badge apex-badge-brand",
    "badge-xs": "apex-badge-sm",
    "badge-sm": "apex-badge-sm",
    "badge-lg": "apex-badge",
    "badge-outline": "apex-badge",
    "badge": "apex-badge",
    # alerts
    "alert-error": "apex-alert apex-alert-error",
    "alert-success": "apex-alert apex-alert-success",
    "alert-warning": "apex-alert apex-alert-info",
    "alert-info": "apex-alert apex-alert-info",
    "alert": "apex-alert",
    # cards
    "card-body": "apex-card-body",
    "card-title": "apex-card-title",
    "card": "apex-card",
    # forms
    "form-control": "apex-field",
    "input-sm": "apex-input-sm",
    "input-bordered": "apex-input",
    "input": "apex-input",
    "label-text": "apex-label",
    "toggle": "apex-toggle",
    # layout
    "loading": "apex-spinner",
    "loading-spinner": "apex-spinner",
    "loading-lg": "apex-spinner",
    "loading-sm": "apex-spinner-sm",
    "loading-xs": "apex-spinner-sm",
    "divider": "apex-divider",
    "hero-content": "apex-hero-content",
    "hero-overlay": "apex-hero-overlay",
    "hero": "apex-hero",
    "menu-title": "apex-menu-title",
    "menu": "apex-menu",
    "navbar": "apex-navbar",
    "modal-box": "apex-modal-box",
    "modal": "apex-modal",
}

# Apply longest-first so `btn-primary` wins over `btn`.
ORDERED = sorted(DIRECT.items(), key=lambda kv: -len(kv[0]))


def convert(class_attr: str) -> str:
    original = class_attr
    for daisy, apex in ORDERED:
        # Only replace whole class tokens, not substrings of e.g. "navbar-x".
        pattern = rf"(?<![-\w]){re.escape(daisy)}(?![-\w])"
        class_attr = re.sub(pattern, apex, class_attr)

    # De-duplicate and tidy.
    tokens = [t for t in class_attr.split() if t]
    seen, out = set(), []
    for t in tokens:
        if t not in seen:
            seen.add(t)
            out.append(t)
    result = " ".join(out)

    # A converted alert/button keeps daisy's colour utilities, which are plain
    # Tailwind classes and still valid. Nothing else to strip.
    return result if result else original


changed = {}
for root, _dirs, files in os.walk("src"):
    for name in files:
        if not name.endswith((".tsx", ".ts")):
            continue
        path = os.path.join(root, name)
        src = open(path).read()

        def repl(match: re.Match) -> str:
            return 'className="' + convert(match.group(1)) + '"'

        new = re.sub(r'className="([^"]*)"', repl, src)
        if new != src:
            open(path, "w").write(new)
            changed[path] = sum(1 for a, b in zip(src.split("\n"), new.split("\n")) if a != b)

print(f"rewrote {len(changed)} files")
for k, v in sorted(changed.items()):
    print(f"  {v:3d}  {k}")