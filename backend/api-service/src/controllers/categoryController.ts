import { Request, Response } from 'express';
import { Category } from '../../shared/models';
import { generateUUID } from '../../shared/utils';
import { ValidationError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../shared/db';

export async function getCategories(): Promise<Category[]> {
  const db = getDbConnection();
  const result = await db.query(
    'SELECT id, name, description, created_at, updated_at FROM categories ORDER BY created_at DESC'
  );

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getDbConnection();
  const result = await db.query(
    'SELECT id, name, description, created_at, updated_at FROM categories WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  if (!data.name) {
    throw new ValidationError('Name is required');
  }

  const db = getDbConnection();
  const id = generateUUID();
  const now = new Date().toISOString();

  await db.query(
    `INSERT INTO categories (id, name, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, data.name, data.description || '', now, now]
  );

  return {
    id,
    name: data.name,
    description: data.description || '',
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  const db = getDbConnection();
  const existing = await db.query('SELECT id FROM categories WHERE id = $1', [id]);

  if (existing.rows.length === 0) {
    return null;
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }

  const now = new Date().toISOString();
  updates.push(`updated_at = $${paramCount++}`);
  values.push(now);
  values.push(id);

  await db.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);

  return getCategoryById(id);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = getDbConnection();
  const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}