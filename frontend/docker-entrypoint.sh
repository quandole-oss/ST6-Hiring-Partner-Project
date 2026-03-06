#!/bin/sh
# Substitute env vars into nginx config template
export PORT=${PORT:-80}
export RESOLVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf || echo "8.8.8.8")
export BACKEND_PROTO=${BACKEND_PROTO:-http}
envsubst '${BACKEND_URL} ${PORT} ${RESOLVER} ${BACKEND_PROTO}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
cat /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
