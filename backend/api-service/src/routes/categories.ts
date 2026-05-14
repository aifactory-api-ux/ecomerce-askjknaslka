import { Router, Request, Response } from 'express';
import { Category } from '../../shared/models';
import { generateUUID } from '../../shared/utils';
import { ValidationError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../shared/db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDbConnection();
    const result = await db.query(
      'SELECT id, name, description, created_at, updated_at FROM categories ORDER BY created_at DESC'
    );

    const categories: Category[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDbConnection();
    const result = await db.query(
      'SELECT id, name, description, created_at, updated_at FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const row = result.rows[0];
    const category: Category = {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      throw new ValidationError('Name is required');
    }

    const db = getDbConnection();
    const id = generateUUID();
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO categories (id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, description || '', now, now]
    );

    const category: Category = {
      id,
      name,
      description: description || '',
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json(category);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const db = getDbConnection();
    const existing = await db.query('SELECT id FROM categories WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

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

    const now = new Date().toISOString();
    updates.push(`updated_at = $${paramCount++}`);
    values.push(now);
    values.push(id);

    await db.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    const result = await db.query(
      'SELECT id, name, description, created_at, updated_at FROM categories WHERE id = $1',
      [id]
    );

    const row = result.rows[0];
    const category: Category = {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDbConnection();
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;