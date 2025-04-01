#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | sed 's/\r$//' | xargs)
fi

# Default database values if not set in environment
DB_HOST=${PGHOST:-localhost}
DB_PORT=${PGPORT:-5432}
DB_USER=${PGUSER:-postgres}
DB_PASSWORD=${PGPASSWORD:-password}
DB_NAME=${PGDATABASE:-fraud_detection}

echo "Setting up PostgreSQL database for Fraud Detection System..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "Error: PostgreSQL client (psql) is not installed or not in PATH"
  exit 1
fi

# Check connection to PostgreSQL
echo "Testing connection to PostgreSQL server..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c '\q' &> /dev/null; then
  echo "Error: Could not connect to PostgreSQL server. Please check your connection settings."
  exit 1
fi

# Check if database exists
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo "Database '$DB_NAME' already exists"
else
  echo "Creating database '$DB_NAME'..."
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" &> /dev/null
  echo "Database created."
fi

# Run database migrations
echo "Running database migrations..."
npm run db:push

echo "Database setup complete!"