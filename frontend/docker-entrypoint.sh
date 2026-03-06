#!/bin/sh
# Substitute env vars into nginx config template
export PORT=${PORT:-80}
export BACKEND_ORIGIN=${BACKEND_ORIGIN:-http://backend:8080}
envsubst '${BACKEND_ORIGIN} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
echo "--- nginx config ---"
cat /etc/nginx/conf.d/default.conf
echo "--- starting nginx ---"
nginx -g 'daemon off;'
