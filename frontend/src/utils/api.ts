import { Product, Category, User, Cart, Order, AuthToken } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:23001';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, token } = options;

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function getProducts(): Promise<Product[]> {
  return apiRequest('/api/products');
}

export async function getProduct(id: string): Promise<Product> {
  return apiRequest(`/api/products/${id}`);
}

export async function getCategories(): Promise<Category[]> {
  return apiRequest('/api/categories');
}

export async function getCategory(id: string): Promise<Category> {
  return apiRequest(`/api/categories/${id}`);
}

export async function login(email: string, password: string): Promise<AuthToken> {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function register(data: { email: string; password: string; name: string; address: string; phone: string }): Promise<User> {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: data,
  });
}

export async function getMe(token: string): Promise<User> {
  return apiRequest('/api/users/me', { token });
}

export async function getCart(token: string): Promise<Cart> {
  return apiRequest('/api/cart', { token });
}

export async function addToCart(token: string, productId: string, quantity: number): Promise<Cart> {
  return apiRequest('/api/cart/items', {
    method: 'POST',
    body: { productId, quantity },
    token,
  });
}

export async function updateCartItem(token: string, productId: string, quantity: number): Promise<Cart> {
  return apiRequest(`/api/cart/items/${productId}`, {
    method: 'PUT',
    body: { quantity },
    token,
  });
}

export async function removeFromCart(token: string, productId: string): Promise<Cart> {
  return apiRequest(`/api/cart/items/${productId}`, {
    method: 'DELETE',
    token,
  });
}

export async function createOrder(token: string, items: { productId: string; quantity: number }[]): Promise<Order> {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: { items },
    token,
  });
}

export async function getOrders(token: string): Promise<Order[]> {
  return apiRequest('/api/orders', { token });
}

export async function getOrder(token: string, id: string): Promise<Order> {
  return apiRequest(`/api/orders/${id}`, { token });
}