# MASTER DEVELOPMENT PLAN

> Fuente de verdad única. Los nombres de clases, fields, rutas y variables
> definidos en §1 son los ÚNICOS válidos — el coder no puede inventar nombres.

> ⚠️ **ORDEN DE IMPLEMENTACIÓN GLOBAL — NO NEGOCIABLE:**
> 1. Implementa **TODOS** los ítems marcados 🔴 TEST (de todos los waves) antes de escribir cualquier ítem 🟢 PROD.
> 2. Una vez escritos todos los tests, implementa los ítems 🟢 PROD.
> 3. Si no hay ítems 🔴 TEST, implementa los 🟢 PROD directamente.
> Razón: el código de producción debe ser escrito sabiendo qué contratos deben satisfacer los tests.

---

# §1 Contratos Globales

## §1.1 Especificación Técnica — Stack, Modelos, Estructura, Env Vars

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

## §1.2 Contrato API (OpenAPI 3.1)
> Ref obligatoria para tests de endpoints: usa los paths, schemas y status codes exactos de aquí.

```yaml
openapi: 3.1.0
info:
  title: Derived API Contract
  version: 1.0.0
paths:
  /api/auth/login:
    post:
      operationId: post_api_auth_login
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/auth/register:
    post:
      operationId: post_api_auth_register
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/cart:
    get:
      operationId: get_api_cart
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
  /api/cart/items:
    post:
      operationId: post_api_cart_items
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/cart/items/:productId:
    delete:
      operationId: delete_api_cart_items_productId
      responses:
        '204':
          description: Derived from SPEC.md
    put:
      operationId: put_api_cart_items_productId
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/categories:
    get:
      operationId: get_api_categories
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
    post:
      operationId: post_api_categories
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/categories/:id:
    delete:
      operationId: delete_api_categories_id
      responses:
        '204':
          description: Derived from SPEC.md
    get:
      operationId: get_api_categories_id
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
    put:
      operationId: put_api_categories_id
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/orders:
    get:
      operationId: get_api_orders
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
    post:
      operationId: post_api_orders
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/orders/:id:
    get:
      operationId: get_api_orders_id
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
  /api/products:
    get:
      operationId: get_api_products
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
    post:
      operationId: post_api_products
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/products/:id:
    delete:
      operationId: delete_api_products_id
      responses:
        '204':
          description: Derived from SPEC.md
    get:
      operationId: get_api_products_id
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
    put:
      operationId: put_api_products_id
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/users/me:
    get:
      operationId: get_api_users_me
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
```

## §1.3 Archivos de Test y Scripts a Crear (TDD — complemento de la estructura §1.1)
> La FILE STRUCTURE de §1.1 fue generada antes de los specs TDD — no incluye `tests/` ni `run_tests.sh`.
> Los siguientes archivos son OBLIGATORIOS. Créalos en los paths exactos indicados.
> ⚠️  NUNCA usar archivos `.spec.*` co-ubicados con el source.

**Scripts de ejecución (crear y hacer chmod +x):**
- `backend/api-service/run_tests.sh`
- `backend/auth-service/run_tests.sh`
- `backend/order-service/run_tests.sh`
- `backend/shared/run_tests.sh`

**Archivos de test (crear en los paths exactos):**
- `backend/api-service/tests/test_app.py`
- `backend/api-service/tests/test_auth.py`
- `backend/api-service/tests/test_cart.py`
- `backend/api-service/tests/test_cartController.py`
- `backend/api-service/tests/test_categories.py`
- `backend/api-service/tests/test_categoryController.py`
- `backend/api-service/tests/test_errorHandler.py`
- `backend/api-service/tests/test_index.py`
- `backend/api-service/tests/test_orderController.py`
- `backend/api-service/tests/test_orders.py`
- `backend/api-service/tests/test_productController.py`
- `backend/api-service/tests/test_products.py`
- `backend/auth-service/tests/test_auth.py`
- `backend/auth-service/tests/test_auth_middleware.py`
- `backend/auth-service/tests/test_errorHandler.py`
- `backend/auth-service/tests/test_users.py`
- `backend/order-service/tests/test_app.py`
- `backend/order-service/tests/test_auth.py`
- `backend/order-service/tests/test_errorHandler.py`
- `backend/order-service/tests/test_index.py`
- `backend/order-service/tests/test_orderController.py`
- `backend/order-service/tests/test_orders.py`
- `backend/shared/tests/test_db.py`
- `backend/shared/tests/test_models.py`
- `backend/shared/tests/test_utils.py`

---

# §2 Plan de Implementación

> **REGLA TDD OBLIGATORIA**
> 1. Escribe el ítem 🔴 TEST completo antes de tocar el ítem 🟢 PROD.
> 2. Corre los tests: deben fallar (RED). Si pasan sin código de producción, el test está mal.
> 3. Escribe el código de producción mínimo para que pasen (GREEN).
> 4. Si los tests fallan después del paso 3, corrige SOLO producción — nunca los tests.

## Wave 1

### 🟢 PROD — run_tests.sh — backend/api-service
> Crea el archivo `backend/api-service/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/api-service/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/api-service] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/api-service] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_api-service.txt
echo ">>> [backend/api-service] Done."
```

Luego ejecuta: `chmod +x backend/api-service/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/auth-service
> Crea el archivo `backend/auth-service/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/auth-service/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/auth-service] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/auth-service] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_auth-service.txt
echo ">>> [backend/auth-service] Done."
```

Luego ejecuta: `chmod +x backend/auth-service/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/order-service
> Crea el archivo `backend/order-service/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/order-service/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/order-service] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/order-service] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_order-service.txt
echo ">>> [backend/order-service] Done."
```

