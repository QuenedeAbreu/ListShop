'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiShare2, FiEdit2, FiPlusSquare, FiX, FiTrash2 } from 'react-icons/fi';
import { supabase } from '@/utils/supabase/client';
import type { List, Category, Item } from '@/lib/types';
import ItemCard from '@/components/lists/ItemCard';
import Loading from '@/components/Loading';
import SelectOption from '@/components/SelectOption';
import Modal from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import InputImageCam, { ImageCaptureRef } from '@/components/lists/InputImageCam';

export default function ListDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [list, setList] = useState<List | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesItems, setCategoriesItems] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modeItem, setModeItem] = useState<'edit' | 'new' | null>(null);
  const [selectItemId, setSelectItemId] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string | null>(null);
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemImage, setNewItemImage] = useState<File | string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { user } = useAuth();

  const openDeleteModal = (itemId: string) => {
    setDeleteItemId(itemId);
    setConfirmDeleteOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteItemId(null);
    setConfirmDeleteOpen(false);
  };

  const imageCaptureRef = useRef<ImageCaptureRef>(null);

  const handleCloseModal = () => {
    imageCaptureRef.current?.closeCameraExternally();
    setModeItem(null);
    clearForm();
  };

  const router = useRouter();
  const { setPageTitle, pageTitle } = useAuth();

  useEffect(() => {
    const fetchListData = async () => {
      try {
        const { data: listData, error: listError } = await supabase
          .from('List')
          .select(`*,Item(*,Category(*))`)
          .eq('id', id)
          .eq('userId', user?.id)
          .single();
        if (listError) throw listError;
        setList(listData);
        setPageTitle(listData?.name || 'Minhas Listas');

        const { data: categoriesAll, error: categoriesError } = await supabase
          .from('Category')
          .select('*')
          .order('position');
        if (categoriesError) throw categoriesError;
        setCategories(categoriesAll || []);

        const allCategoriesItems =
          listData?.Item?.flatMap((item: { categoryId: string }) => item.categoryId) || [];
        const uniqueCategories = Array.from(new Set(allCategoriesItems));
        if (uniqueCategories.length > 0) {
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('Category')
            .select('*')
            .in('id', uniqueCategories);
          if (categoriesError) throw categoriesError;
          setCategoriesItems(categoriesData);
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from('Item')
          .select('*')
          .eq('listId', id)
          .order('position');
        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados da lista');
      } finally {
        setLoading(false);
      }
    };

    fetchListData();

    const itemsChannel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `listId=eq.${id}`,
        },
        () => {
          fetchListData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
    };
  }, [id, pageTitle, setPageTitle, user?.id]);

  useEffect(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
  }, [error, success]);

  const clearForm = () => {
    setNewItemName('');
    setNewItemCategory(null);
    setNewItemQuantity('');
    setNewItemImage(null);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!newItemName.trim()) return;

    try {
      const maxPosition = items.length > 0 ? Math.max(...items.map((item) => item.position)) : -1;

      const pactItem = {
        listId: id,
        categoryId: newItemCategory,
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || null,
        purchased: false,
        imageUrl: '',
        position: maxPosition + 1,
      };

      if (newItemImage) {
        const fileExt =
          newItemImage instanceof File ? newItemImage.name.split('.').pop() : 'jpg';
        const fileName = `${id}-${Math.random()}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, newItemImage, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        pactItem.imageUrl = publicUrl;
      }

      const { data, error } = await supabase.from('Item').insert([pactItem]).select();
      if (error) throw error;

      const newItem = data[0];
      setItems((prev) => [...prev, newItem]);

      if (newItem.categoryId) {
        const exists = categoriesItems.some((c) => c.id === newItem.categoryId);
        if (!exists) {
          const { data: newCategory, error: catError } = await supabase
            .from('Category')
            .select('*')
            .eq('id', newItem.categoryId)
            .single();
          if (catError) throw catError;
          if (newCategory) setCategoriesItems((prev) => [...prev, newCategory]);
        }
      }

      setSuccess('Item adicionado com sucesso!');
      setModeItem(null);
      clearForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao adicionar item');
    } finally {
      setLoading(false);
    }
  };

  const editModal = (item: Item) => {
    setNewItemName(item.name);
    setNewItemCategory(item.categoryId);
    setNewItemQuantity(item.quantity?.toString() || '');
    setNewItemImage(item.imageUrl || null);
    setModeItem('edit');
    setSelectItemId(item.id);
  };

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    try {
      const { error } = await supabase
        .from('Item')
        .update({ purchased: !purchased })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => {
        const updated = prev.map(i =>
          i.id === itemId ? { ...i, purchased: !purchased } : i
        );

        // Reorganiza: não comprados primeiro, comprados depois
        return [...updated].sort((a, b) => {
          if (a.purchased === b.purchased) {
            return a.position - b.position;
          }
          return a.purchased ? 1 : -1; // true desce, false sobe
        });
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar item');
    }
  };

  const handleUpdateItem = async (itemId: string, e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!newItemName.trim()) return;

    try {
      let imageUrl = newItemImage;
      if (newItemImage instanceof File) {
        const fileExt = newItemImage.name.split('.').pop();
        const fileName = `${id}-${Math.random()}.${fileExt}`;
        const filePath = `items/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, newItemImage, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const { data: itemResult, error } = await supabase
        .from('Item')
        .update({
          name: newItemName.trim(),
          categoryId: newItemCategory,
          quantity: newItemQuantity.trim() || null,
          imageUrl,
        })
        .eq('id', itemId)
        .select();

      if (error) throw new Error('Erro ao atualizar item');
      if (itemResult) {
        const updatedItem = itemResult[0];

        // 🔹 Atualiza os itens
        setItems((prev) => prev.map((i) => (i.id === itemId ? updatedItem : i)));

        // 🔹 Atualiza categorias (remove categorias sem itens, adiciona se for nova)
        setCategoriesItems((prevCats) => {
          // lista de categorias ainda usadas
          const stillUsedCategories = Array.from(
            new Set(
              [...items.filter((i) => i.id !== itemId), updatedItem]
                .filter((i) => i.categoryId)
                .map((i) => i.categoryId!)
            )
          );

          // mantém só as categorias que ainda têm itens
          const nextCats = prevCats.filter((cat) => stillUsedCategories.includes(cat.id));

          // se a nova categoria não está em nextCats, busca no banco e adiciona
          if (
            updatedItem.categoryId &&
            !nextCats.some((c) => c.id === updatedItem.categoryId)
          ) {
            supabase
              .from('Category')
              .select('*')
              .eq('id', updatedItem.categoryId)
              .single()
              .then(({ data }) => {
                if (data) {
                  setCategoriesItems((prev) => {
                    const allCategories = [...prev];
                    if (updatedItem.categoryId && !allCategories.some(c => c.id === updatedItem.categoryId)) {
                      allCategories.push(data); // adiciona só se não existe
                    }
                    return allCategories;
                  });
                }
              });
          }

          return nextCats;
        });
      }

      setSuccess('Item atualizado com sucesso!');
      clearForm();
      setModeItem(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar item');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('Item').delete().eq('id', itemId);
      if (error) throw error;

      setItems((prev) => {
        const updated = prev.filter((i) => i.id !== itemId);
        const stillUsedCategories = Array.from(
          new Set(updated.filter((i) => i.categoryId).map((i) => i.categoryId!))
        );
        setCategoriesItems(prevCats =>
          prevCats.filter(cat => stillUsedCategories.includes(cat.id))
        );
        return updated;
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao excluir item');
    }
  };

  const handleShareList = () => router.push(`/lists/${id}/share`);

  if (!list) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        Lista não encontrada
      </div>
    );
  }

  return (
    <div>
      {loading && <Loading fullScreen text="Carregando..." />}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end items-end mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setModeItem('new')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <FiPlusSquare size={20} />
          </button>
          <button
            onClick={handleShareList}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <FiShare2 size={20} />
          </button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="space-y-6">
        {categoriesItems.map((category) => {
          const categoryItems = items
            .filter((item) => item.categoryId === category.id)
            .sort((a, b) => {
              if (a.purchased === b.purchased) return a.position - b.position;
              return a.purchased ? 1 : -1;
            });

          return (
            <div key={category.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <div
                  className="inline-block w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <h2 className="text-lg font-medium text-gray-900">{category.name}</h2>
              </div>
              <div className="h-px my-2" style={{ backgroundColor: category.color }}></div>
              <ul className="space-y-2">
                <AnimatePresence>
                  {categoryItems.map(item => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ItemCard
                        item={item}
                        onTogglePurchased={() => handleTogglePurchased(item.id, item.purchased)}
                        onDeleteItem={() => openDeleteModal(item.id)}
                        onEditItem={() => editModal(item)}
                        editMode={modeItem === 'edit'}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          );
        })}

        {/* Sem categoria */}
        {items.filter((item) => !item.categoryId).length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sem Categoria</h2>
            <ul className="space-y-2">
              {items
                .filter((item) => !item.categoryId)
                .sort((a, b) => {
                  if (a.purchased === b.purchased) return a.position - b.position;
                  return a.purchased ? 1 : -1;
                })
                .map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onTogglePurchased={() => handleTogglePurchased(item.id, item.purchased)}
                    onDeleteItem={() => openDeleteModal(item.id)}
                    onEditItem={() => editModal(item)}
                    editMode={modeItem === 'edit'}
                  />
                ))}
            </ul>
          </div>
        )}
      </div>

      {
        items.length === 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-center py-4">Nenhum item na lista</p>
          </div>
        )
      }

      {/* Modal add/edit item */}
      <Modal
        isOpen={modeItem === 'new' || modeItem === 'edit'}
        onClose={handleCloseModal}
        title={`${modeItem === 'new' ? 'Adicionar Item' : `Editar: ${newItemName}`}`}
        size="md"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Item
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Arroz"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                min={1}
                value={newItemQuantity}
                required
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: 2 kg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <SelectOption
              categories={categories}
              value={newItemCategory || ''}
              onChange={setNewItemCategory}
              placeholder="Sem Categoria"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem
            </label>
            <InputImageCam
              onImageSelect={setNewItemImage}
              ref={imageCaptureRef}
              imageUrl={typeof newItemImage === 'string' ? newItemImage : null}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              onClick={modeItem === 'new' ? (e) => handleAddItem(e) : (e) => handleUpdateItem(selectItemId, e)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {modeItem === 'new' ? (
                <>
                  <FiPlusSquare className="mr-2" /> Adicionar
                </>
              ) : (
                <>
                  <FiEdit2 className="mr-2" /> Atualizar
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmação exclusão */}
      <Modal
        isOpen={confirmDeleteOpen}
        onClose={closeDeleteModal}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              type='button'
              onClick={closeDeleteModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 cursor-pointer"
            >
              <span className='flex justify-center items-center gap-2 cursor-pointer'> <FiX /> Cancelar</span>
            </button>
            <button
              type='button'
              onClick={() => {
                if (deleteItemId) handleDeleteItem(deleteItemId);
                closeDeleteModal();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
            >
              <span className='flex justify-center items-center gap-2 cursor-pointer'><FiTrash2 />  Excluir</span>
            </button>
          </div>
        </div>
      </Modal>
    </div >
  );
}
