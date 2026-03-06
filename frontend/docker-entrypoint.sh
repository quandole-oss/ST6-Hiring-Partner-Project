#!/bin/sh
# Substitute env vars into nginx config template
export PORT=${PORT:-80}
export RESOLVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf || echo "8.8.8.8")
envsubst '${BACKEND_URL} ${PORT} ${RESOLVER}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
cat /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
