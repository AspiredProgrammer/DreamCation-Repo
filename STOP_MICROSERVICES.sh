#!/bin/bash

# DreamCation Microservices Stop Script

echo "🛑 Stopping DreamCation Microservices..."

if [ -f /tmp/dreamcation-pids.txt ]; then
    while read -r pid; do
        if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
            kill $pid
            echo "✅ Stopped process $pid"
        fi
    done < /tmp/dreamcation-pids.txt
    
    # Kill any remaining Node processes on our ports
    for port in 8001 8002 8003 8004 8005 8006 3001; do
        PID=$(lsof -ti:$port)
        if [ ! -z "$PID" ]; then
            kill $PID
            echo "✅ Killed process on port $port"
        fi
    done
    
    rm /tmp/dreamcation-pids.txt
    echo "✅ All services stopped"
else
    echo "❌ No running services found"
fi

