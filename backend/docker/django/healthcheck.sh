#!/bin/bash
set -e

# Default host and port (can be overridden via env vars in docker-compose)
HOST=${HEALTHCHECK_HOST:-localhost}
PORT=${HEALTHCHECK_PORT:-8000}
URL="http://${HOST}:${PORT}/api/v1/health/"

MAX_RETRIES=5
SLEEP_BETWEEN=3

for attempt in $(seq 1 $MAX_RETRIES); do
    RESPONSE=$(curl -s --max-time 5 -H "X-Forwarded-Proto: https" "$URL" || true)

    if echo "$RESPONSE" | grep -q "Healthy"; then
        echo "Django app is healthy."
        exit 0
    fi

    echo "[$attempt/$MAX_RETRIES] Django app not healthy yet. Response: $RESPONSE"
    sleep $SLEEP_BETWEEN
done

echo "Django app is not healthy after $MAX_RETRIES attempts!"
exit 1