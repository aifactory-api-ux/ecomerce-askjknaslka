import { useState } from 'react';
import { Order } from '../types';
import { createOrder as apiCreateOrder, getOrders as apiGetOrders } from '../utils/api';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createOrder(items: { productId: string; quantity: number }[]) {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const order = await apiCreateOrder(token, items) as Order;
      setOrders(prev => [order, ...prev]);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const data = await apiGetOrders(token) as Order[];
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  return { orders, loading, error, createOrder, fetchOrders };
}