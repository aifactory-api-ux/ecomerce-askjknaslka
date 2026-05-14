# E-Commerce Platform

A full-stack e-commerce application with microservices architecture.

## Architecture

- **Backend Services** (Node.js/Express)
  - `api-service` (port 23001): Products, categories, cart, orders
  - `auth-service` (port 23002): Authentication, user management
  - `order-service` (port 23003): Order processing
- **Frontend**: Next.js React application
- **Infrastructure**: PostgreSQL, Redis, RabbitMQ, Nginx

## Quick Start

```bash
./run.sh
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 23000 | Next.js web application |
| api-service | 23001 | Product/category/cart API |
| auth-service | 23002 | Authentication service |
| order-service | 23003 | Order management |
| nginx | 28080 | API Gateway |
| postgres | 25432 | PostgreSQL database |
| redis | 26379 | Redis cache |
| rabbitmq | 25672 | Message queue |

## Tech Stack

- Backend: Node.js v20.11.1, Express.js v4.18.2, TypeScript v5.3.3
- Frontend: React v18.2.0, Next.js v14.0.4
- Database: PostgreSQL v15.5, Redis v7.2.4
- Messaging: RabbitMQ v3.12
- Container: Docker v24.0, Kubernetes v1.29