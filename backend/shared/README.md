# Shared Module

Shared TypeScript types, database utilities, and helper functions for all backend services.

## Exports

- `Product`, `Category`, `User`, `Cart`, `CartItem`, `Order`, `OrderItem`, `AuthToken` interfaces from `models.ts`
- `getDbConnection()`, `closeDbConnection()`, `getRedisConnection()`, `closeRedisConnection()` from `db.ts`
- Utility functions: `generateUUID`, `formatDate`, `validateInput`, `hashPassword`, `comparePassword`, `structuredLog`, `handleError`, logging functions from `utils.ts`