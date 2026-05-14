import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export function generateUUID(): string {
  return randomUUID();
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

export interface ValidationSchema {
  required: string[];
}

export function validateInput(schema: ValidationSchema, data: Record<string, unknown>): void {
  for (const field of schema.required) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

export function structuredLog(level: LogEntry['level'], message: string, extra?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  };
  console.log(JSON.stringify(entry));
  return entry;
}

export interface StandardizedError {
  message: string;
  code: number;
  details?: unknown;
}

export function handleError(error: unknown): StandardizedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 500,
    };
  }
  return {
    message: 'An unexpected error occurred',
    code: 500,
  };
}

export function logInfo(message: string, extra?: Record<string, unknown>): void {
  structuredLog('info', message, extra);
}

export function logError(message: string, extra?: Record<string, unknown>): void {
  structuredLog('error', message, extra);
}

export function logWarn(message: string, extra?: Record<string, unknown>): void {
  structuredLog('warn', message, extra);
}

export function logDebug(message: string, extra?: Record<string, unknown>): void {
  structuredLog('debug', message, extra);
}