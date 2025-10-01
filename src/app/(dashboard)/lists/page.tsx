'use client';

import { useEffect, useState } from 'react';
import { FiCheck, FiEdit, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import type { List } from '@/lib/types';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext'
import ListCard from '@/components/ListCard';
import Modal from '@/components/Modal';
import { MonthYearPicker } from "@/components/MonthYearCalendar";

export default function Lists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  // Estados para o modal de adicionar lista
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<{ month: number; year: number }>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [addingList, setAddingList] = useState(false);

  const { setPageTitle, pageTitle, user } = useAuth();

  useEffect(() => {
    setPageTitle('Minhas Listas')
  }, [pageTitle, setPageTitle])

  //Reset as mensagens de erro
  useEffect(() => {
    setTimeout(() => {
      setError(null);
    }, 3000);
  }, [error])

  // Abre modal de Confirmação de exclusão
  const handleOpenModalDelete = (list: List) => {
    setSelectedList(list);
    setShowDeleteModal(true);
  }

  const getListStats = (list: List) => {
    const totalItems = list.Item?.length || 0;
    const purchasedItems = list.Item?.filter(item => item.purchased).length || 0;

    return {
      listId: list.id,
      listName: list.name,
      totalItems,
      purchasedItems,
    };
  }

  const fetchLists = async () => {
    try {
      setLoading(true);
      const { data: list, error } = await supabase.from('List').select(`*,Item(*),Share(*)`)
        .eq('userId', user?.id)
      // Adicionar a quantidade de items na lista e items comprados 
      const listAll = list?.map((item) => ({
        ...item,
        totalItems: getListStats(item).totalItems,
        totalPurchased: getListStats(item).purchasedItems
      }));
      // console.log(listAll);
      if (error) throw new Error('Falha ao carregar listas');
      const data: List[] = listAll || [];
      setLists(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar listas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [])

  // Limpar as menssagens 
  useEffect(() => {
    setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 3000);
  }, [message, error])

  // Deletar Lista
  const deleteList = async (id?: string) => {
    if (!id) return;

    try {
      const { error } = await supabase.from('List').delete().eq('id', id);
      if (error) throw new Error('Erro ao excluir lista');
      setLists(lists.filter(list => list.id !== id));
      setMessage('Lista excluída com sucesso');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao excluir lista');
    } finally {
      setShowDeleteModal(false);
      setSelectedList(null);
    }
  };

  // Adicionar Lista
  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingList(true);
    setError(null);

    try {
      // Criar nova lista
      const { data, error } = await supabase
        .from('List')
        .insert([{
          userId: user?.id,
          name,
          year: selectedDate?.year,
          month: selectedDate?.month,
          description,
          updatedAt: new Date()
        }])
        .select();

      if (error) {
        throw error;
      }

      setMessage('Lista criada com sucesso!');
      clearForm();
      setShowAddModal(false);

      // Atualizar a lista de listas
      fetchLists();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar lista');
    } finally {
      setAddingList(false);
    }
  };

  // Limpar formulario
  const clearForm = () => {
    setName('');
    setDescription('');
    setSelectedDate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  }

  // Filtra as listas com base no termo de pesquisa
  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {message && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="text-sm text-green-700">{message}</div>
        </div>
      )}
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-1/3">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar listas..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          <FiPlus className="mr-2" />
          Nova Lista
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {searchTerm ? 'Nenhuma lista corresponde à pesquisa.' : 'Você ainda não tem nenhuma lista.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <FiPlus className="mr-2" />
              Nova Lista
            </button>
          )}
        </div>
      ) : (
        <div className="grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              deleteList={() => handleOpenModalDelete(list)}
            />
          ))}
        </div>
      )}

      {/* Modal para confirmação de exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={<span>
          Confirmar Exclusão da Lista: <span className="font-bold">{selectedList?.name}</span>
        </span>
        }
      >
        <p>Tem certeza que deseja excluir esta lista?</p>
        {/* Botões de Confimação e cancelamento */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            <span className='flex justify-center items-center gap-2 cursor-pointer'> <FiX /> Cancelar</span>
          </button>
          <button
            onClick={() => {
              deleteList(selectedList?.id);
              setShowDeleteModal(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <span className='flex justify-center items-center gap-2 cursor-pointer'><FiTrash2 />  Excluir</span>
          </button>
        </div>
      </Modal>

      {/* Modal para adicionar lista */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nova Lista"
        size="lg"
      >
        <form onSubmit={handleAddList}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Lista
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Compras do mês"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Mês da Lista
            </label>
            <div className="flex items-center">
              <MonthYearPicker onChange={setSelectedDate} />
            </div>
          </div>

          {selectedDate && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Mês: {selectedDate.month} / Ano: {selectedDate.year}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Lista de compras do mês"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={addingList}
            >
              <span className="flex items-center"><FiX className='mr-2' />Cancelar</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
              disabled={addingList}
            >
              <span className="flex items-center "><FiCheck className='mr-2' />{addingList ? 'Criando...' : 'Criar Lista'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
