# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Node.js v20.11.1
  - Express.js v4.18.2
  - PostgreSQL v15.5
  - Redis v7.2.4
  - RabbitMQ v3.12
- **Frontend**
  - React v18.2.0
  - Next.js v14.0.4
- **API Gateway**
  - Nginx v1.25
- **Containerization & Orchestration**
  - Docker v24.0
  - Docker Compose v2.24
  - Kubernetes v1.29
- **Other**
  - TypeScript v5.3.3

---

## 2. DATA CONTRACTS

### TypeScript Interfaces (Backend & Frontend)

```typescript
// Product
export interface Product {
  id: string; // UUID
  name: string;
  description: string;
  price: number; // in cents
  stock: number;
  categoryId: string;
  imageUrl: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// Category
export interface Category {
  id: string; // UUID
  name: string;
  description: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// User
export interface User {
  id: string; // UUID
  email: string;
  passwordHash: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// CartItem
export interface CartItem {
  productId: string;
  quantity: number;
}

// Cart
export interface Cart {
  id: string; // UUID
  userId: string;
  items: CartItem[];
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// OrderItem
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // in cents
}

// Order
export interface Order {
  id: string; // UUID
  userId: string;
  items: OrderItem[];
  total: number; // in cents
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// AuthToken
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}
```

---

## 3. API ENDPOINTS

### Product Endpoints

- **GET /api/products**
  - Response: `Product[]`
- **GET /api/products/:id**
  - Response: `Product`
- **POST /api/products**
  - Request: `Omit<Product, 'id' | 'createdAt' | 'updatedAt'>`
  - Response: `Product`
- **PUT /api/products/:id**
  - Request: `Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>`
  - Response: `Product`
- **DELETE /api/products/:id**
  - Response: `{ success: boolean }`

### Category Endpoints

- **GET /api/categories**
  - Response: `Category[]`
- **GET /api/categories/:id**
  - Response: `Category`
- **POST /api/categories**
  - Request: `Omit<Category, 'id' | 'createdAt' | 'updatedAt'>`
  - Response: `Category`
- **PUT /api/categories/:id**
  - Request: `Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>`
  - Response: `Category`
- **DELETE /api/categories/:id**
  - Response: `{ success: boolean }`

### User Endpoints

- **POST /api/auth/register**
  - Request: `{ email: string; password: string; name: string; address: string; phone: string }`
  - Response: `User`
- **POST /api/auth/login**
  - Request: `{ email: string; password: string }`
  - Response: `AuthToken`
- **GET /api/users/me**
  - Auth: Bearer token
  - Response: `User`

### Cart Endpoints

- **GET /api/cart**
  - Auth: Bearer token
  - Response: `Cart`
- **POST /api/cart/items**
  - Request: `{ productId: string; quantity: number }`
  - Response: `Cart`
- **PUT /api/cart/items/:productId**
  - Request: `{ quantity: number }`
  - Response: `Cart`
- **DELETE /api/cart/items/:productId**
  - Response: `Cart`

### Order Endpoints

- **POST /api/orders**
  - Request: `{ items: { productId: string; quantity: number }[] }`
  - Response: `Order`
- **GET /api/orders**
  - Auth: Bearer token
  - Response: `Order[]`
- **GET /api/orders/:id**
  - Auth: Bearer token
  - Response: `Order`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service         | Listening Port | Path                      |
|-----------------|---------------|---------------------------|
| api-service     | 23001         | backend/api-service/      |
| auth-service    | 23002         | backend/auth-service/     |
| order-service   | 23003         | backend/order-service/    |

### SHARED MODULES

| Shared path         | Imported by services                      |
|---------------------|-------------------------------------------|
| backend/shared/     | api-service, auth-service, order-service  |

### FILE TREE

