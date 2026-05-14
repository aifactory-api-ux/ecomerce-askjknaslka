import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import ProductList from './components/ProductList';
import { useProducts } from './hooks/useProducts';
import { useCartActions } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';
import { tokens } from './styles/tokens';

function HomeContent() {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCartActions();
  const { user } = useAuth();

  async function handleAddToCart(productId: string) {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    await addToCart(productId, 1);
    alert('Item added to cart!');
  }

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: tokens.colors.error }}>{error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Products</h2>
      <ProductList products={products} onAddToCart={handleAddToCart} />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <HomeContent />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}