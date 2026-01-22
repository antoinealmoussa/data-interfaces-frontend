#!/bin/bash

set -e

MIGRATIONS_DIR="./migrations"

for file in $(ls $MIGRATIONS_DIR/*.sql | sort); do
	filename=$(basename "$file")
	num=${filename%_*}

	ALREADY_DONE=$(docker-compose exec -T db psql -h localhost -U postgres -d localdb -tAc "SELECT 1 FROM schema_migrations WHERE version='$num'")
	
	if [ "$ALREADY_DONE" != "1" ]; then
		echo "Application de la migration $num"
		cat "$file" | docker-compose exec -T db psql -h localhost -U postgres -d localdb --set ON_ERROR_STOP=1
		echo "Migration $num appliquée"
	else
		echo "$filename déjà appliqué"
	fi
done