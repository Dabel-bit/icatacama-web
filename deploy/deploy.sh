#!/usr/bin/env bash
# Publica dist/ en el bucket privado de S3 (origen de CloudFront) con cabeceras de caché adecuadas
# e invalida la distribución. Uso:
#   S3_BUCKET=mi-bucket CLOUDFRONT_DISTRIBUTION_ID=E123ABC [AWS_PROFILE=...] npm run deploy
# Los valores salen de la salida (Outputs) de la pila de deploy/cloudformation.yaml.
set -euo pipefail
: "${S3_BUCKET:?Define S3_BUCKET con el nombre del bucket}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?Define CLOUDFRONT_DISTRIBUTION_ID (sin invalidación los HTML tardarían hasta 24 h en actualizarse)}"
DIST="$(cd "$(dirname "$0")/.." && pwd)/dist"
[ -f "$DIST/index.html" ] || { echo "No existe dist/. Ejecuta npm run build primero."; exit 1; }
grep -q 'http-equiv="Content-Security-Policy"' "$DIST/index.html" || { echo "dist/ no tiene CSP: ¿se generó con otra configuración? Ejecuta npm run build && npm run verify."; exit 1; }

COMMON=(--only-show-errors --sse AES256)

# 1) CSS/JS/fuentes con hash en el nombre: caché de un año (nunca cambian de contenido)
aws s3 sync "$DIST/assets" "s3://$S3_BUCKET/assets" --delete "${COMMON[@]}" \
  --cache-control "public,max-age=31536000,immutable"

# 2) Imágenes, íconos y manifest: caché de una semana
aws s3 sync "$DIST" "s3://$S3_BUCKET" --delete "${COMMON[@]}" \
  --exclude "assets/*" --exclude "*.html" --exclude "sitemap.xml" --exclude "robots.txt" --exclude ".well-known/*" \
  --cache-control "public,max-age=604800"
aws s3 cp "$DIST/site.webmanifest" "s3://$S3_BUCKET/site.webmanifest" "${COMMON[@]}" \
  --content-type "application/manifest+json" --cache-control "public,max-age=604800"

# 3) HTML, sitemap, robots y security.txt: siempre revalidar para ver los cambios al instante
aws s3 sync "$DIST" "s3://$S3_BUCKET" --delete "${COMMON[@]}" \
  --exclude "*" --include "*.html" --include "sitemap.xml" --include "robots.txt" --include ".well-known/*" \
  --cache-control "public,max-age=0,must-revalidate"

aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*" --output text --query 'Invalidation.Id'
echo "Publicado en s3://$S3_BUCKET e invalidación de CloudFront creada."
