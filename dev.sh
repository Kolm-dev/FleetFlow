#!/usr/bin/env bash

PROJECT="$(realpath "${1:-.}")"

if [ ! -d "$PROJECT/backend" ] || [ ! -d "$PROJECT/frontend" ]; then
    echo "Error: '$PROJECT' must contain backend and frontend directories"
    exit 1
fi

cd "$PROJECT/backend" || exit 1
php artisan serve &
BACKEND_PID=$!

cd "$PROJECT/frontend" || exit 1
npm run dev &
FRONTEND_PID=$!

trap 'kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null' INT TERM EXIT

wait
