import { Order } from '../types';
import { tokens } from '../styles/tokens';

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Your Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}>
                <p style={{ fontWeight: tokens.typography.fontWeightBold }}>
                  Order ID: {order.id}
                </p>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: order.status === 'pending' ? tokens.colors.warning :
                    order.status === 'delivered' ? tokens.colors.success : tokens.colors.primary,
                  color: 'white',
                  fontSize: tokens.typography.fontSizeSm,
                }}>
                  {order.status}
                </span>
              </div>
              <p style={{ color: tokens.colors.muted }}>
                Items: {order.items.length}
              </p>
              <p style={{ fontWeight: tokens.typography.fontWeightBold, marginTop: '0.5rem' }}>
                Total: ${(order.total / 100).toFixed(2)}
              </p>
              <p style={{ color: tokens.colors.muted, fontSize: tokens.typography.fontSizeSm }}>
                Created: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}