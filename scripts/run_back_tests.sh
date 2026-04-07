#!/bin/bash

set -e

echo "=========================================="
echo "Running Backend Tests"
echo "=========================================="
docker compose exec backend poetry run pytest app/tests

echo ""
echo "=========================================="
echo "Backend tests completed!"
echo "=========================================="
