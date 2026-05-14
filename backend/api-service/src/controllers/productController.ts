import { Request, Response } from 'express';
import { Product } from '../../../shared/models';
import { generateUUID } from '../../../shared/utils';
import { ValidationError, NotFoundError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../../shared/db';

export async function getProducts(): Promise<Product[]> {
  const db = getDbConnection();
  const result = await db.query(
    'SELECT id, name, description, price, stock, category_id, image_url, created_at, updated_at FROM products ORDER BY created_at DESC'
  );

  return result.rows.map(row => ({
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
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDbConnection();
  const result = await db.query(
    'SELECT id, name, description, price, stock, category_id, image_url, created_at, updated_at FROM products WHERE id = $1',
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
    price: row.price,
    stock: row.stock,
    categoryId: row.category_id,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  if (!data.name) {
    throw new ValidationError('Name is required');
  }

  const db = getDbConnection();
  const id = generateUUID();
  const now = new Date().toISOString();

  await db.query(
    `INSERT INTO products (id, name, description, price, stock, category_id, image_url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, data.name, data.description, data.price, data.stock, data.categoryId, data.imageUrl, now, now]
  );

  return {
    id,
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    categoryId: data.categoryId,
    imageUrl: data.imageUrl,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const db = getDbConnection();
  const existing = await db.query('SELECT id FROM products WHERE id = $1', [id]);

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
  if (data.price !== undefined) {
    updates.push(`price = $${paramCount++}`);
    values.push(data.price);
  }
  if (data.stock !== undefined) {
    updates.push(`stock = $${paramCount++}`);
    values.push(data.stock);
  }
  if (data.categoryId !== undefined) {
    updates.push(`category_id = $${paramCount++}`);
    values.push(data.categoryId);
  }
  if (data.imageUrl !== undefined) {
    updates.push(`image_url = $${paramCount++}`);
    values.push(data.imageUrl);
  }

  const now = new Date().toISOString();
  updates.push(`updated_at = $${paramCount++}`);
  values.push(now);
  values.push(id);

  await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);

  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = getDbConnection();
  const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}