#!/bin/bash

# DreamCation Microservices Stop Script

echo "🛑 Stopping DreamCation Microservices..."

kill -9 $(lsof -t -i :8001 -i :8002 -i :8003 -i :8004 -i :8005 -i :8006 -i :3001)

