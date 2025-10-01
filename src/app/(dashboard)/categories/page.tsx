'use client'
//tela de lista de categorias e um modal para adcionar e editar as categorias
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { Category } from '@/lib/types';
import React from 'react';
import Modal from '@/components/Modal';
import { FiEdit, FiTrash2, FiPlus, FiEdit3 } from "react-icons/fi";
import { useAuth } from '@/contexts/AuthContext';
import Table from '@/components/Table';

export default function Categories() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const { setPageTitle, pageTitle, user } = useAuth();
  const [formData, setFormData] = React.useState({ name: "", color: "#000000", userId: user?.id });
  const [modalConfirmOpen, setModalConfirmOpen] = React.useState(false);

  useEffect(() => {
    setPageTitle('Categorias')
  }, [pageTitle, setPageTitle])


  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('Category')
          .select('*')
          .eq('userId', user?.id)
          .order('name');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar categorias');
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [user?.id]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormData({ name: "", color: "#000000", userId: user?.id }); // resetar form
    setModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, color: category.color, userId: user?.id });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    // Verificar duplicados (ignorando maiúsculas/minúsculas e espaços extras)
    const nameExists = categories.some(
      (c) =>
        c.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        c.id !== selectedCategory?.id
    );
    const colorExists = categories.some(
      (c) =>
        c.color.toLowerCase() === formData.color.toLowerCase() &&
        c.id !== selectedCategory?.id
    );
    if (nameExists) {
      setError("Já existe uma categoria com esse nome.");
      return;
    }
    if (colorExists) {
      setError("Já existe uma categoria com essa cor.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (selectedCategory) {
        // Atualizar
        const { error } = await supabase
          .from("Category")
          .update({ name: formData.name, color: formData.color })
          .eq("id", selectedCategory.id);

        if (error) throw error;

        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategory.id ? { ...c, ...formData } : c
          )
        );
      } else {
        // Criar
        const { data: newCategory, error } = await supabase
          .from("Category")
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        setCategories((prev) => [...prev, newCategory]);
      }

      setSelectedCategory(null);
      setFormData({ name: "", color: "#000000", userId: user?.id });
      setModalConfirmOpen(false);
      setLoading(false);
      handleCloseModal();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao salvar categoria");
    }
  };


  const handleDeleteCategory = async (category: Category) => {
    setModalConfirmOpen(true);
    setSelectedCategory(category);
    // abrir um modal de confirmação

  };


  const handleDeleteCategoryConfirm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('Category')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      setModalConfirmOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao excluir categoria');
    } finally {
      setModalConfirmOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold"></h1>
        <button onClick={handleAddCategory} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">
          <FiPlus />  Adicionar Categoria
        </button>
      </div>
      <div className="min-h-[calc(100vh-12rem)]">
        <Table
          data={categories}
          columns={[
            {
              key: "color",
              header: "Cor",
              size: '10%',
              render: (value: string | number, row: Category) => (
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: row.color }}
                />
              ),
            },
            { key: "name", header: "Nome" },

            {
              key: "id",
              header: "Ações",
              size: '10%',
              render: (_: unknown, row: Category) => (
                <div className="flex gap-3">
                  <button className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={() => handleEditCategory(row)}
                  >
                    <FiEdit />
                  </button>
                  <button className="text-red-500 hover:text-red-700 cursor-pointer"
                    onClick={() => handleDeleteCategory(row)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ),
            },
          ]}
          itemsPerPage={10}

        />
        {/* Caso não tenha categorias */}
        {categories.length === 0 && (
          <div className="text-center text-gray-500">
            Nenhuma categoria encontrada.
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={selectedCategory ? 'Editar Categoria' : 'Adicionar Categoria'}>
        {/* formulario completo */}
        <div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                required
              />

              {/* Input de cor da categoria */}
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Cor
              </label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-14 mt-1 p-1 border border-gray-300 rounded-md w-full"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">

                {selectedCategory ? <span className="flex items-center gap-2"><FiEdit3 />Atualizar</span> : <span className="flex items-center gap-2 "><FiPlus />Adicionar</span>}
              </button>
            </div>
          </form>
        </div>

      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={modalConfirmOpen} onClose={() => setModalConfirmOpen(false)} title={` `}>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Confirmação</h2>
          <p className="mb-4">Tem certeza que deseja excluir a categoria <b>{selectedCategory?.name}</b>?</p>
          <div className="flex justify-center items-center gap-4">
            <button onClick={() => selectedCategory?.id && handleDeleteCategoryConfirm(selectedCategory.id)} className="bg-red-500 text-white px-4 py-2 rounded-md">
              Excluir
            </button>
            <button onClick={() => setModalConfirmOpen(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
