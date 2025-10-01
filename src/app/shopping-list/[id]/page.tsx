'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase/client';
import { FiCheck, FiImage, FiX, FiZoomIn, FiZoomOut, FiLock } from 'react-icons/fi';
import Image from 'next/image';
import type { Item, Category, List, Share } from '@/lib/types';

// Função para obter o nome do mês
const getNomeDoMes = (numeroMes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const indice = (numeroMes - 1) % 12;
  return meses[indice];
};

export default function ShoppingListDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Estados para controle de acesso
  const [shareData, setShareData] = useState<Share | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [id]);

  const checkAccess = async () => {
    try {
      setLoading(true);

      // Verificar se existe compartilhamento para esta lista
      const { data: shares, error: shareError } = await supabase
        .from('Share')
        .select('*')
        .eq('listId', id);

      if (shareError) {
        console.error('Erro ao verificar compartilhamento:', shareError);
        setAccessDenied(true);
        setError('Erro ao verificar permissões de acesso');
        return;
      }

      // Se não há compartilhamentos, negar acesso
      if (!shares || shares.length === 0) {
        setAccessDenied(true);
        setError('Esta lista não está disponível para acesso público');
        return;
      }

      // Pegar o primeiro compartilhamento (assumindo que há apenas um por lista)
      const share = shares[0];
      setShareData(share);

      // Verificar se requer senha
      if (share.hasPassword) {
        setPasswordRequired(true);
        return;
      }

      // Se não requer senha, carregar dados diretamente
      await loadListData(share);

    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      setAccessDenied(true);
      setError('Erro ao verificar permissões de acesso');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!shareData) return;

    // Verificar senha
    if (password !== shareData.password) {
      setPasswordError('Senha incorreta');
      return;
    }

    setPasswordRequired(false);
    await loadListData(shareData);
  };

  const loadListData = async (share: Share) => {
    try {
      setLoading(true);

      // Definir se é somente leitura baseado na permissão
      setIsReadOnly(share.permission === 'view');

      // Buscar informações da lista
      const { data: listData, error: listError } = await supabase
        .from('List')
        .select('*')
        .eq('id', id)
        .single();

      if (listError) throw listError;
      setList(listData);

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('Category')
        .select('*')
        .order('position');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Buscar itens da lista
      const { data: itemsData, error: itemsError } = await supabase
        .from('Item')
        .select('*')
        .eq('listId', id)
        .order('position');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da lista');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemPurchased = async (itemId: string) => {
    // Verificar se tem permissão de edição
    if (isReadOnly) {
      alert('Você não tem permissão para editar esta lista');
      return;
    }

    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('Item')
        .update({ purchased: !item.purchased })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(i =>
        i.id === itemId ? { ...i, purchased: !i.purchased } : i
      ));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      alert('Erro ao atualizar item');
    }
  };

  const showImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
    setZoomLevel(1);
  };

  const increaseZoom = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const decreaseZoom = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Tela de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Tela de acesso negado
  if (accessDenied) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <FiX className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Acesso Negado</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-red-500">
            Esta lista não está disponível para acesso público ou você não tem permissão para visualizá-la.
          </p>
        </div>
      </div>
    );
  }

  // Tela de senha
  if (passwordRequired) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <FiLock className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Lista Protegida</h2>
          <p className="text-gray-600">Esta lista requer uma senha para acesso.</p>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha de Acesso
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Digite a senha"
              required
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Acessar Lista
          </button>
        </form>
      </div>
    );
  }

  // Tela de erro
  if (error && !accessDenied) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  // Se não há lista, mostrar mensagem
  if (!list) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Lista não encontrada.</p>
      </div>
    );
  }

  // Agrupar itens por categoria
  const itemsByCategory = categories.map(category => ({
    category,
    items: items.filter(item => item.categoryId === category.id)
  }));

  // Itens sem categoria
  const uncategorizedItems = items.filter(item => !item.categoryId);

  // Calcular estatísticas
  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.purchased).length;
  const percentagePurchased = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Indicador de permissão */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isReadOnly ? (
              <>
                <FiCheck className="text-blue-500 mr-2" />
                <span className="text-blue-700 font-medium">Modo Visualização</span>
              </>
            ) : (
              <>
                <FiCheck className="text-green-500 mr-2" />
                <span className="text-green-700 font-medium">Modo Edição</span>
              </>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {isReadOnly ? 'Você pode apenas visualizar esta lista' : 'Você pode visualizar e editar esta lista'}
          </span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-green-800 mb-2">{list.name}</h1>
      <div className="flex items-center mb-2">
        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          {getNomeDoMes(list.month)} {list.year}
        </span>
      </div>
      {list.description && (
        <p className="text-gray-600 mb-6">{list.description}</p>
      )}

      {/* Estatísticas da lista */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium text-green-700">Progresso da Lista</h2>
          <div className="text-sm text-gray-600">
            {purchasedItems} de {totalItems} itens comprados
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 transition-all duration-500 ease-in-out"
            style={{ width: `${percentagePurchased}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-green-600 font-medium mt-1">
          {percentagePurchased}% concluído
        </div>
      </div>

      {/* Itens por categoria */}
      {itemsByCategory.map(({ category, items: categoryItems }) => (
        categoryItems.length > 0 && (
          <div key={category.id} className="mb-6">
            <div className="flex flex-col items-start justify-between mb-3">
              <div className='flex items-center gap-3'>
                <h2 className="text-xl font-semibold text-green-700">{category.name}</h2>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                  {categoryItems.filter(item => item.purchased).length}/{categoryItems.length}
                </span>
              </div>
              <div style={{ backgroundColor: category.color }} className="w-full h-1 "></div>

            </div>
            <ul className="space-y-2">
              {categoryItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${item.purchased
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                    }`}
                >
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleItemPurchased(item.id)}
                      disabled={isReadOnly}
                      className={`mr-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.purchased
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                        } ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      {item.purchased && <FiCheck size={12} />}
                    </button>
                    <div className="flex-1">
                      <span className={`font-medium ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({item.quantity})
                        </span>
                      )}
                    </div>
                  </div>
                  {item.imageUrl && (
                    <button
                      onClick={() => showImage(item.imageUrl!)}
                      type='button'
                      className="ml-3 p-2 text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
                      title="Ver imagem"
                    >
                      <FiImage size={20} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      ))
      }

      {/* Itens sem categoria */}
      {
        uncategorizedItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-green-700">Outros Itens</h2>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                {uncategorizedItems.filter(item => item.purchased).length}/{uncategorizedItems.length}
              </span>
            </div>
            <ul className="space-y-2">
              {uncategorizedItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${item.purchased
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                    }`}
                >
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleItemPurchased(item.id)}
                      disabled={isReadOnly}
                      className={`mr-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.purchased
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                        } ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      {item.purchased && <FiCheck size={12} />}
                    </button>
                    <div className="flex-1">
                      <span className={`font-medium ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({item.quantity})
                        </span>
                      )}
                    </div>
                  </div>
                  {item.imageUrl && (
                    <button
                      onClick={() => showImage(item.imageUrl!)}
                      type='button'
                      className="ml-3 p-2 text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
                      title="Ver imagem"
                    >
                      <FiImage size={20} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      {/* Modal para exibir imagem */}
      {
        showImageModal && selectedImage && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
            onClick={() => setShowImageModal(false)}
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              className="bg-white/90 backdrop-blur-sm rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl transform transition-all duration-500 ease-in-out"
              onClick={(e) => e.stopPropagation()}
              style={{
                animation: 'fadeInScale 0.4s ease-out'
              }}
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-200/70">
                <h3 className="text-lg font-medium text-green-700">Imagem do Produto</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={decreaseZoom}
                    type='button'
                    className="text-gray-600 hover:text-green-700 transition-colors p-2 rounded-full hover:bg-green-50 cursor-pointer"
                    title="Diminuir zoom"
                  >
                    <FiZoomOut size={20} />
                  </button>
                  <span className="text-sm text-gray-600 font-medium">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={increaseZoom}
                    className="text-gray-600 hover:text-green-700 transition-colors p-2 rounded-full hover:bg-green-50 cursor-pointer"
                    title="Aumentar zoom"
                  >
                    <FiZoomIn size={20} />
                  </button>
                  <button
                    onClick={() => setShowImageModal(false)}
                    type='button'
                    className="text-gray-600 hover:text-red-600 transition-colors px-2 rounded-full hover:bg-red-50 cursor-pointer"
                    title="Fechar"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>
              <div className="p-4 flex justify-center overflow-auto bg-gradient-to-b from-white/60 to-white/90" style={{ maxHeight: '70vh' }}>
                <div
                  className="relative transition-all duration-300 ease-in-out"
                  style={{
                    width: '100%',
                    height: '60vh',
                    cursor: 'move'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Image
                      width={800}
                      height={800}
                      src={selectedImage}
                      alt="Imagem do produto"
                      className="drop-shadow-md"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div >
  );
}