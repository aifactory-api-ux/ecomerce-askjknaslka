import { Order, OrderItem } from '../../shared/models';
import { generateUUID } from '../../shared/utils';
import { ValidationError, NotFoundError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../shared/db';

export async function createOrder(userId: string, items: { productId: string; quantity: number }[]): Promise<Order> {
  if (!items || items.length === 0) {
    throw new ValidationError('Items are required');
  }

  for (const item of items) {
    if (!item.productId) {
      throw new ValidationError('ProductId is required for each item');
    }
    if (!item.quantity || item.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0 for each item');
    }
  }

  const db = getDbConnection();

  for (const item of items) {
    const productCheck = await db.query('SELECT id, price FROM products WHERE id = $1', [item.productId]);
    if (productCheck.rows.length === 0) {
      throw new NotFoundError(`Product ${item.productId} not found`);
    }
  }

  let total = 0;
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const productResult = await db.query('SELECT price FROM products WHERE id = $1', [item.productId]);
    const price = productResult.rows[0].price;
    total += price * item.quantity;
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price,
    });
  }

  const id = generateUUID();
  const now = new Date().toISOString();

  await db.query(
    `INSERT INTO orders (id, user_id, items, total, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, userId, JSON.stringify(orderItems), total, 'pending', now, now]
  );

  return {
    id,
    userId,
    items: orderItems,
    total,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const db = getDbConnection();

  const result = await db.query(
    'SELECT id, user_id, items, total, status, created_at, updated_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getOrderById(orderId: string, userId: string): Promise<Order | null> {
  const db = getDbConnection();
  const result = await db.query(
    'SELECT id, user_id, items, total, status, created_at, updated_at FROM orders WHERE id = $1 AND user_id = $2',
    [orderId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}