import { Category } from '../types';
import { tokens } from '../styles/tokens';

interface CategoryListProps {
  categories: Category[];
  onSelect: (categoryId: string) => void;
}

export default function CategoryList({ categories, onSelect }: CategoryListProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      marginBottom: '2rem',
    }}>
      {categories.map(category => (
        <button
          key={category.id}
          className="btn btn-secondary"
          onClick={() => onSelect(category.id)}
          style={{
            backgroundColor: tokens.colors.secondary,
            color: tokens.colors.text,
          }}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}