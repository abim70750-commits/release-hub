#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$(dirname "$0")"

VERSION="${1:-}"
NOTE="${2:-}"

if [ -z "$VERSION" ]; then
  echo "usage: ./release.sh <x.y.z> [changelog line]"
  echo "example: ./release.sh 1.0.1 \"fix sync crash\""
  exit 1
fi

if ! printf '%s' "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "version must be x.y.z (got: $VERSION)"
  exit 1
fi

TAG="v$VERSION"
DATE=$(date +%Y-%m-%d)
NOTE="${NOTE:-release}"

if ! git diff-index --quiet HEAD --; then
  echo "uncommitted changes — commit or stash first:"
  git status --short
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "tag $TAG already exists locally"
  exit 1
fi

if git ls-remote --tags origin "$TAG" 2>/dev/null | grep -q "refs/tags/$TAG$"; then
  echo "tag $TAG already exists on origin"
  exit 1
fi

[ -f CHANGELOG.md ] || printf '# Changelog\n\n**Author:** Abi Manyu (BlueBarry)\n\n' > CHANGELOG.md

awk -v version="$VERSION" -v note="$NOTE" -v date="$DATE" '
  BEGIN { inserted = 0 }
  /^## / && !inserted {
    print "## " version;
    print "- " date " · " note;
    print "";
    inserted = 1;
  }
  { print }
  END {
    if (!inserted) {
      print "";
      print "## " version;
      print "- " date " · " note;
    }
  }
' CHANGELOG.md > CHANGELOG.md.tmp
mv CHANGELOG.md.tmp CHANGELOG.md

git add CHANGELOG.md
git commit -m "release $TAG"
git tag -a "$TAG" -m "$TAG"

echo ""
echo "→ pushing main"
git push origin main
echo "→ pushing $TAG"
git push origin "$TAG"

echo ""
echo "done. $TAG pushed."
echo "release: https://github.com/abim70750-commits/release-hub/releases/tag/$TAG"
echo "actions: https://github.com/abim70750-commits/release-hub/actions"