```
.
├── docker-compose.yml                # Multi-service orchestration (all ports 21000–65000)
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── README.md                        # Project documentation
├── run.sh                           # Root startup script
├── backend/
│   ├── shared/                      # Shared TypeScript modules (models, utils)
│   │   ├── models.ts                # All shared interfaces (Product, User, etc.)
│   │   ├── db.ts                    # Shared DB connection logic
│   │   └── utils.ts                 # Shared utility functions
│   ├── api-service/
│   │   ├── Dockerfile               # Dockerfile for API service (EXPOSE 23001)
│   │   ├── src/
│   │   │   ├── index.ts             # Express app entry point
│   │   │   ├── routes/              # Express routers
│   │   │   │   ├── products.ts      # Product endpoints
│   │   │   │   ├── categories.ts    # Category endpoints
│   │   │   │   ├── cart.ts          # Cart endpoints
│   │   │   │   └── orders.ts        # Order endpoints
│   │   │   ├── controllers/         # Route handlers
│   │   │   │   ├── productController.ts
│   │   │   │   ├── categoryController.ts
│   │   │   │   ├── cartController.ts
│   │   │   │   └── orderController.ts
│   │   │   ├── middlewares/         # Express middlewares
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   └── app.ts               # Express app setup
│   │   └── package.json             # Service dependencies
│   ├── auth-service/
│   │   ├── Dockerfile               # Dockerfile for Auth service (EXPOSE 23002)
│   │   ├── src/
│   │   │   ├── index.ts             # Express app entry point
│   │   │   ├── routes/              # Auth/user endpoints
│   │   │   │   ├── auth.ts
│   │   │   │   └── users.ts
│   │   │   ├── controllers/
│   │   │   │   ├── authController.ts
│   │   │   │   └── userController.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   └── app.ts
│   │   └── package.json
│   ├── order-service/
│   │   ├── Dockerfile               # Dockerfile for Order service (EXPOSE 23003)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── orders.ts
│   │   │   ├── controllers/
│   │   │   │   └── orderController.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   └── app.ts
│   │   └── package.json
├── frontend/
│   ├── Dockerfile                   # Dockerfile for Next.js frontend
│   ├── next.config.js               # Next.js configuration
│   ├── package.json                 # Frontend dependencies
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/
│   │   │   ├── _app.tsx
│   │   │   ├── index.tsx
│   │   │   ├── products/
│   │   │   │   └── [id].tsx
│   │   │   ├── categories/
│   │   │   │   └── [id].tsx
│   │   │   ├── cart.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── OrderList.tsx
│   │   │   ├── AuthForm.tsx
│   │   │   └── Layout.tsx
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useOrders.ts
│   │   │   └── useAuth.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── styles/
│   │   │   ├── tokens.ts            # Design tokens (colors, spacing, etc.)
│   │   │   └── globals.css
│   │   └── utils/
│   │       └── api.ts
├── k8s/
│   ├── api-service-deployment.yaml
│   ├── auth-service-deployment.yaml
│   ├── order-service-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-deployment.yaml
│   ├── redis-deployment.yaml
│   ├── rabbitmq-deployment.yaml
│   ├── nginx-deployment.yaml
│   └── ingress.yaml
```

---

## 5. ENVIRONMENT VARIABLES

| Name                    | Type   | Description                                    | Example Value                |
|-------------------------|--------|------------------------------------------------|-----------------------------|
| NODE_ENV                | string | Node environment (development/production)      | production                  |
| POSTGRES_HOST           | string | PostgreSQL host                                | postgres                    |
| POSTGRES_PORT           | number | PostgreSQL port                                | 5432                        |
| POSTGRES_USER           | string | PostgreSQL user                                | ecommerce                   |
| POSTGRES_PASSWORD       | string | PostgreSQL password                            | secretpassword              |
| POSTGRES_DB             | string | PostgreSQL database name                       | ecommerce                   |
| REDIS_HOST              | string | Redis host                                     | redis                       |
| REDIS_PORT              | number | Redis port                                     | 6379                        |
| RABBITMQ_HOST           | string | RabbitMQ host                                  | rabbitmq                    |
| RABBITMQ_PORT           | number | RabbitMQ port                                  | 5672                        |
| JWT_SECRET              | string | JWT signing secret                             | supersecretjwtkey           |
| JWT_EXPIRES_IN          | number | JWT expiration in seconds                      | 3600                        |
| FRONTEND_URL            | string | Public frontend URL                            | http://localhost:3000       |
| API_URL                 | string | Public API Gateway URL                         | http://localhost:23001      |
| PORT                    | number | Service listening port (per service)           | 23001, 23002, 23003         |
| SESSION_SECRET          | string | Session secret for express-session             | sessionsecret               |
| NEXT_PUBLIC_API_URL     | string | Frontend: API base URL                         | http://localhost:23001      |

