#!/bin/sh
set -e

# IMPORTANT : On utilise 'db' comme hôte car c'est le nom du service Docker
DB_URL="postgresql://postgres:postgres@db:5432/localdb"

for file in /migrations/*.sql; do
    filename=$(basename "$file")
    num=$(echo "$filename" | cut -d'_' -f1)

    # On vérifie si la migration existe
    ALREADY_DONE=$(psql $DB_URL -tAc "SELECT 1 FROM schema_migrations WHERE version='$num';" 2>/dev/null || echo "0")
    
    if [ "$ALREADY_DONE" != "1" ]; then
        echo "🚀 Application de la migration $num..."
        { cat "$file"; echo "INSERT INTO schema_migrations (version) VALUES ('$num');"; } | psql $DB_URL --set ON_ERROR_STOP=1
    else
        echo "⏭️  $filename déjà appliqué"
    fi
done