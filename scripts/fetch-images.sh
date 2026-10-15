#!/usr/bin/env bash
# Downloads project photography from Unsplash and emits consistent crops.
#
# Images are downloaded into the repository rather than hotlinked, so the site
# does not depend on a third party at runtime and next/image can cache them.
# Three crops are produced per photo so cards, banners and thumbnails always
# share one aspect ratio and never letterbox.
#
#   bash scripts/fetch-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=public/images
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT"

# name|unsplash-photo-id
MANIFEST='
hero-action|photo-1735656244148-318d5a10c131
hero-puck|photo-1623229749981-273f0c811105
arena-empty|photo-1701361172842-b132f9b09948
team-action|photo-1609407578758-1183d70eb5e5
team-duel|photo-1610884972303-15c0830ffb53
player-gear|photo-1549598145-86b354509082
goalie-kneel|photo-1638128505463-89294745ea21
goalie-watch|photo-1753234196516-c3f7137e28c3
sticks-lean|photo-1648312773792-3db3b560c793
jersey-rw|photo-1609406567350-e60030e33f79
match-board|photo-1609409982623-e20b46afceec
skater-red|photo-1608980125081-b8eb70af100a
'

# Fetch a wide master for each photo.
echo "$MANIFEST" | while IFS='|' read -r name id; do
  [ -z "$name" ] && continue
  curl -sL --max-time 45 -o "$WORK/${name}.jpg" \
    "https://images.unsplash.com/${id}?w=2000&q=82&fm=jpg&fit=max"
done

python3 - "$WORK" "$OUT" <<'PY'
import os, sys
from PIL import Image

work, out = sys.argv[1], sys.argv[2]

# name -> Unsplash id, mirroring the manifest above.
PHOTOS = [
    ("hero-action", "photo-1735656244148-318d5a10c131"),
    ("hero-puck", "photo-1623229749981-273f0c811105"),
    ("arena-empty", "photo-1701361172842-b132f9b09948"),
    ("team-action", "photo-1609407578758-1183d70eb5e5"),
    ("team-duel", "photo-1610884972303-15c0830ffb53"),
    ("player-gear", "photo-1549598145-86b354509082"),
    ("goalie-kneel", "photo-1638128505463-89294745ea21"),
    ("goalie-watch", "photo-1753234196516-c3f7137e28c3"),
    ("sticks-lean", "photo-1648312773792-3db3b560c793"),
    ("jersey-rw", "photo-1609406567350-e60030e33f79"),
    ("match-board", "photo-1609409982623-e20b46afceec"),
    ("skater-red", "photo-1608980125081-b8eb70af100a"),
]

# (suffix, aspect, long-edge)
CROPS = [
    ("wide", 16 / 9, 1600),   # heroes and full-bleed banners
    ("card", 4 / 3, 1000),    # product / programme / article cards
    ("thumb", 1 / 1, 480),    # avatars, small tiles
]


def crop_to(im, aspect, long_edge):
    w, h = im.size
    if w / h > aspect:                 # too wide -> trim sides
        new_w = int(h * aspect)
        left = (w - new_w) // 2
        im = im.crop((left, 0, left + new_w, h))
    else:                              # too tall -> trim, biased to the top
        new_h = int(w / aspect)
        top = int((h - new_h) * 0.35)
        im = im.crop((0, top, w, top + new_h))
    return im.resize((long_edge, int(long_edge / aspect)), Image.LANCZOS)


total = 0
for name, photo_id in PHOTOS:
    src = os.path.join(work, f"{name}.jpg")
    if not os.path.exists(src) or os.path.getsize(src) < 8000:
        print(f"  !! {name}: download failed")
        continue
    im = Image.open(src).convert("RGB")
    written = []
    for suffix, aspect, edge in CROPS:
        # Some photos are portrait originals; a 16:9 crop of them is very
        # short, so the banner variants are capped at a sensible width.
        long_edge = min(edge, int(im.size[0])) if suffix == "wide" else edge
        c = crop_to(im, aspect, long_edge)
        path = os.path.join(out, f"{name}-{suffix}.webp")
        c.save(path, "WEBP", quality=80 if suffix != "thumb" else 82, method=6)
        kb = os.path.getsize(path) // 1024
        total += kb
        written.append(f"{suffix} {kb}KB")
    print(f"  {name:<14} {im.size[0]}x{im.size[1]}  ->  " + "  ".join(written))

# Attribution file so the licence is traceable.
with open(os.path.join(out, "ATTRIBUTION.md"), "w") as f:
    f.write("# Image attribution\n\n")
    f.write("All photography is from [Unsplash](https://unsplash.com) under the ")
    f.write("[Unsplash License](https://unsplash.com/license). Images are stored ")
    f.write("in this repository rather than hotlinked.\n\n")
    f.write("| File | Unsplash photo |\n|---|---|\n")
    for name, photo_id in PHOTOS:
        f.write(f"| `{name}-*` | https://unsplash.com/photos/{photo_id[6:]} |\n")
    f.write("\nRegenerate with `bash scripts/fetch-images.sh`.\n")

print()
print(f"total emitted: {total}KB across {len(PHOTOS) * len(CROPS)} files")
PY