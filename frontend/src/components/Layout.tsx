import { ReactNode } from 'react';
import { tokens } from '../styles/tokens';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: tokens.colors.background }}>
      <header style={{
        backgroundColor: tokens.colors.primary,
        padding: '1rem 0',
        boxShadow: tokens.shadows.md,
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{ color: 'white', fontSize: tokens.typography.fontSizeLg }}>
            E-Commerce Platform
          </h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <a href="/" style={{ color: 'white' }}>Products</a>
            <a href="/cart" style={{ color: 'white' }}>Cart</a>
            <a href="/orders" style={{ color: 'white' }}>Orders</a>
            <a href="/login" style={{ color: 'white' }}>Login</a>
          </nav>
        </div>
      </header>
      <main style={{ padding: '2rem 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
      <footer style={{
        backgroundColor: tokens.colors.surface,
        padding: '2rem 0',
        marginTop: '2rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <p style={{ color: tokens.colors.muted }}>
            &copy; 2024 E-Commerce Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}