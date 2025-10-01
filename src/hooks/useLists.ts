import { useState, useEffect } from 'react';
import type { List } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLists = async () => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/lists', { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao carregar listas');
      const ownLists: List[] = await res.json();
      setLists(ownLists || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar listas');
    } finally {
      setLoading(false);
    }
  };

  const createList = async (name: string, description?: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      if (!res.ok) throw new Error('Erro ao criar lista');
      const created: List = await res.json();
      setLists(prev => [created, ...prev]);
      return created;
    } catch (error) {
      throw error;
    }
  };

  const updateList = async (id: string, updates: Partial<Pick<List, 'name' | 'description'>>) => {
    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Erro ao atualizar lista');
      const data: List = await res.json();
      setLists(prev => prev.map(list => list.id === id ? { ...list, ...data } : list));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteList = async (id: string) => {
    try {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir lista');

      // Remover da lista local
      setLists(prev => prev.filter(list => list.id !== id));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchLists();
  }, [user]);

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    updateList,
    deleteList,
    refetch: fetchLists
  };
}