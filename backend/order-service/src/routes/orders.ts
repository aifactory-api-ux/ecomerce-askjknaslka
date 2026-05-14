import { Router, Response } from 'express';
import { Order, OrderItem } from '../../shared/models';
import { generateUUID } from '../../shared/utils';
import { ValidationError, NotFoundError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../shared/db';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Items are required and must be a non-empty array');
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

    const order: Order = {
      id,
      userId,
      items: orderItems,
      total,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const db = getDbConnection();

    const result = await db.query(
      'SELECT id, user_id, items, total, status, created_at, updated_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const orders: Order[] = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      total: row.total,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const db = getDbConnection();
    const result = await db.query(
      'SELECT id, user_id, items, total, status, created_at, updated_at FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const row = result.rows[0];
    const order: Order = {
      id: row.id,
      userId: row.user_id,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      total: row.total,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;