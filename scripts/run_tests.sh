#!/bin/bash

set -e

./scripts/run_back_tests.sh
./scripts/run_front_tests.sh

echo ""
echo "=========================================="
echo "All tests completed!"
echo "=========================================="
