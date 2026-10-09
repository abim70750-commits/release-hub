#!/data/data/com.termux/files/usr/bin/bash
set -e

REPO="abim70750-commits/release-hub"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
KS="$DIR/android/release.keystore"
ALIAS="releasehub"

if [ -f "$KS" ]; then
  echo "keystore already exists at $KS"
  echo "delete it manually if you really want to regenerate."
  exit 1
fi

STOREPASS=$(openssl rand -hex 16)
KEYPASS="$STOREPASS"

keytool -genkeypair -v \
  -keystore "$KS" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$STOREPASS" -keypass "$KEYPASS" \
  -dname "CN=Abi Manyu, OU=BlueBarry, O=Abi Manyu, L=Unknown, ST=Unknown, C=ID" \
  > /dev/null

echo "keystore written to $KS"
echo ""
echo "Setting GitHub Secrets for $REPO ..."
base64 -w0 "$KS" | gh secret set KEYSTORE_BASE64 --repo "$REPO"
gh secret set KEYSTORE_PASSWORD --body "$STOREPASS" --repo "$REPO"
gh secret set KEY_PASSWORD --body "$KEYPASS" --repo "$REPO"
gh secret set KEY_ALIAS --body "$ALIAS" --repo "$REPO"

echo ""
echo "=================== BACK UP INI ==================="
echo "KEYSTORE_PASSWORD: $STOREPASS"
echo "KEY_PASSWORD:      $KEYPASS"
echo "KEY_ALIAS:         $ALIAS"
echo ""
echo "File keystore: $KS"
echo "Simpan ke Google Drive / password manager."
echo "Kalau hilang, lo nggak bisa update app yang udah diinstall orang."
echo "=================================================="
