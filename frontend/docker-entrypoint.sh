#!/bin/sh
# Substitute env vars into nginx config template
export PORT=${PORT:-80}
envsubst '${BACKEND_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
