import { Router, Response } from 'express';
import { Cart, CartItem } from '../../shared/models';
import { generateUUID } from '../../shared/utils';
import { ValidationError, NotFoundError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../shared/db';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

async function getOrCreateCart(userId: string): Promise<Cart> {
  const db = getDbConnection();
  const existing = await db.query(
    'SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1',
    [userId]
  );

  if (existing.rows.length > 0) {
    const cartId = existing.rows[0].id;
    const itemsResult = await db.query(
      'SELECT product_id, quantity FROM cart_items WHERE cart_id = $1',
      [cartId]
    );

    return {
      id: cartId,
      userId,
      items: itemsResult.rows.map(row => ({
        productId: row.product_id,
        quantity: row.quantity,
      })),
      createdAt: existing.rows[0].created_at,
      updatedAt: existing.rows[0].updated_at,
    };
  }

  const id = generateUUID();
  const now = new Date().toISOString();
  await db.query(
    'INSERT INTO carts (id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)',
    [id, userId, now, now]
  );

  return {
    id,
    userId,
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const cart = await getOrCreateCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { productId, quantity } = req.body;

    if (!productId) {
      throw new ValidationError('ProductId is required');
    }
    if (quantity === undefined) {
      throw new ValidationError('Quantity is required');
    }
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    const db = getDbConnection();
    const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const cart = await getOrCreateCart(userId);

    const existingItem = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );

    if (existingItem.rows.length > 0) {
      const newQuantity = existingItem.rows[0].quantity + quantity;
      await db.query(
        'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
        [newQuantity, cart.id, productId]
      );
    } else {
      await db.query(
        'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
        [generateUUID(), cart.id, productId, quantity]
      );
    }

    await db.query('UPDATE carts SET updated_at = $1 WHERE id = $2', [new Date().toISOString(), cart.id]);

    const updatedCart = await getOrCreateCart(userId);
    res.status(201).json(updatedCart);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    console.error('Add cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/items/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      throw new ValidationError('Quantity is required');
    }
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    const db = getDbConnection();
    const cartResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    const cartId = cartResult.rows[0].id;
    const itemResult = await db.query(
      'SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ error: 'Item not found in cart' });
      return;
    }

    await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
      [quantity, cartId, productId]
    );

    await db.query('UPDATE carts SET updated_at = $1 WHERE id = $2', [new Date().toISOString(), cartId]);

    const updatedCart = await getOrCreateCart(userId);
    res.json(updatedCart);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/items/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { productId } = req.params;

    const db = getDbConnection();
    const cartResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    const cartId = cartResult.rows[0].id;
    const itemResult = await db.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING id',
      [cartId, productId]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ error: 'Item not found in cart' });
      return;
    }

    await db.query('UPDATE carts SET updated_at = $1 WHERE id = $2', [new Date().toISOString(), cartId]);

    const updatedCart = await getOrCreateCart(userId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;