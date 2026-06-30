#!/bin/bash

set -e

echo "=========================================="
echo "Running Backend Tests"
echo "=========================================="
docker compose exec backend poetry run pytest app/tests app/applications/rugby_teams/tests

echo ""
echo "=========================================="
echo "Backend tests completed!"
echo "=========================================="
