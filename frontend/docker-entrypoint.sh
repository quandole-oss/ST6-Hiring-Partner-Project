#!/bin/sh
set -e

export PORT=${PORT:-80}
export BACKEND_ORIGIN=${BACKEND_ORIGIN:-http://backend:8080}
export BACKEND_HOST=${BACKEND_HOST:-backend}

if [ "$BACKEND_ORIGIN" = "http://backend:8080" ]; then
  echo "WARNING: BACKEND_ORIGIN not set, using default http://backend:8080 (will not work on Railway)"
fi

envsubst '${BACKEND_ORIGIN} ${BACKEND_HOST} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "--- nginx config ---"
cat /etc/nginx/conf.d/default.conf
echo "--- testing config ---"
nginx -t
echo "--- starting nginx ---"
exec nginx -g 'daemon off;'
