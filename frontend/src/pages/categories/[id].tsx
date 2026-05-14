import { GetServerSideProps } from 'next';
import { Category } from '../../types';

interface CategoryPageProps {
  category: Category;
}

export default function CategoryPage({ category }: CategoryPageProps) {
  return (
    <div>
      <h1>{category.name}</h1>
      <p>{category.description}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async ({ params }) => {
  const { id } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`);
    if (!response.ok) {
      return { notFound: true };
    }
    const category = await response.json();
    return { props: { category } };
  } catch {
    return { notFound: true };
  }
};