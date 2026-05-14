import { tokens } from '../styles/tokens';

interface AuthFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  loading: boolean;
  error: string | null;
}

export default function AuthForm({ onSubmit, loading, error }: AuthFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  }

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Login</h2>
      {error && (
        <div style={{
          backgroundColor: tokens.colors.error,
          color: 'white',
          padding: '0.75rem',
          borderRadius: tokens.borderRadius.md,
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}