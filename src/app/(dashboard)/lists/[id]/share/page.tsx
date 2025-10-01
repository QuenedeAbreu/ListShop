'use client';

import React, { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiTrash2, FiLock, FiEye, FiEdit, FiX, FiEdit3 } from 'react-icons/fi';
import type { Share, List } from '@/lib/types';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';

export default function ShareList({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [list, setList] = useState<List | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(true);
  // Modal de Confirmação de exclusão
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteShareId, setConfirmDeleteShareId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [editingShare, setEditingShare] = useState<Share | null>(null);
  const [password, setPassword] = useState('');
  const [shareLink, setShareLink] = useState('');
  const { pageTitle, setPageTitle } = useAuth();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: listJson, error: listError } = await supabase.from('List').select('*').eq('id', id).single();

        if (listError) throw new Error(listError.message);
        setList(listJson);
        setPageTitle(`Compartilhar Lista: ${listJson?.name || 'Carregando...'}`);

        const { data: sharesJson, error: sharesError } = await supabase.from('Share').select('*').eq('listId', id);
        if (sharesError) throw new Error(sharesError.message);
        setShares(sharesJson || []);

        // Gerar link de compartilhamento básico
        setShareLink(`${window.location.origin}/shopping-list/${id}`);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, pageTitle, setPageTitle]);


  useEffect(() => {
    setTimeout(() => {
      setError(null);
      setMessage(null);
    }, 3000);
  }, [error, message]);

  const cleanShareForm = () => {
    setEditingShare(null);
    setPermission('view');
    setUsePassword(false);
    setPassword('');
    setShareLink(`${window.location.origin}/shopping-it/${id}`);
  };

  //Função para Editar o Compartilhamento
  const handleEditShare = async (shareItem: Share) => {
    setEditingShare(shareItem);
    const share = shares.find(s => s.id === shareItem.id);
    if (!share) return;

    setPermission(share.permission);
    setUsePassword(share.hasPassword);
    setPassword(share.hasPassword ? share.password || '' : '');
    setShareLink(`${window.location.origin}/shopping-it/${id}`);
  };

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    // Obter usuário atual
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Usuário não autenticado');

    try {
      // Criar um novo compartilhamento com as opções selecionadas
      const shareData = {
        listId: id,
        permission,
        userId: authUser.id,
        hasPassword: usePassword,
        password: usePassword ? password : null,
        createdAt: new Date().toISOString()
      };
      // Criar o compartilhamento 
      const { error: shareError } = await supabase.from('Share').insert(shareData).single();
      if (shareError) throw new Error(shareError.message);

      setMessage('Link de compartilhamento criado com sucesso!');
      // Limpar o formulário
      setPassword('');
      // Atualizar a lista de compartilhamentos
      const { data: sharesJson, error: sharesError } = await supabase.from('Share').select('*').eq('listId', id);
      if (sharesError) throw new Error(sharesError.message);
      setShares(sharesJson || []);
    } catch (error) {
      console.log(error instanceof Error ? error.message : 'Erro ao compartilhar lista');
      setError('Erro ao compartilhar lista');
    } finally {
      setSubmitting(false);
    }
  };

  // Função para abrir o modal de Confirmação de exclusão
  const confirmDeleteShare = (shareId: string) => {
    setConfirmDeleteShareId(shareId);
    setConfirmDeleteOpen(true);

  };

  // Função para Remover o Compartilhamento
  const deleteShare = async (shareId: string) => {

    try {
      // Remover o compartilhamento
      const { error: shareError } = await supabase.from('Share').delete().eq('id', shareId);
      if (shareError) throw new Error(shareError.message);
      setShares(shares.filter(share => share.id !== shareId));
      setMessage('Compartilhamento removido com sucesso!');
      setConfirmDeleteOpen(false);
    } catch (error) {
      setError('Erro ao remover compartilhamento');
      console.log(error instanceof Error ? error.message : 'Erro ao remover compartilhamento');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleUpdateShare = async (share: Share): Promise<void> => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      // Atualizar o compartilhamento
      const shareData = {
        permission,
        hasPassword: usePassword,
        password: usePassword ? password : null,
      };
      const { error: shareError } = await supabase.from('Share').update(shareData).eq('id', share.id);
      if (shareError) throw new Error(shareError.message);
      // Atualizar a lista de compartilhamentos
      const { data: sharesJson, error: sharesError } = await supabase.from('Share').select('*').eq('listId', id);
      if (sharesError) throw new Error(sharesError.message);
      setShares(sharesJson || []);
      setMessage('Compartilhamento atualizado com sucesso!');
      setEditingShare(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar compartilhamento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {error &&
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      }
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{message}</p>
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Compartilhar Lista: {list?.name}</h1>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Link de Compartilhamento</h2>
        <div className="flex items-center">
          <input
            type="text"
            readOnly
            value={shareLink}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={copyShareLink}
            type='button'
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center cursor-pointer"
          >
            {copied ? <FiCheck className="mr-2" /> : <FiCopy className="mr-2" />}
            {copied ? 'Copiado' : 'Copiar Link'}
          </button>
        </div>
      </div>
      {shares.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Compartilhamento</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissão
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protegido
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shares.map((share) => (
                  <tr key={share.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {share.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {share.permission === 'view' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FiEye className="mr-1" /> Visualização
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FiEdit className="mr-1" /> Edição
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {share.hasPassword ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FiLock className="mr-1" /> Sim
                        </span>
                      ) : (
                        <span className="text-gray-500">Não</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {share.createdAt ? new Date(share.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 gap-1 whitespace-nowrap text-sm font-medium flex items-center">
                      {/* Botão para editar o compartilhamento */}
                      <button
                        type="button"
                        onClick={() => handleEditShare(share)}
                        className="text-yellow-500 hover:text-yellow-700 p-1 cursor-pointer"
                      >
                        <FiEdit size={18} />
                      </button>

                      {/* Botão para remover compartilhamento */}
                      <button
                        type="button"
                        onClick={() => confirmDeleteShare(share.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <FiTrash2 size={18} />
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {(shares.length === 0 || editingShare) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações de Compartilhamento</h2>
          <form className="mb-6 space-y-4">
            {/* Opção de permissão */}
            <div>
              <label htmlFor="permission" className="block text-sm font-medium text-gray-700 mb-1">
                Permissão de Acesso
              </label>
              <div className="flex space-x-4">
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${permission === 'view' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setPermission('view')}
                >
                  <FiEye className={`mr-2 ${permission === 'view' ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className={permission === 'view' ? 'text-blue-700 font-medium' : 'text-gray-700'}>Somente Visualização</span>
                </div>
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${permission === 'edit' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setPermission('edit')}
                >
                  <FiEdit className={`mr-2 ${permission === 'edit' ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className={permission === 'edit' ? 'text-blue-700 font-medium' : 'text-gray-700'}>Visualização e Edição</span>
                </div>
              </div>
            </div>

            {/* Opção de senha */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="usePassword"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="usePassword" className="ml-2 block text-sm font-medium text-gray-700">
                  Proteger com senha
                </label>
              </div>

              {usePassword && (
                <div className="mt-2">
                  <div className="flex items-center">
                    <FiLock className="text-gray-500 mr-2" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite uma senha para acesso"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required={usePassword}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    A pessoa precisará desta senha para acessar a lista compartilhada.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              {editingShare && (
                <div className='flex justify-end gap-2 '>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => { setEditingShare(null); cleanShareForm(); }}
                    className="cursor-pointer w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <span className='flex items-center justify-center'> <FiX className="mr-2" /> Cancelar </span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    onClick={() => handleUpdateShare(editingShare)}
                    className="cursor-pointer w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {submitting ? 'Atualizando...' : <span className='flex items-center justify-center'> <FiEdit3 className="mr-2" /> Atualizar Link de Compartilhamento </span>}
                  </button>
                </div>
              ) || (
                  <button
                    type="submit"
                    disabled={submitting}
                    onClick={handleCreateShare}
                    className="cursor-pointer w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {submitting ? 'Criando...' : <span className='flex items-center justify-center'> <FiCheck className="mr-2" /> Criar Link de Compartilhamento </span>}
                  </button>
                )}

            </div>
          </form>
        </div>
      )}

      {/* Modal de Confirmação de exclusão */}
      <Modal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Excluir Compartilhamento"
        // content="Tem certeza que deseja remover este compartilhamento?"
        // confirmButtonText="Remover"
        // confirmButtonColor="bg-red-600"
        onConfirm={() => deleteShare(confirmDeleteShareId)}
      >
        <p className="text-gray-700">Tem certeza que deseja remover este compartilhamento?</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(false)}
            className="cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span className='flex items-center justify-center'> <FiX className="mr-2" /> Cancelar </span>
          </button>
          <button
            type="button"
            onClick={() => deleteShare(confirmDeleteShareId)}
            className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span className='flex items-center justify-center'> <FiTrash2 className="mr-2" /> Remover </span>
          </button>
        </div>
      </Modal>

    </div>
  );
}