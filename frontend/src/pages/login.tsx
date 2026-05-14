import { useState } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import AuthForm from '../components/AuthForm';
import { tokens } from '../styles/tokens';

function LoginContent() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(data: { email: string; password: string }) {
    try {
      setLocalError(null);
      await login(data.email, data.password);
      router.push('/');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Login</h2>
      <AuthForm onSubmit={handleSubmit} loading={loading} error={localError} />
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Layout>
        <LoginContent />
      </Layout>
    </AuthProvider>
  );
}