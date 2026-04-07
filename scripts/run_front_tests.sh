#!/bin/bash

set -e

echo ""
echo "=========================================="
echo "Running Frontend Tests"
echo "=========================================="
docker compose exec frontend npm run test

echo ""
echo "=========================================="
echo "Frontend tests completed!"
echo "=========================================="
