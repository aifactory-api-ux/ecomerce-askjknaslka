import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import OrderList from '../components/OrderList';
import { useOrders } from '../hooks/useOrders';
import { tokens } from '../styles/tokens';

function OrdersContent() {
  const { orders, fetchOrders, loading, error } = useOrders();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  if (!user) {
    return <p>Please login to view your orders</p>;
  }

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: tokens.colors.error }}>{error}</p>;

  return <OrderList orders={orders} />;
}

export default function OrdersPage() {
  return (
    <AuthProvider>
      <Layout>
        <OrdersContent />
      </Layout>
    </AuthProvider>
  );
}