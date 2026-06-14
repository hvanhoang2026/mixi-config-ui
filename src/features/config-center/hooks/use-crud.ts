import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useCrud<T>(key: string, path: string) {
  return useQuery({ queryKey: [key], queryFn: () => api<T[]>(path) });
}
