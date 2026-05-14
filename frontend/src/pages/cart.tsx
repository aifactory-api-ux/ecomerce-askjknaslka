import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import Layout from '../components/Layout';
import CartComponent from '../components/Cart';
import { useCartActions } from '../hooks/useCart';
import { tokens } from '../styles/tokens';

function CartContent() {
  const { cart, refreshCart } = useCart();
  const { updateCartItem, removeFromCart, loading, error } = useCartActions();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshCart();
    }
  }, [user, refreshCart]);

  if (!user) {
    return <p>Please login to view your cart</p>;
  }

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p style={{ color: tokens.colors.error }}>{error}</p>;

  return <CartComponent cart={cart} onUpdate={updateCartItem} onRemove={removeFromCart} />;
}

export default function CartPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <CartContent />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}