Luego ejecuta: `chmod +x backend/order-service/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/shared
> Crea el archivo `backend/shared/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/shared/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/shared] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/shared] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_shared.txt
echo ">>> [backend/shared] Done."
```

Luego ejecuta: `chmod +x backend/shared/run_tests.sh`

### 🔴 TEST — Tests: backend/shared/models.ts
> Ref: §1.1 (modelos de `backend/shared/models.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_models.py`

**Casos de prueba (implementar todos):**
- `test_product_interface_fields_and_types`: Verify that the Product interface defines all required fields with correct types as per SPEC.md.
  - Expected: `{'fields': [{'name': 'id', 'type': 'string'}, {'name': 'name', 'type': 'string'}, {'name': 'description', 'type': 'string'}, {'name': 'price', 'type': 'number'}, {'name': 'stock', 'type': 'number'}, {'name': 'categoryId', 'type': 'string'}, {'name': 'imageUrl', 'type': 'string'}, {'name': 'createdAt', 'type': 'string'}, {'name': 'updatedAt', 'type': 'string'}]}`
- `test_user_interface_missing_required_field_raises_error`: Attempting to instantiate a User object missing a required field (e.g., email) should raise a validation/type error.
  - Input: `{'user': {'id': 'uuid', 'passwordHash': 'hash', 'name': 'Test User', 'address': '123 Main St', 'phone': '555-1234', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}}`
  - Expected: `{'error': 'Missing required field: email'}`
- `test_cartitem_quantity_edge_case_zero`: Creating a CartItem with quantity=0 should be invalid and raise a validation error.
  - Input: `{'cartItem': {'productId': 'uuid', 'quantity': 0}}`
  - Expected: `{'error': 'quantity must be greater than 0'}`
- `test_order_status_enum_accepts_only_valid_values`: Order.status should only accept one of the allowed enum values: 'pending', 'paid', 'shipped', 'delivered', 'cancelled'.
  - Input: `{'order': {'id': 'uuid', 'userId': 'uuid', 'items': [], 'total': 1000, 'status': 'processing', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}}`
  - Expected: `{'error': 'Invalid status value: processing'}`
- `test_authtoken_interface_fields_and_types`: Verify that the AuthToken interface defines accessToken, refreshToken, and expiresIn with correct types.
  - Expected: `{'fields': [{'name': 'accessToken', 'type': 'string'}, {'name': 'refreshToken', 'type': 'string'}, {'name': 'expiresIn', 'type': 'number'}]}`

### 🔴 TEST — Tests: backend/shared/db.ts
> Ref: §1.1 (modelos de `backend/shared/db.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_db.py`

**Casos de prueba (implementar todos):**
- `test_postgresql_connection_success`: Connecting to PostgreSQL with valid config should establish a connection and allow a simple query.
  - Input: `{'env': {'POSTGRES_HOST': 'localhost', 'POSTGRES_PORT': '5432', 'POSTGRES_USER': 'testuser', 'POSTGRES_PASSWORD': 'testpass', 'POSTGRES_DB': 'testdb'}}`
  - Expected: `{'connection': 'success', 'query_result': 'ok'}`
- `test_redis_connection_success`: Connecting to Redis with valid config should establish a connection and allow a simple set/get operation.
  - Input: `{'env': {'REDIS_HOST': 'localhost', 'REDIS_PORT': '6379'}}`
  - Expected: `{'connection': 'success', 'set_get': 'ok'}`
- `test_missing_postgres_env_vars_raises_error`: If required PostgreSQL environment variables are missing, the connection logic should raise a configuration error.
  - Input: `{'env': {'POSTGRES_HOST': '', 'POSTGRES_PORT': '', 'POSTGRES_USER': '', 'POSTGRES_PASSWORD': '', 'POSTGRES_DB': ''}}`
  - Expected: `{'error': 'Missing required PostgreSQL environment variables'}`
- `test_invalid_redis_port_raises_error`: Providing a non-numeric REDIS_PORT should raise a configuration or connection error.
  - Input: `{'env': {'REDIS_HOST': 'localhost', 'REDIS_PORT': 'notaport'}}`
  - Expected: `{'error': 'Invalid REDIS_PORT value'}`
- `test_db_pooling_reuses_connections`: Database pooling should reuse connections for multiple queries within the same session.
  - Expected: `{'pooling': 'connections reused'}`

### 🔴 TEST — Tests: backend/shared/utils.ts
> Ref: §1.1 (modelos de `backend/shared/utils.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_utils.py`

**Casos de prueba (implementar todos):**
- `test_generate_uuid_returns_valid_uuid`: The generateUUID utility should return a valid UUID v4 string.
  - Expected: `{'uuid_format': 'v4'}`
- `test_format_date_returns_iso8601_string`: The formatDate utility should return a string in ISO8601 format for a given date input.
  - Input: `{'date': '2024-01-01T12:34:56Z'}`
  - Expected: `{'output_format': 'ISO8601'}`
- `test_validate_input_missing_required_field_raises_error`: validateInput utility should raise a validation error if a required field is missing from the input object.
  - Input: `{'schema': {'required': ['email', 'password']}, 'data': {'email': 'user@test.com'}}`
  - Expected: `{'error': 'Missing required field: password'}`
- `test_structured_logging_outputs_expected_format`: The logging utility should output logs in structured JSON format with level, message, and timestamp.
  - Input: `{'level': 'info', 'message': 'Test log'}`
  - Expected: `{'log_format': 'structured_json', 'fields': ['level', 'message', 'timestamp']}`
- `test_handle_error_returns_standardized_error_object`: The handleError utility should return a standardized error object with message and code fields.
  - Input: `{'error': {'message': 'Something went wrong', 'code': 500}}`
  - Expected: `{'fields': ['message', 'code']}`

### 🔴 TEST — Tests: backend/api-service/products.py
> Ref: §1.1 (modelos de `backend/api-service/products.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_products.py`

**Casos de prueba (implementar todos):**
- `test_get_products_returns_all_products`: GET /api/products returns 200 and a list of all products with correct fields
  - Expected: `{'status_code': 200, 'body_type': 'list', 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_post_products_valid_data_creates_product`: POST /api/products with valid data returns 201 and the created product with all fields
  - Input: `{'name': 'Test Product', 'description': 'A test product', 'price': 1000, 'stock': 10, 'categoryId': 'cat-uuid-1', 'imageUrl': 'http://example.com/image.png'}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_post_products_missing_required_field_returns_422`: POST /api/products missing 'name' returns 422 Unprocessable Entity
  - Input: `{'description': 'A test product', 'price': 1000, 'stock': 10, 'categoryId': 'cat-uuid-1', 'imageUrl': 'http://example.com/image.png'}`
  - Expected: `{'status_code': 422}`
- `test_get_product_by_id_returns_product`: GET /api/products/:id with valid id returns 200 and the correct product
  - Input: `{'id': 'prod-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_get_product_by_invalid_id_returns_404`: GET /api/products/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`
- `test_put_product_partial_update`: PUT /api/products/:id with partial data updates only provided fields and returns updated product
  - Input: `{'id': 'prod-uuid-1', 'body': {'price': 1500}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_delete_product_returns_success_true`: DELETE /api/products/:id returns 204 and success true if product existed
  - Input: `{'id': 'prod-uuid-1'}`
  - Expected: `{'status_code': 204, 'body': {'success': True}}`
- `test_delete_product_nonexistent_returns_404`: DELETE /api/products/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/api-service/categories.py
> Ref: §1.1 (modelos de `backend/api-service/categories.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_categories.py`

**Casos de prueba (implementar todos):**
- `test_get_categories_returns_all_categories`: GET /api/categories returns 200 and a list of all categories with correct fields
  - Expected: `{'status_code': 200, 'body_type': 'list', 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_post_categories_valid_data_creates_category`: POST /api/categories with valid data returns 201 and the created category
  - Input: `{'name': 'Electronics', 'description': 'Electronic items'}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_post_categories_missing_name_returns_422`: POST /api/categories missing 'name' returns 422 Unprocessable Entity
  - Input: `{'description': 'Electronic items'}`
  - Expected: `{'status_code': 422}`
- `test_get_category_by_id_returns_category`: GET /api/categories/:id with valid id returns 200 and the correct category
  - Input: `{'id': 'cat-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_get_category_by_invalid_id_returns_404`: GET /api/categories/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`
- `test_put_category_partial_update`: PUT /api/categories/:id with partial data updates only provided fields and returns updated category
  - Input: `{'id': 'cat-uuid-1', 'body': {'description': 'Updated description'}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_delete_category_returns_success_true`: DELETE /api/categories/:id returns 204 and success true if category existed
  - Input: `{'id': 'cat-uuid-1'}`
  - Expected: `{'status_code': 204, 'body': {'success': True}}`
- `test_delete_category_nonexistent_returns_404`: DELETE /api/categories/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/api-service/cart.py
> Ref: §1.1 (modelos de `backend/api-service/cart.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_cart.py`

**Casos de prueba (implementar todos):**
- `test_get_cart_authenticated_returns_cart`: GET /api/cart with valid bearer token returns 200 and the user's cart
  - Input: `{'auth': 'valid_token'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_get_cart_unauthenticated_returns_401`: GET /api/cart without bearer token returns 401 Unauthorized
  - Expected: `{'status_code': 401}`
- `test_post_cart_items_valid_adds_item`: POST /api/cart/items with valid productId and quantity adds item to cart and returns updated cart
  - Input: `{'auth': 'valid_token', 'body': {'productId': 'prod-uuid-1', 'quantity': 2}}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_post_cart_items_invalid_quantity_returns_422`: POST /api/cart/items with negative quantity returns 422 Unprocessable Entity
  - Input: `{'auth': 'valid_token', 'body': {'productId': 'prod-uuid-1', 'quantity': -1}}`
  - Expected: `{'status_code': 422}`
- `test_put_cart_item_updates_quantity`: PUT /api/cart/items/:productId with valid quantity updates item and returns updated cart
  - Input: `{'auth': 'valid_token', 'productId': 'prod-uuid-1', 'body': {'quantity': 5}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_put_cart_item_nonexistent_product_returns_404`: PUT /api/cart/items/:productId with non-existent productId returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'productId': 'non-existent-uuid', 'body': {'quantity': 2}}`
  - Expected: `{'status_code': 404}`
- `test_delete_cart_item_removes_item`: DELETE /api/cart/items/:productId removes item from cart and returns updated cart
  - Input: `{'auth': 'valid_token', 'productId': 'prod-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_delete_cart_item_nonexistent_returns_404`: DELETE /api/cart/items/:productId with non-existent productId returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'productId': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/api-service/orders.py
> Ref: §1.1 (modelos de `backend/api-service/orders.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_orders.py`

**Casos de prueba (implementar todos):**
- `test_post_orders_valid_creates_order`: POST /api/orders with valid items creates order and returns 201 with order details
  - Input: `{'auth': 'valid_token', 'body': {'items': [{'productId': 'prod-uuid-1', 'quantity': 2}]}}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_post_orders_missing_items_returns_422`: POST /api/orders with missing items field returns 422 Unprocessable Entity
  - Input: `{'auth': 'valid_token', 'body': {}}`
  - Expected: `{'status_code': 422}`
- `test_post_orders_invalid_product_id_returns_404`: POST /api/orders with non-existent productId returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'body': {'items': [{'productId': 'non-existent-uuid', 'quantity': 1}]}}`
  - Expected: `{'status_code': 404}`
- `test_get_orders_authenticated_returns_orders`: GET /api/orders with valid bearer token returns 200 and a list of user's orders
  - Input: `{'auth': 'valid_token'}`
  - Expected: `{'status_code': 200, 'body_type': 'list', 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_orders_unauthenticated_returns_401`: GET /api/orders without bearer token returns 401 Unauthorized
  - Expected: `{'status_code': 401}`
- `test_get_order_by_id_returns_order`: GET /api/orders/:id with valid id returns 200 and the correct order
  - Input: `{'auth': 'valid_token', 'id': 'order-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_order_by_invalid_id_returns_404`: GET /api/orders/:id with non-existent id returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🟢 PROD — Foundation — shared types, interfaces, DB schemas, config
> Crear todos los contratos de datos compartidos, utilidades, lógica de conexión a DB, y el esquema SQL inicial. Proveer modelos TypeScript para Product, Category, User, Cart, Order, AuthToken, y utilidades compartidas. Validar variables de entorno y exponer funciones de utilidad para logging y manejo de errores.
**Archivos:**
  - `backend/shared/models.ts`  
  - `backend/shared/db.ts`  
  - `backend/shared/utils.ts`  
  - `backend/shared/README.md`


### 🟢 PROD — Infrastructure & Deployment (REQUIRED — PROJECT MUST RUN)
> Orquestar todos los servicios, bases de datos y dependencias en un entorno local reproducible. Incluye docker-compose.yml con healthchecks y dependencias, .env.example documentado, .gitignore y .dockerignore, script run.sh para arranque automatizado, README de uso y docs de arquitectura.
**Archivos:**
  - `docker-compose.yml`  
  - `run.sh`  
  - `README.md`


## Wave 2

### 🔴 TEST — Tests: backend/auth-service/src/routes/auth.ts
> Ref: §1.1 (modelos de `backend/auth-service/src/routes/auth.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/auth-service/tests/test_auth.py`

**Casos de prueba (implementar todos):**
- `test_register_valid_user_returns_201_and_user_object`: POST /api/auth/register with valid fields returns 201 and a User object with correct fields (id, email, name, address, phone, createdAt, updatedAt).
  - Input: `{'email': 'newuser@example.com', 'password': 'StrongPass123!', 'name': 'New User', 'address': '123 Main St', 'phone': '555-1234'}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'email', 'name', 'address', 'phone', 'createdAt', 'updatedAt']}`
- `test_register_missing_required_field_returns_422`: POST /api/auth/register missing 'email' returns 422 Unprocessable Entity.
  - Input: `{'password': 'StrongPass123!', 'name': 'New User', 'address': '123 Main St', 'phone': '555-1234'}`
  - Expected: `{'status_code': 422}`
- `test_register_duplicate_email_returns_409`: POST /api/auth/register with an email that already exists returns 409 Conflict.
  - Input: `{'email': 'existing@example.com', 'password': 'StrongPass123!', 'name': 'Existing User', 'address': '123 Main St', 'phone': '555-1234'}`
  - Expected: `{'status_code': 409}`
- `test_login_valid_credentials_returns_201_and_tokens`: POST /api/auth/login with valid credentials returns 201 and AuthToken object (accessToken, refreshToken, expiresIn).
  - Input: `{'email': 'user1@example.com', 'password': 'ValidPass123!'}`
  - Expected: `{'status_code': 201, 'fields': ['accessToken', 'refreshToken', 'expiresIn']}`
- `test_login_invalid_password_returns_401`: POST /api/auth/login with wrong password returns 401 Unauthorized.
  - Input: `{'email': 'user1@example.com', 'password': 'WrongPass!'}`
  - Expected: `{'status_code': 401}`
- `test_login_missing_email_returns_422`: POST /api/auth/login without email returns 422 Unprocessable Entity.
  - Input: `{'password': 'ValidPass123!'}`
  - Expected: `{'status_code': 422}`
- `test_login_nonexistent_email_returns_401`: POST /api/auth/login with non-existent email returns 401 Unauthorized.
  - Input: `{'email': 'notfound@example.com', 'password': 'AnyPass123!'}`
  - Expected: `{'status_code': 401}`

### 🔴 TEST — Tests: backend/auth-service/src/routes/users.ts
> Ref: §1.1 (modelos de `backend/auth-service/src/routes/users.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/auth-service/tests/test_users.py`

**Casos de prueba (implementar todos):**
- `test_get_me_with_valid_token_returns_user`: GET /api/users/me with valid Bearer token returns 200 and User object with correct fields.
  - Input: `{'headers': {'Authorization': 'Bearer <valid_access_token>'}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'email', 'name', 'address', 'phone', 'createdAt', 'updatedAt']}`
- `test_get_me_with_missing_token_returns_401`: GET /api/users/me without Authorization header returns 401 Unauthorized.
  - Expected: `{'status_code': 401}`
- `test_get_me_with_invalid_token_returns_401`: GET /api/users/me with invalid Bearer token returns 401 Unauthorized.
  - Input: `{'headers': {'Authorization': 'Bearer invalidtoken'}}`
  - Expected: `{'status_code': 401}`
- `test_get_me_with_expired_token_returns_401`: GET /api/users/me with expired Bearer token returns 401 Unauthorized.
  - Input: `{'headers': {'Authorization': 'Bearer <expired_access_token>'}}`
  - Expected: `{'status_code': 401}`

### 🔴 TEST — Tests: backend/auth-service/src/middlewares/auth.ts
> Ref: §1.1 (modelos de `backend/auth-service/src/middlewares/auth.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/auth-service/tests/test_auth_middleware.py`

**Casos de prueba (implementar todos):**
- `test_auth_middleware_allows_valid_jwt`: Middleware allows request to proceed when Authorization header contains a valid JWT.
  - Input: `{'headers': {'Authorization': 'Bearer <valid_access_token>'}}`
  - Expected: `{'proceeds': True}`
- `test_auth_middleware_rejects_missing_token`: Middleware rejects request with 401 when Authorization header is missing.
  - Expected: `{'status_code': 401}`
- `test_auth_middleware_rejects_invalid_token`: Middleware rejects request with 401 when Authorization header contains an invalid JWT.
  - Input: `{'headers': {'Authorization': 'Bearer invalidtoken'}}`
  - Expected: `{'status_code': 401}`
- `test_auth_middleware_rejects_expired_token`: Middleware rejects request with 401 when Authorization header contains an expired JWT.
  - Input: `{'headers': {'Authorization': 'Bearer <expired_access_token>'}}`
  - Expected: `{'status_code': 401}`

### 🔴 TEST — Tests: backend/auth-service/src/middlewares/errorHandler.ts
> Ref: §1.1 (modelos de `backend/auth-service/src/middlewares/errorHandler.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/auth-service/tests/test_errorHandler.py`

**Casos de prueba (implementar todos):**
- `test_error_handler_returns_structured_400_for_validation_error`: Middleware returns structured 400 response for validation errors with error message and details.
  - Input: `{'error': {'type': 'ValidationError', 'message': 'Invalid input', 'details': ['email is required']}}`
  - Expected: `{'status_code': 400, 'fields': ['error', 'details']}`
- `test_error_handler_returns_401_for_auth_error`: Middleware returns 401 response for authentication errors.
  - Input: `{'error': {'type': 'UnauthorizedError', 'message': 'Invalid token'}}`
  - Expected: `{'status_code': 401, 'fields': ['error']}`
- `test_error_handler_returns_500_for_unhandled_error`: Middleware returns 500 response for unhandled exceptions with generic error message.
  - Input: `{'error': {'type': 'Exception', 'message': 'Unexpected error'}}`
  - Expected: `{'status_code': 500, 'fields': ['error']}`

### 🔴 TEST — Tests: backend/api-service/src/app.ts
> Ref: §1.1 (modelos de `backend/api-service/src/app.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_app.py`

**Casos de prueba (implementar todos):**
- `test_app_registers_all_routes_and_middlewares`: App initializes and registers all API routes and middlewares, responds 404 for unknown route.
  - Input: `{'method': 'GET', 'path': '/api/unknown'}`
  - Expected: `{'status_code': 404, 'fields': ['error']}`
- `test_app_handles_json_parsing_error`: App returns 400 Bad Request with error message on invalid JSON body.
  - Input: `{'method': 'POST', 'path': '/api/products', 'body': '{invalid_json'}`
  - Expected: `{'status_code': 400, 'fields': ['error']}`
- `test_app_cors_headers_present`: App responds with CORS headers for OPTIONS preflight request.
  - Input: `{'method': 'OPTIONS', 'path': '/api/products'}`
  - Expected: `{'status_code': 204, 'headers': ['Access-Control-Allow-Origin']}`

### 🔴 TEST — Tests: backend/api-service/src/index.ts
> Ref: §1.1 (modelos de `backend/api-service/src/index.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_index.py`

**Casos de prueba (implementar todos):**
- `test_server_starts_on_configured_port`: Server starts and listens on port 23001 as configured.
  - Expected: `{'port': 23001}`
- `test_server_logs_startup_message`: Server logs a startup message indicating it is running.
  - Expected: `{'log_contains': 'Server listening on port 23001'}`
- `test_server_exits_on_port_in_use`: Server exits with error if port 23001 is already in use.
  - Input: `{'port_in_use': 23001}`
  - Expected: `{'exit_code': 1, 'log_contains': 'EADDRINUSE'}`

### 🔴 TEST — Tests: backend/api-service/src/routes/products.ts
> Ref: §1.1 (modelos de `backend/api-service/products.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_products.py`

**Casos de prueba (implementar todos):**
- `test_get_products_returns_all_products`: GET /api/products returns 200 and a list of all products with correct fields
  - Expected: `{'status_code': 200, 'body_type': 'list', 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_post_products_valid_data_creates_product`: POST /api/products with valid data returns 201 and the created product with all fields
  - Input: `{'name': 'Test Product', 'description': 'A test product', 'price': 1000, 'stock': 10, 'categoryId': 'cat-uuid-1', 'imageUrl': 'http://example.com/image.png'}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_post_products_missing_required_field_returns_422`: POST /api/products missing 'name' returns 422 Unprocessable Entity
  - Input: `{'description': 'A test product', 'price': 1000, 'stock': 10, 'categoryId': 'cat-uuid-1', 'imageUrl': 'http://example.com/image.png'}`
  - Expected: `{'status_code': 422}`
- `test_get_product_by_id_returns_product`: GET /api/products/:id with valid id returns 200 and the correct product
  - Input: `{'id': 'prod-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_get_product_by_invalid_id_returns_404`: GET /api/products/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`
- `test_put_product_partial_update`: PUT /api/products/:id with partial data updates only provided fields and returns updated product
  - Input: `{'id': 'prod-uuid-1', 'body': {'price': 1500}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_delete_product_returns_success_true`: DELETE /api/products/:id returns 204 and success true if product existed
  - Input: `{'id': 'prod-uuid-1'}`
  - Expected: `{'status_code': 204, 'body': {'success': True}}`
- `test_delete_product_nonexistent_returns_404`: DELETE /api/products/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/api-service/src/routes/categories.ts
> Ref: §1.1 (modelos de `backend/api-service/categories.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_categories.py`

**Casos de prueba (implementar todos):**
- `test_get_categories_returns_all_categories`: GET /api/categories returns 200 and a list of all categories with correct fields
  - Expected: `{'status_code': 200, 'body_type': 'list', 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_post_categories_valid_data_creates_category`: POST /api/categories with valid data returns 201 and the created category
  - Input: `{'name': 'Electronics', 'description': 'Electronic items'}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_post_categories_missing_name_returns_422`: POST /api/categories missing 'name' returns 422 Unprocessable Entity
  - Input: `{'description': 'Electronic items'}`
  - Expected: `{'status_code': 422}`
- `test_get_category_by_id_returns_category`: GET /api/categories/:id with valid id returns 200 and the correct category
  - Input: `{'id': 'cat-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_get_category_by_invalid_id_returns_404`: GET /api/categories/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`
- `test_put_category_partial_update`: PUT /api/categories/:id with partial data updates only provided fields and returns updated category
  - Input: `{'id': 'cat-uuid-1', 'body': {'description': 'Updated description'}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_delete_category_returns_success_true`: DELETE /api/categories/:id returns 204 and success true if category existed
  - Input: `{'id': 'cat-uuid-1'}`
  - Expected: `{'status_code': 204, 'body': {'success': True}}`
- `test_delete_category_nonexistent_returns_404`: DELETE /api/categories/:id with non-existent id returns 404 Not Found
  - Input: `{'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/api-service/src/routes/cart.ts
> Ref: §1.1 (modelos de `backend/api-service/cart.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_cart.py`

**Casos de prueba (implementar todos):**
- `test_get_cart_authenticated_returns_cart`: GET /api/cart with valid bearer token returns 200 and the user's cart
  - Input: `{'auth': 'valid_token'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_get_cart_unauthenticated_returns_401`: GET /api/cart without bearer token returns 401 Unauthorized
  - Expected: `{'status_code': 401}`
- `test_post_cart_items_valid_adds_item`: POST /api/cart/items with valid productId and quantity adds item to cart and returns updated cart
  - Input: `{'auth': 'valid_token', 'body': {'productId': 'prod-uuid-1', 'quantity': 2}}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_post_cart_items_invalid_quantity_returns_422`: POST /api/cart/items with negative quantity returns 422 Unprocessable Entity
  - Input: `{'auth': 'valid_token', 'body': {'productId': 'prod-uuid-1', 'quantity': -1}}`
  - Expected: `{'status_code': 422}`
- `test_put_cart_item_updates_quantity`: PUT /api/cart/items/:productId with valid quantity updates item and returns updated cart
  - Input: `{'auth': 'valid_token', 'productId': 'prod-uuid-1', 'body': {'quantity': 5}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_put_cart_item_nonexistent_product_returns_404`: PUT /api/cart/items/:productId with non-existent productId returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'productId': 'non-existent-uuid', 'body': {'quantity': 2}}`
  - Expected: `{'status_code': 404}`
- `test_delete_cart_item_removes_item`: DELETE /api/cart/items/:productId removes item from cart and returns updated cart
  - Input: `{'auth': 'valid_token', 'productId': 'prod-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_delete_cart_item_nonexistent_returns_404`: DELETE /api/cart/items/:productId with non-existent productId returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'productId': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/api-service/src/routes/orders.ts
> Ref: §1.1 (modelos de `backend/api-service/orders.py`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_orders.py`

**Casos de prueba (implementar todos):**
- `test_post_orders_valid_creates_order`: POST /api/orders with valid items creates order and returns 201 with order details
  - Input: `{'auth': 'valid_token', 'body': {'items': [{'productId': 'prod-uuid-1', 'quantity': 2}]}}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_post_orders_missing_items_returns_422`: POST /api/orders with missing items field returns 422 Unprocessable Entity
  - Input: `{'auth': 'valid_token', 'body': {}}`
  - Expected: `{'status_code': 422}`
- `test_post_orders_invalid_product_id_returns_404`: POST /api/orders with non-existent productId returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'body': {'items': [{'productId': 'non-existent-uuid', 'quantity': 1}]}}`
  - Expected: `{'status_code': 404}`
- `test_get_orders_authenticated_returns_orders`: GET /api/orders with valid bearer token returns 200 and a list of user's orders
  - Input: `{'auth': 'valid_token'}`
  - Expected: `{'status_code': 200, 'body_type': 'list', 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_orders_unauthenticated_returns_401`: GET /api/orders without bearer token returns 401 Unauthorized
  - Expected: `{'status_code': 401}`
- `test_get_order_by_id_returns_order`: GET /api/orders/:id with valid id returns 200 and the correct order
  - Input: `{'auth': 'valid_token', 'id': 'order-uuid-1'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_order_by_invalid_id_returns_404`: GET /api/orders/:id with non-existent id returns 404 Not Found
  - Input: `{'auth': 'valid_token', 'id': 'non-existent-uuid'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/api-service/src/controllers/productController.ts
> Ref: §1.1 (modelos de `backend/api-service/src/controllers/productController.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_productController.py`

**Casos de prueba (implementar todos):**
- `test_create_product_valid_data_succeeds`: createProduct with valid data creates and returns Product.
  - Input: `{'name': 'Test Product', 'description': 'A test product', 'price': 1000, 'stock': 10, 'categoryId': 'cat-uuid', 'imageUrl': 'http://example.com/image.png'}`
  - Expected: `{'fields': ['id', 'name', 'description', 'price', 'stock', 'categoryId', 'imageUrl', 'createdAt', 'updatedAt']}`
- `test_create_product_missing_name_raises_validation_error`: createProduct missing 'name' raises validation error.
  - Input: `{'description': 'A test product', 'price': 1000, 'stock': 10, 'categoryId': 'cat-uuid', 'imageUrl': 'http://example.com/image.png'}`
  - Expected: `{'raises': 'ValidationError'}`
- `test_update_product_partial_fields`: updateProduct updates only provided fields and leaves others unchanged.
  - Input: `{'id': 'prod-uuid', 'update': {'price': 2000}}`
  - Expected: `{'fields': ['id', 'price']}`
- `test_delete_product_nonexistent_raises_not_found`: deleteProduct with non-existent id raises NotFound error.
  - Input: `{'id': 'nonexistent-id'}`
  - Expected: `{'raises': 'NotFoundError'}`

### 🔴 TEST — Tests: backend/api-service/src/controllers/categoryController.ts
> Ref: §1.1 (modelos de `backend/api-service/src/controllers/categoryController.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_categoryController.py`

**Casos de prueba (implementar todos):**
- `test_create_category_valid_data_succeeds`: createCategory with valid data creates and returns Category.
  - Input: `{'name': 'Test Category', 'description': 'A test category'}`
  - Expected: `{'fields': ['id', 'name', 'description', 'createdAt', 'updatedAt']}`
- `test_create_category_missing_name_raises_validation_error`: createCategory missing 'name' raises validation error.
  - Input: `{'description': 'A test category'}`
  - Expected: `{'raises': 'ValidationError'}`
- `test_update_category_partial_fields`: updateCategory updates only provided fields and leaves others unchanged.
  - Input: `{'id': 'cat-uuid', 'update': {'description': 'Updated'}}`
  - Expected: `{'fields': ['id', 'description']}`
- `test_delete_category_nonexistent_raises_not_found`: deleteCategory with non-existent id raises NotFound error.
  - Input: `{'id': 'nonexistent-id'}`
  - Expected: `{'raises': 'NotFoundError'}`

### 🔴 TEST — Tests: backend/api-service/src/controllers/cartController.ts
> Ref: §1.1 (modelos de `backend/api-service/src/controllers/cartController.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_cartController.py`

**Casos de prueba (implementar todos):**
- `test_get_cart_for_user_returns_cart`: getCartForUser returns Cart object for given userId.
  - Input: `{'userId': 'user-uuid'}`
  - Expected: `{'fields': ['id', 'userId', 'items', 'createdAt', 'updatedAt']}`
- `test_add_item_to_cart_valid_data_succeeds`: addItemToCart with valid productId and quantity adds item to cart.
  - Input: `{'userId': 'user-uuid', 'productId': 'prod-uuid', 'quantity': 2}`
  - Expected: `{'fields': ['items']}`
- `test_add_item_to_cart_invalid_quantity_raises_validation_error`: addItemToCart with quantity <= 0 raises validation error.
  - Input: `{'userId': 'user-uuid', 'productId': 'prod-uuid', 'quantity': 0}`
  - Expected: `{'raises': 'ValidationError'}`
- `test_update_cart_item_quantity_nonexistent_product_raises_not_found`: updateCartItemQuantity with non-existent productId raises NotFound error.
  - Input: `{'userId': 'user-uuid', 'productId': 'nonexistent', 'quantity': 1}`
  - Expected: `{'raises': 'NotFoundError'}`

### 🔴 TEST — Tests: backend/api-service/src/controllers/orderController.ts
> Ref: §1.1 (modelos de `backend/api-service/src/controllers/orderController.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_orderController.py`

**Casos de prueba (implementar todos):**
- `test_create_order_valid_items_succeeds`: createOrder with valid items creates and returns Order.
  - Input: `{'userId': 'user-uuid', 'items': [{'productId': 'prod-uuid', 'quantity': 2}]}`
  - Expected: `{'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_create_order_missing_items_raises_validation_error`: createOrder missing 'items' raises validation error.
  - Input: `{'userId': 'user-uuid'}`
  - Expected: `{'raises': 'ValidationError'}`
- `test_get_orders_for_user_returns_list`: getOrdersForUser returns list of Order objects for userId.
  - Input: `{'userId': 'user-uuid'}`
  - Expected: `{'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_order_by_id_nonexistent_raises_not_found`: getOrderById with non-existent id raises NotFound error.
  - Input: `{'orderId': 'nonexistent-id', 'userId': 'user-uuid'}`
  - Expected: `{'raises': 'NotFoundError'}`

### 🔴 TEST — Tests: backend/api-service/src/middlewares/auth.ts
> Ref: §1.1 (modelos de `backend/api-service/src/middlewares/auth.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_auth.py`

**Casos de prueba (implementar todos):**
- `test_auth_middleware_valid_token_allows_request`: Auth middleware with valid Bearer token allows request to proceed.
  - Input: `{'headers': {'Authorization': 'Bearer valid_token'}}`
  - Expected: `{'calls_next': True}`
- `test_auth_middleware_missing_token_returns_401`: Auth middleware without Authorization header returns 401 Unauthorized.
  - Input: `{'headers': {}}`
  - Expected: `{'status_code': 401, 'fields': ['error']}`
- `test_auth_middleware_invalid_token_returns_401`: Auth middleware with invalid Bearer token returns 401 Unauthorized.
  - Input: `{'headers': {'Authorization': 'Bearer invalid_token'}}`
  - Expected: `{'status_code': 401, 'fields': ['error']}`

### 🔴 TEST — Tests: backend/api-service/src/middlewares/errorHandler.ts
> Ref: §1.1 (modelos de `backend/api-service/src/middlewares/errorHandler.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-service/tests/test_errorHandler.py`

**Casos de prueba (implementar todos):**
- `test_error_handler_returns_422_for_validation_error`: Error handler returns 422 Unprocessable Entity for validation errors.
  - Input: `{'error': 'ValidationError'}`
  - Expected: `{'status_code': 422, 'fields': ['error']}`
- `test_error_handler_returns_404_for_not_found_error`: Error handler returns 404 Not Found for NotFoundError.
  - Input: `{'error': 'NotFoundError'}`
  - Expected: `{'status_code': 404, 'fields': ['error']}`
- `test_error_handler_returns_500_for_unhandled_error`: Error handler returns 500 Internal Server Error for generic errors.
  - Input: `{'error': 'Exception'}`
  - Expected: `{'status_code': 500, 'fields': ['error']}`

### 🔴 TEST — Tests: backend/order-service/src/app.ts
> Ref: §1.1 (modelos de `backend/order-service/src/app.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_app.py`

**Casos de prueba (implementar todos):**
- `test_app_registers_order_routes`: App should register /api/orders routes and respond to GET /api/orders with 401 if unauthenticated
  - Input: `{'method': 'GET', 'path': '/api/orders', 'headers': {}}`
  - Expected: `{'status_code': 401}`
- `test_app_registers_middlewares`: App should register authentication and error handling middlewares; invalid JWT returns 401
  - Input: `{'method': 'GET', 'path': '/api/orders', 'headers': {'Authorization': 'Bearer invalidtoken'}}`
  - Expected: `{'status_code': 401}`
- `test_app_handles_404_for_unknown_route`: App should return 404 Not Found for unknown routes
  - Input: `{'method': 'GET', 'path': '/api/unknown'}`
  - Expected: `{'status_code': 404}`

### 🔴 TEST — Tests: backend/order-service/src/index.ts
> Ref: §1.1 (modelos de `backend/order-service/src/index.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_index.py`

**Casos de prueba (implementar todos):**
- `test_server_starts_on_correct_port`: Server should start and listen on port 23003
  - Expected: `{'port': 23003}`
- `test_server_handles_startup_error`: Server should handle errors during startup gracefully and log error
  - Input: `{'simulate_error': True}`
  - Expected: `{'error_logged': True}`
- `test_server_shutdown_cleans_up_resources`: Server should clean up resources on shutdown (e.g., DB connections)
  - Input: `{'shutdown': True}`
  - Expected: `{'resources_cleaned': True}`

### 🔴 TEST — Tests: backend/order-service/src/routes/orders.ts
> Ref: §1.1 (modelos de `backend/order-service/src/routes/orders.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_orders.py`

**Casos de prueba (implementar todos):**
- `test_post_api_orders_creates_order_successfully`: POST /api/orders with valid items and authentication returns 201 and Order object
  - Input: `{'method': 'POST', 'path': '/api/orders', 'headers': {'Authorization': 'Bearer validtoken'}, 'json': {'items': [{'productId': 'prod-1', 'quantity': 2}, {'productId': 'prod-2', 'quantity': 1}]}}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_post_api_orders_missing_items_returns_422`: POST /api/orders without items field returns 422 Unprocessable Entity
  - Input: `{'method': 'POST', 'path': '/api/orders', 'headers': {'Authorization': 'Bearer validtoken'}, 'json': {}}`
  - Expected: `{'status_code': 422}`
- `test_post_api_orders_unauthenticated_returns_401`: POST /api/orders without Authorization header returns 401 Unauthorized
  - Input: `{'method': 'POST', 'path': '/api/orders', 'json': {'items': [{'productId': 'prod-1', 'quantity': 1}]}}`
  - Expected: `{'status_code': 401}`
- `test_get_api_orders_returns_user_orders`: GET /api/orders returns 200 and list of orders for authenticated user
  - Input: `{'method': 'GET', 'path': '/api/orders', 'headers': {'Authorization': 'Bearer validtoken'}}`
  - Expected: `{'status_code': 200, 'type': 'array', 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_api_orders_empty_returns_empty_list`: GET /api/orders returns 200 and empty list if user has no orders
  - Input: `{'method': 'GET', 'path': '/api/orders', 'headers': {'Authorization': 'Bearer validtoken'}}`
  - Expected: `{'status_code': 200, 'body': []}`
- `test_get_api_orders_unauthenticated_returns_401`: GET /api/orders without Authorization header returns 401 Unauthorized
  - Input: `{'method': 'GET', 'path': '/api/orders'}`
  - Expected: `{'status_code': 401}`
- `test_get_api_orders_id_returns_order_details`: GET /api/orders/:id returns 200 and Order object for authenticated user and valid order id
  - Input: `{'method': 'GET', 'path': '/api/orders/order-uuid-1', 'headers': {'Authorization': 'Bearer validtoken'}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_api_orders_id_not_found_returns_404`: GET /api/orders/:id with non-existent order id returns 404 Not Found
  - Input: `{'method': 'GET', 'path': '/api/orders/nonexistent-id', 'headers': {'Authorization': 'Bearer validtoken'}}`
  - Expected: `{'status_code': 404}`
- `test_get_api_orders_id_unauthenticated_returns_401`: GET /api/orders/:id without Authorization header returns 401 Unauthorized
  - Input: `{'method': 'GET', 'path': '/api/orders/order-uuid-1'}`
  - Expected: `{'status_code': 401}`

### 🔴 TEST — Tests: backend/order-service/src/controllers/orderController.ts
> Ref: §1.1 (modelos de `backend/order-service/src/controllers/orderController.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_orderController.py`

**Casos de prueba (implementar todos):**
- `test_create_order_valid_data_returns_order`: createOrder with valid items and userId returns Order object with correct fields and status 'pending'
  - Input: `{'userId': 'user-uuid-1', 'items': [{'productId': 'prod-1', 'quantity': 2}, {'productId': 'prod-2', 'quantity': 1}]}`
  - Expected: `{'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt'], 'status': 'pending'}`
- `test_create_order_missing_items_raises_validation_error`: createOrder with missing items raises validation error
  - Input: `{'userId': 'user-uuid-1'}`
  - Expected: `{'raises': 'ValidationError'}`
- `test_create_order_empty_items_raises_validation_error`: createOrder with empty items array raises validation error
  - Input: `{'userId': 'user-uuid-1', 'items': []}`
  - Expected: `{'raises': 'ValidationError'}`
- `test_get_orders_by_user_returns_orders`: getOrdersByUser returns list of orders for given userId
  - Input: `{'userId': 'user-uuid-1'}`
  - Expected: `{'type': 'array', 'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_orders_by_user_no_orders_returns_empty_list`: getOrdersByUser returns empty list if user has no orders
  - Input: `{'userId': 'user-uuid-2'}`
  - Expected: `{'body': []}`
- `test_get_order_by_id_valid_returns_order`: getOrderById with valid order id and userId returns Order object
  - Input: `{'orderId': 'order-uuid-1', 'userId': 'user-uuid-1'}`
  - Expected: `{'fields': ['id', 'userId', 'items', 'total', 'status', 'createdAt', 'updatedAt']}`
- `test_get_order_by_id_not_found_raises_not_found_error`: getOrderById with non-existent order id raises NotFoundError
  - Input: `{'orderId': 'nonexistent-id', 'userId': 'user-uuid-1'}`
  - Expected: `{'raises': 'NotFoundError'}`
- `test_update_order_status_valid_transition`: updateOrderStatus allows valid status transitions (e.g., pending -> paid -> shipped -> delivered)
  - Input: `{'orderId': 'order-uuid-1', 'userId': 'user-uuid-1', 'newStatus': 'paid'}`
  - Expected: `{'status': 'paid'}`
- `test_update_order_status_invalid_transition_raises_error`: updateOrderStatus with invalid status transition (e.g., delivered -> pending) raises ValidationError
  - Input: `{'orderId': 'order-uuid-1', 'userId': 'user-uuid-1', 'newStatus': 'pending'}`
  - Expected: `{'raises': 'ValidationError'}`

### 🔴 TEST — Tests: backend/order-service/src/middlewares/auth.ts
> Ref: §1.1 (modelos de `backend/order-service/src/middlewares/auth.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_auth.py`

**Casos de prueba (implementar todos):**
- `test_auth_middleware_valid_jwt_allows_access`: Auth middleware with valid JWT in Authorization header allows request to proceed
  - Input: `{'headers': {'Authorization': 'Bearer validtoken'}}`
  - Expected: `{'next_called': True}`
- `test_auth_middleware_missing_authorization_returns_401`: Auth middleware without Authorization header returns 401 Unauthorized
  - Input: `{'headers': {}}`
  - Expected: `{'status_code': 401}`
- `test_auth_middleware_invalid_jwt_returns_401`: Auth middleware with invalid JWT returns 401 Unauthorized
  - Input: `{'headers': {'Authorization': 'Bearer invalidtoken'}}`
  - Expected: `{'status_code': 401}`

### 🔴 TEST — Tests: backend/order-service/src/middlewares/errorHandler.ts
> Ref: §1.1 (modelos de `backend/order-service/src/middlewares/errorHandler.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_errorHandler.py`

**Casos de prueba (implementar todos):**
- `test_error_handler_returns_422_for_validation_error`: Error handler returns 422 Unprocessable Entity for validation errors
  - Input: `{'error': 'ValidationError'}`
  - Expected: `{'status_code': 422}`
- `test_error_handler_returns_404_for_not_found_error`: Error handler returns 404 Not Found for NotFoundError
  - Input: `{'error': 'NotFoundError'}`
  - Expected: `{'status_code': 404}`
- `test_error_handler_returns_500_for_generic_error`: Error handler returns 500 Internal Server Error for unexpected errors
  - Input: `{'error': 'Exception'}`
  - Expected: `{'status_code': 500}`

### 🟢 PROD — Auth Service — registro, login, perfil de usuario, JWT
> Implementar el microservicio de autenticación: registro de usuario, login (emisión de JWT y refresh token), consulta de perfil autenticado, middlewares de autenticación y manejo de errores. Validación estricta de entrada y roles. Endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/users/me.
**Archivos:**
  - `backend/auth-service/src/app.ts`  
  - `backend/auth-service/src/index.ts`  
  - `backend/auth-service/src/routes/auth.ts`  
  - `backend/auth-service/src/routes/users.ts`  
  - `backend/auth-service/src/controllers/authController.ts`  
  - `backend/auth-service/src/controllers/userController.ts`  
  - `backend/auth-service/src/middlewares/auth.ts`  
  - `backend/auth-service/src/middlewares/errorHandler.ts`  
  - `backend/auth-service/package.json`


### 🟢 PROD — API Service — productos, categorías, carrito, pedidos (CRUD) (1/2)
> Implementar el microservicio principal de catálogo, carrito y pedidos: CRUD de productos y categorías, gestión de carrito (agregar, modificar, eliminar items), creación y consulta de pedidos. Incluye middlewares de autenticación, manejo de errores, y validación de entrada. Endpoints: /api/products, /api/categories, /api/cart, /api/orders según SPEC.md.
**Archivos:**
  - `backend/api-service/src/app.ts`  
  - `backend/api-service/src/index.ts`  
  - `backend/api-service/src/routes/products.ts`  
  - `backend/api-service/src/routes/categories.ts`  
  - `backend/api-service/src/routes/cart.ts`  
  - `backend/api-service/src/routes/orders.ts`  
  - `backend/api-service/src/controllers/productController.ts`  
  - `backend/api-service/src/controllers/categoryController.ts`  
  - `backend/api-service/src/controllers/cartController.ts`  
  - `backend/api-service/src/controllers/orderController.ts`  
  - `backend/api-service/src/middlewares/auth.ts`  
  - `backend/api-service/src/middlewares/errorHandler.ts`


### 🟢 PROD — API Service — productos, categorías, carrito, pedidos (CRUD) (2/2)
> Implementar el microservicio principal de catálogo, carrito y pedidos: CRUD de productos y categorías, gestión de carrito (agregar, modificar, eliminar items), creación y consulta de pedidos. Incluye middlewares de autenticación, manejo de errores, y validación de entrada. Endpoints: /api/products, /api/categories, /api/cart, /api/orders según SPEC.md.
**Archivos:**
  - `backend/api-service/package.json`


### 🟢 PROD — Order Service — gestión y consulta de pedidos
> Implementar el microservicio de pedidos: creación de pedidos, consulta de historial y detalle, actualización de estado (pending, paid, shipped, delivered, cancelled). Incluye middlewares de autenticación, manejo de errores, y validación de entrada. Endpoints: POST /api/orders, GET /api/orders, GET /api/orders/:id.
**Archivos:**
  - `backend/order-service/src/app.ts`  
  - `backend/order-service/src/index.ts`  
  - `backend/order-service/src/routes/orders.ts`  
  - `backend/order-service/src/controllers/orderController.ts`  
  - `backend/order-service/src/middlewares/auth.ts`  
  - `backend/order-service/src/middlewares/errorHandler.ts`  
  - `backend/order-service/package.json`


---

# §3 Reglas de Infraestructura (obligatorias)

## §3.1 Dockerfiles
- `WORKDIR /app` en todos los Dockerfiles — paths portables, nunca UUIDs ni `/workspace/...`
- El `docker build` debe funcionar en cualquier máquina sin modificaciones

## §3.2 Base de Datos — Auto-Init Obligatorio
Si el proyecto usa base de datos relacional (PostgreSQL, MySQL, SQLite, MariaDB, etc.),
el backend DEBE ejecutar esta secuencia automáticamente al arrancar el contenedor:

1. **Esperar a que la DB esté lista** — retry loop o wait-for-it, nunca asumir que está disponible
2. **Correr migraciones** — `alembic upgrade head` / `prisma migrate deploy` / `knex migrate:latest` / etc.
3. **Seed de datos de ejemplo** — solo si la tabla principal está vacía (idempotente, nunca duplica al reiniciar)
   - Insertar **3–5 registros realistas** por entidad principal
   - El seed usa los mismos modelos/schemas del proyecto — nunca SQL crudo hardcodeado
   - Patrón Python: `if db.query(Model).count() == 0: db.add_all([...]); db.commit()`
   - Patrón Node: `const count = await prisma.model.count(); if (count === 0) { await prisma.model.createMany({...}) }`

Resultado: después de `./run.sh` la app tiene datos de ejemplo listos, sin pasos manuales.

## §3.3 Puertos de Servicio
- Rango obligatorio para **todos** los puertos del host en docker-compose.yml: **21000–65000**.
- Aplica a TODOS los servicios: backends, frontends Y bases de datos / infraestructura.
- El puerto interno del contenedor se mantiene en el default de la tecnología:
  | Tecnología | Puerto interno | Ejemplo host mapping |
  |-----------|---------------|----------------------|
  | PostgreSQL | 5432 | `'25432:5432'` |
  | MySQL      | 3306 | `'23306:3306'` |
  | Redis      | 6379 | `'26379:6379'` |
  | MongoDB    | 27017 | `'37017:27017'` |
  | Backend API | (PORT TABLE §1.1) | `'23001:23001'` |
- NUNCA exponer 3000, 5000, 5432, 6379, 8000, 8080, 8443 en el lado del host.
- El Tech Lead remapeará automáticamente cualquier puerto fuera del rango 21000–65000.

## §3.4 Frontend con Vite / React / Vue
- `index.html` en la RAÍZ del proyecto (mismo nivel que `package.json` y `vite.config.js`)
- NUNCA solo en `public/` — Vite requiere el entry point en la raíz
- Entry point: `<script type='module' src='/src/main.jsx'></script>`

## §3.5 Variables de Entorno
- Vite: `import.meta.env.VITE_NOMBRE` con fallback → `|| 'http://localhost:PUERTO'` (PUERTO del PORT TABLE §1.1)
- Nunca hardcodear URLs, tokens ni secrets en código fuente

## §3.6 Criterios de Finalización
- Todos los archivos listados en §2 deben existir en disco
- Código completo y funcional — sin TODOs ni stubs
- Tests corriendo y pasando antes del commit final
- `git add -A && git commit -m 'feat: implement project'`

## §3.7 Configuración de Test Tooling (requerida por ítems 🔴 TEST del §2)

### pytest
- Test files → `{service_root}/tests/test_*.py` (never co-located with source)
- `requirements.txt` MUST include: `pytest`, `pytest-cov`, `pytest-asyncio`, `httpx`
- Run: `python -m pytest tests/ --tb=short -q --cov=. --cov-report=term-missing`