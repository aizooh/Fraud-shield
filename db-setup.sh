#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
  # Note: This method can be fragile with complex values in .env
  export $(grep -v '^#' .env | sed 's/\r$//' | xargs)
fi

# Default database values if not set in environment (CORRECT SYNTAX)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-frauduser1}
DB_PASSWORD=${DB_PASSWORD:-root} # Be careful with default passwords!
DB_NAME=${DB_NAME:-fraudshield}

echo "Setting up PostgreSQL database using:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
# Avoid echoing the password for security

# Check if psql is available
# ... (rest of the script) ...

# Check connection to PostgreSQL
echo "Testing connection to PostgreSQL server..."
# Explicitly check if DB_PASSWORD is set, otherwise psql might prompt interactively
if [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_PASSWORD is not set. Cannot proceed."
  exit 1
fi

# Use PGPASSWORD environment variable for psql
export PGPASSWORD=$DB_PASSWORD
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q'; then
  echo "Error: Could not connect to PostgreSQL server with user '$DB_USER'."
  echo "Please check:"
  echo "  1. PostgreSQL server is running on $DB_HOST:$DB_PORT."
  echo "  2. User '$DB_USER' exists."
  echo "  3. Password provided for '$DB_USER' is correct."
  echo "  4. User '$DB_USER' has connection permissions (check pg_hba.conf)."
  unset PGPASSWORD # Unset password variable after use
  exit 1
fi
echo "Connection successful."

# Check if database exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "Database '$DB_NAME' already exists"
else
  echo "Creating database '$DB_NAME'..."
  # Ensure the user has CREATEDB privilege or run as a superuser
  if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"; then
     echo "Error: Failed to create database '$DB_NAME'. Check user privileges."
     unset PGPASSWORD
     exit 1
  fi
  echo "Database created."
fi

# Grant privileges (Example - uncomment and adjust if needed)
# echo "Granting privileges on database '$DB_NAME' to user '$DB_USER'..."
# if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";"; then
#    echo "Warning: Failed to grant privileges. Migrations might fail."
# fi

# Run database migrations
echo "Running database migrations (npm run db:push)..."
# db:push usually connects to the specific database ($DB_NAME)
# Ensure the connection string used by db:push (likely via schema.prisma or similar)
# uses the same credentials (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
if ! npm run db:push; then
  echo "Error: Database migration command (npm run db:push) failed."
  unset PGPASSWORD
  exit 1
fi

unset PGPASSWORD # Unset password variable at the end
echo "Database setup complete!"