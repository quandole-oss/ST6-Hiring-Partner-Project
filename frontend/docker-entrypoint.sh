#!/bin/sh
# Substitute env vars into nginx config template
export PORT=${PORT:-80}
export BACKEND_ORIGIN=${BACKEND_ORIGIN:-http://backend:8080}
export BACKEND_HOST=${BACKEND_HOST:-backend}
envsubst '${BACKEND_ORIGIN} ${BACKEND_HOST} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
echo "--- nginx config ---"
cat /etc/nginx/conf.d/default.conf
echo "--- starting nginx ---"
nginx -g 'daemon off;'
