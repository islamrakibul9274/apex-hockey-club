#!/usr/bin/env bash
# Download the replacement Pexels collection and generate local WebP crops.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/fetch-images.mjs
