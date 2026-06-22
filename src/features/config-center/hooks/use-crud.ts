import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { api } from '../api';

export function useCrud<T>(key: string, path: string) {
  const { initialized, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [key],
    queryFn: () => api<T[]>(path),
    enabled: initialized && isAuthenticated,
  });
}
