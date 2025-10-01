import { useState, useEffect } from 'react';
import type { Item, Category } from '@/lib/types';

export function useItems(listId: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesRes, itemsRes] = await Promise.all([
        fetch(`/api/lists/${listId}/categories`, { cache: 'no-store' }),
        fetch(`/api/lists/${listId}/items`, { cache: 'no-store' }),
      ]);
      if (!categoriesRes.ok || !itemsRes.ok) throw new Error('Erro ao carregar dados');
      setCategories(await categoriesRes.json());
      setItems(await itemsRes.json());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: {
    name: string;
    quantity?: string | null;
    category_id?: string;
  }) => {
    try {
      // Obter próxima posição
      const maxPosition = Math.max(...items.map(item => item.position || 0), 0);
      
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itemData })
      });
      if (!res.ok) throw new Error('Erro ao criar item');
      const created: Item = await res.json();
      setItems(prev => [...prev, created]);
      return created;
    } catch (error) {
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Erro ao atualizar item');
      const data: Item = await res.json();
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir item');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const toggleItemCompleted = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    return updateItem(id, { purchased: !item.purchased });
  };

  const createCategory = async (name: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Erro ao criar categoria');
      const data: Category = await res.json();
      setCategories(prev => [...prev, data]);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const res = await fetch(`/api/lists/${listId}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Erro ao atualizar categoria');
      const data: Category = await res.json();
      setCategories(prev => prev.map(category => category.id === id ? { ...category, ...data } : category));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Mover itens para categoria padrão
      const defaultCategory = categories.find(cat => cat.name === 'Sem Categoria');
      if (defaultCategory) {
        await fetch(`/api/lists/${listId}/items`, {
          // Opcional: criar rota em lote para mover itens. Por ora, atualização local simples
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
      }

      const res = await fetch(`/api/lists/${listId}/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir categoria');

      setCategories(prev => prev.filter(category => category.id !== id));
      
      // Atualizar itens localmente
      if (defaultCategory) {
        setItems(prev => prev.map(item => 
          item.category_id === id 
            ? { ...item, category_id: defaultCategory.id }
            : item
        ));
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (listId) {
      fetchData();
    }
  }, [listId]);

  return {
    items,
    categories,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    toggleItemCompleted,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchData
  };
}