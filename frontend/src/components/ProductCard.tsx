import { Product } from '../types';
import { tokens } from '../styles/tokens';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="card" style={{ width: '300px' }}>
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: tokens.borderRadius.md,
        }}
      />
      <h3 style={{ marginTop: '1rem', fontSize: tokens.typography.fontSizeLg }}>
        {product.name}
      </h3>
      <p style={{ color: tokens.colors.muted, marginTop: '0.5rem' }}>
        {product.description}
      </p>
      <p style={{
        fontWeight: tokens.typography.fontWeightBold,
        fontSize: tokens.typography.fontSizeLg,
        marginTop: '0.5rem',
        color: tokens.colors.primary,
      }}>
        ${(product.price / 100).toFixed(2)}
      </p>
      <p style={{ color: tokens.colors.muted, fontSize: tokens.typography.fontSizeSm }}>
        Stock: {product.stock}
      </p>
      <button
        className="btn btn-primary"
        onClick={() => onAddToCart(product.id)}
        style={{ marginTop: '1rem', width: '100%' }}
      >
        Add to Cart
      </button>
    </div>
  );
}