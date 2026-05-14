import { GetServerSideProps } from 'next';
import { Product } from '../types';

interface ProductPageProps {
  product: Product;
}

export default function ProductPage({ product }: ProductPageProps) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${(product.price / 100).toFixed(2)}</p>
      <p>Stock: {product.stock}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async ({ params }) => {
  const { id } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
    if (!response.ok) {
      return { notFound: true };
    }
    const product = await response.json();
    return { props: { product } };
  } catch {
    return { notFound: true };
  }
};