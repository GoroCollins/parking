#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

# Function to check if MySQL is ready
mysql_ready() {
python3 << END
import sys
import MySQLdb

try:
    conn = MySQLdb.connect(
        host="${MYSQL_HOST}",
        port=int("${MYSQL_PORT}"),
        user="${MYSQL_USER}",
        passwd="${MYSQL_PASSWORD}",
        db="${MYSQL_DATABASE}",
    )
    conn.close()
except Exception:
    sys.exit(-1)
END
}

# Wait until MySQL is ready
until mysql_ready; do
  >&2 echo "Waiting for MySQL to become available..."
  sleep 5
done
>&2 echo "MySQL is available"

# Force loading all migrations
python3 manage.py showmigrations > /dev/null

# Only run migrations if there are changes
if ! python3 manage.py makemigrations --check --dry-run | grep -q "No changes detected"; then
    echo "Detected changes in models, running makemigrations..."
    python3 manage.py makemigrations
else
    echo "No model changes detected, skipping makemigrations."
fi

python3 manage.py migrate

# Custom management commands
echo "Creating system roles"
python3 manage.py create_roles

# Load fixtures in debug mode if db.json exists
if [[ "$DEBUG" == "True" ]]; then
    if [ -f "seeder.json" ]; then
        echo "Loading dummy database..."
        python3 manage.py load_fixtures
    else
        echo "No dummy database or fixture to load..."
    fi
else
    echo "Production mode detected, skipping dummy data..."
fi

# Assign super user to Admin group
echo "Assigning superuser to Admin group..."
python3 manage.py assign_admin_group

# Collect static files
echo "Collecting static files..."
python3 manage.py collectstatic --noinput

# Execute the CMD passed to the container
exec "$@"