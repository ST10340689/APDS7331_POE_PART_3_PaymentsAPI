#!/usr/bin/env bash
set -euo pipefail

# Generates self-signed certs at ./certs/localhost-key.pem and ./certs/localhost.pem
# Requires openssl to be available on PATH.

CERT_DIR="./certs"
KEY_PATH="$CERT_DIR/localhost-key.pem"
CERT_PATH="$CERT_DIR/localhost.pem"

mkdir -p "$CERT_DIR"

if ! command -v openssl >/dev/null 2>&1; then
  echo "Error: openssl not found on PATH."
  exit 2
fi

echo "Generating self-signed certs in $CERT_DIR ..."
openssl req -nodes -new -x509 -keyout "$KEY_PATH" -out "$CERT_PATH" -days 365 \
  -subj "/CN=localhost"

chmod 600 "$KEY_PATH" "$CERT_PATH"

echo "Created:"
echo "  KEY:  $KEY_PATH"
echo "  CERT: $CERT_PATH"
echo ""
echo "Start server with: node server.js (ensure SSL_KEY_PATH/SSL_CERT_PATH env vars if you moved files)"