---

## 6. IMPORT CONTRACTS

### backend/shared/models.ts

```typescript
import { Product, Category, User, Cart, CartItem, Order, OrderItem, AuthToken } from './models';
```

### backend/shared/db.ts

```typescript
import { getDbConnection, closeDbConnection } from './db';
```

### backend/shared/utils.ts

```typescript
import { hashPassword, comparePassword, generateUUID } from './utils';
```

### backend/api-service/src/routes/products.ts

```typescript
import { Product } from '../../../shared/models';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
```

### backend/api-service/src/middlewares/auth.ts

```typescript
import { authenticate } from './auth';
```

### frontend/src/hooks/useProducts.ts

```typescript
import { useProducts } from './useProducts';
```

### frontend/src/context/AuthContext.tsx

```typescript
import { AuthContext, AuthProvider, useAuth } from './AuthContext';
```

### frontend/src/styles/tokens.ts

```typescript
import { tokens } from './tokens';
```

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### React Hooks

- `useProducts() → { products: Product[], loading: boolean, error: string | null, fetchProducts: () => void }`
- `useCategories() → { categories: Category[], loading: boolean, error: string | null, fetchCategories: () => void }`
- `useCart() → { cart: Cart | null, loading: boolean, error: string | null, addToCart: (productId: string, quantity: number) => void, updateCartItem: (productId: string, quantity: number) => void, removeFromCart: (productId: string) => void }`
- `useOrders() → { orders: Order[], loading: boolean, error: string | null, createOrder: (items: { productId: string, quantity: number }[]) => void }`
- `useAuth() → { user: User | null, loading: boolean, error: string | null, login: (email: string, password: string) => void, register: (data: { email: string, password: string, name: string, address: string, phone: string }) => void, logout: () => void }`

### Context Providers

- `AuthContext → { user: User | null, login, register, logout, loading, error }`
- `CartContext → { cart: Cart | null, addToCart, updateCartItem, removeFromCart, loading, error }`

### Components

- `ProductList  props: { products: Product[], onAddToCart: (productId: string) => void }`
- `ProductCard  props: { product: Product, onAddToCart: (productId: string) => void }`
- `CategoryList props: { categories: Category[], onSelect: (categoryId: string) => void }`
- `Cart        props: { cart: Cart | null, onUpdate: (productId: string, quantity: number) => void, onRemove: (productId: string) => void }`
- `OrderList   props: { orders: Order[] }`
- `AuthForm    props: { onSubmit: (data: { email: string, password: string }) => void, loading: boolean, error: string | null }`
- `Layout      props: { children: React.ReactNode }`

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` (TypeScript React).
- The project is TypeScript throughout (backend and frontend).
- Entry point: `/src/pages/_app.tsx` (referenced by Next.js automatically).

---

## 9. DESIGN TOKENS

```typescript
export const tokens = {
  colors: {
    primary: '#4B2E83',
    secondary: '#F6C700',
    accent: '#F9A826',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#222222',
    muted: '#888888',
    error: '#D7263D',
    success: '#1BC47D',
    warning: '#FFB400'
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSizeBase: '1rem',
    fontSizeSm: '0.875rem',
    fontSizeLg: '1.25rem',
    fontWeightRegular: 400,
    fontWeightBold: 700,
    lineHeightBase: 1.5
  },
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
    16: '4rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 8px rgba(0,0,0,0.10)',
    lg: '0 8px 24px rgba(0,0,0,0.15)'
  }
};
```
