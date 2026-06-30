---
description: Run front tests and correct failing ones
agent: build
model: opencode/big-pickle
---

First, ensure that docker containers are active, the following bash command must return an array with at least 2 containers :
`docker ps`

If the containers are not active, up them with the following command :
`docker compose up -d`

If they are active, or after activating them, run the front test suite :
`./scripts/run_front_tests.sh`

If there are failing tests, focus on resolving them and do not stop until they are all fixed.

When all tests pass, and only when all tests pass, press `q` to exit the test interface.
