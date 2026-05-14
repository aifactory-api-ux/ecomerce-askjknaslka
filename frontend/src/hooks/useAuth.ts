import { useAuth } from '../context/AuthContext';

export function useAuthActions() {
  const { login, register, logout, loading, error, user } = useAuth();

  return {
    login,
    register,
    logout,
    loading,
    error,
    user,
  };
}