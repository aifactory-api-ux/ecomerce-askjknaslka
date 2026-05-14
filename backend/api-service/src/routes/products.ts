import { Router, Request, Response } from 'express';
import { Product } from '../../../shared/models';
import { generateUUID } from '../../../shared/utils';
import { ValidationError, NotFoundError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../../shared/db';

const router = Router();

function validateProduct(data: Partial<Product>): void {
  if (data.price !== undefined && data.price < 0) {
    throw new ValidationError('Price must be non-negative');
  }
  if (data.stock !== undefined && data.stock < 0) {
    throw new ValidationError('Stock must be non-negative');
  }
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDbConnection();
    const result = await db.query(
      'SELECT id, name, description, price, stock, category_id, image_url, created_at, updated_at FROM products ORDER BY created_at DESC'
    );

    const products: Product[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDbConnection();
    const result = await db.query(
      'SELECT id, name, description, price, stock, category_id, image_url, created_at, updated_at FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const row = result.rows[0];
    const product: Product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    if (!name) {
      throw new ValidationError('Name is required');
    }
    if (!description) {
      throw new ValidationError('Description is required');
    }
    if (price === undefined) {
      throw new ValidationError('Price is required');
    }
    if (stock === undefined) {
      throw new ValidationError('Stock is required');
    }
    if (!categoryId) {
      throw new ValidationError('CategoryId is required');
    }
    if (!imageUrl) {
      throw new ValidationError('ImageUrl is required');
    }

    validateProduct({ price, stock });

    const db = getDbConnection();
    const id = generateUUID();
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO products (id, name, description, price, stock, category_id, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, name, description, price, stock, categoryId, imageUrl, now, now]
    );

    const product: Product = {
      id,
      name,
      description,
      price,
      stock,
      categoryId,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    const db = getDbConnection();
    const existing = await db.query('SELECT id FROM products WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    validateProduct({ price, stock });

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (stock !== undefined) {
      updates.push(`stock = $${paramCount++}`);
      values.push(stock);
    }
    if (categoryId !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(categoryId);
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(imageUrl);
    }

    const now = new Date().toISOString();
    updates.push(`updated_at = $${paramCount++}`);
    values.push(now);
    values.push(id);

    await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    const result = await db.query(
      'SELECT id, name, description, price, stock, category_id, image_url, created_at, updated_at FROM products WHERE id = $1',
      [id]
    );

    const row = result.rows[0];
    const product: Product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json(product);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDbConnection();
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;