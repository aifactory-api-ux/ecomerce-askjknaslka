import { Cart } from '../types';
import { tokens } from '../styles/tokens';

interface CartProps {
  cart: Cart | null;
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function Cart({ cart, onUpdate, onRemove }: CartProps) {
  if (!cart) {
    return <p>Your cart is empty</p>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Shopping Cart</h2>
      {cart.items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.items.map(item => (
            <div
              key={item.productId}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ fontWeight: tokens.typography.fontWeightBold }}>
                  Product ID: {item.productId}
                </p>
                <p style={{ color: tokens.colors.muted }}>
                  Quantity: {item.quantity}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => onUpdate(item.productId, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => onUpdate(item.productId, item.quantity - 1)}
                >
                  -
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => onRemove(item.productId)}
                  style={{ backgroundColor: tokens.colors.error }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}