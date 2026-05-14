#!/bin/bash
set -e

echo ">>> Starting all services..."

docker-compose up -d

echo ">>> Waiting for database to be ready..."
sleep 10

echo ">>> All services started!"
echo ""
echo "Services available at:"
echo "  - Frontend:      http://localhost:23000"
echo "  - API Service:   http://localhost:23001"
echo "  - Auth Service:  http://localhost:23002"
echo "  - Order Service: http://localhost:23003"
echo "  - Nginx:         http://localhost:28080"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"