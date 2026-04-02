#!/bin/bash
docker compose exec db psql -h localhost -U postgres -d localdb
