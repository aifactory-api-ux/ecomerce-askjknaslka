import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../shared/models';
import { generateUUID, hashPassword, comparePassword } from '../../shared/utils';
import { ValidationError } from '../middlewares/errorHandler';
import { getDbConnection } from '../../shared/db';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '3600');

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, address, phone } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }
    if (!password) {
      throw new ValidationError('Password is required');
    }
    if (!name) {
      throw new ValidationError('Name is required');
    }
    if (!address) {
      throw new ValidationError('Address is required');
    }
    if (!phone) {
      throw new ValidationError('Phone is required');
    }

    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }
    if (!validatePassword(password)) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const db = getDbConnection();
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUsers.rows.length > 0) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    const id = generateUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    const newUser: User = {
      id,
      email,
      passwordHash,
      name,
      address,
      phone,
      createdAt: now,
      updatedAt: now,
    };

    await db.query(
      `INSERT INTO users (id, email, password_hash, name, address, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, email, passwordHash, name, address, phone, now, now]
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }
    if (!password) {
      throw new ValidationError('Password is required');
    }

    const db = getDbConnection();
    const result = await db.query(
      'SELECT id, email, password_hash, name, address, phone, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const isValidPassword = comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN * 24 });

    res.status(201).json({
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ error: error.message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;