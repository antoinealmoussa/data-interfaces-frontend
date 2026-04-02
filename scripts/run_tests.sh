#!/bin/bash

set -e

echo "=========================================="
echo "Running Backend Tests"
echo "=========================================="
docker compose exec backend poetry run pytest app/tests

echo ""
echo "=========================================="
echo "Running Frontend Tests"
echo "=========================================="
docker compose exec frontend npm run test

echo ""
echo "=========================================="
echo "All tests completed!"
echo "=========================================="
