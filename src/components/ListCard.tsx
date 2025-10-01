import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiShare2, FiTrash2, FiMoreVertical, FiList, FiEdit, FiCheck, FiCopy, FiX, FiSave } from "react-icons/fi";
import ProgressBar from '@/components/progressbar'
import { Item, Share } from "@/lib/types";
import Modal from "@/components/Modal";
import { supabase } from "@/utils/supabase/client";
import { MonthYearPicker } from "@/components/MonthYearCalendar";

interface ListCardProps {
  list: {
    id: string;
    name: string;
    description?: string;
    month: number;
    year: number;
    totalItems?: number;
    totalPurchased?: number;
    Items?: Item[];
    createdAt?: string | Date;
    Share?: Share[];
  };
  deleteList: (id: string) => void;
}

export default function ListCard({ list, deleteList }: ListCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [shareLink, setShareLink] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Estados para edição
  const [editName, setEditName] = useState(list.name);
  const [editDescription, setEditDescription] = useState(list.description || '');
  const [editMonth, setEditMonth] = useState(list.month);
  const [editYear, setEditYear] = useState(list.year);
  const [selectedDate, setSelectedDate] = useState<{ month: number; year: number }>({
    month: list.month,
    year: list.year
  });
  const [saving, setSaving] = useState(false);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Calcula posição do menu
  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 180,
      });
    }
  }, [menuOpen]);

  // Atualiza o link de compartilhamento ao abrir o modal
  useEffect(() => {
    if (list.Share && list.Share.length > 0) {
      setShareLink(`${window.location.origin}/shopping-list/${list.id}`);
    }
  }, [list.Share, list.id]);

  // Função para salvar a lista editada
  const handleSaveList = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('List')
        .update({
          name: editName,
          description: editDescription || null,
          month: selectedDate.month,
          year: selectedDate.year
        })
        .eq('id', list.id);

      if (error) throw error;

      // Atualiza os dados locais
      list.name = editName;
      list.description = editDescription;
      list.month = selectedDate.month;
      list.year = selectedDate.year;

      // Fecha o modal
      setShowEditModal(false);

      // Exibe mensagem de sucesso (opcional)
      alert('Lista atualizada com sucesso!');

    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      alert('Erro ao atualizar lista');
    } finally {
      setSaving(false);
    }
  };

  // Função para abrir o modal de edição
  const openEditModal = () => {
    setEditName(list.name);
    setEditDescription(list.description || '');
    setSelectedDate({ month: list.month, year: list.year });
    setShowEditModal(true);
    setMenuOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition p-5 relative md:max-w-sm">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <FiList className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
        </div>

        <button
          ref={buttonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          <FiMoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Data */}
      <p className="text-sm text-gray-500 mt-2">
        Criada em {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : '-'}
      </p>

      {/* Tag de compartilhamento */}
      <div className="mt-3">
        {list.Share && list.Share.length > 0 ? (
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full cursor-pointer hover:bg-green-200 transition"
          >
            <FiShare2 className="h-3 w-3" /> Compartilhada
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
            Não compartilhada
          </span>
        )}
      </div>

      {/* Menu suspenso */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed w-48 bg-white border border-gray-200 rounded-md shadow-2xl z-50 animate-fade-in"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <Link
            href={`/lists/${list.id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition"
          >
            <FiList className="h-4 w-4" /> Ver Lista
          </Link>
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            <FiEdit className="h-4 w-4" /> Editar
          </button>
          <Link
            href={`/lists/${list.id}/share`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition cursor-pointer"
          >
            <FiShare2 className="h-4 w-4" /> Compartilhar
          </Link>
          <button
            onClick={() => deleteList(list.id)}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition cursor-pointer"
          >
            <FiTrash2 className="h-4 w-4" /> Excluir
          </button>
        </div>
      )}

      {/* Barra de progresso */}
      <ProgressBar total={list?.totalItems || 0} completed={list?.totalPurchased || 0} />

      {/* Modal de compartilhamento */}
      {showShareModal && (
        <Modal
          isOpen={showShareModal}
          onClose={() => { setCopied(false); setShowShareModal(false) }}
          title={<span>
            Link de Compartilhamento da Lista: <span className="font-bold">{list.name}</span>
          </span>
          }
        >
          <p className="text-sm text-gray-600 mt-2">
            Copie o link abaixo para compartilhar esta lista:
          </p>
          <div className="mt-3 p-2 border rounded bg-gray-50 text-sm text-gray-800 break-all">
            {shareLink}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {/* Botão para Copiar Link */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                setCopied(true);
              }}
              className="px-4 py-2 flex justify-center items-center text-sm bg-blue-600 text-white rounded-lg hover:hover:bg-blue-700 transition cursor-pointer"
            >
              {copied ? <FiCheck className="mr-2" /> : <FiCopy className="mr-2" />}
              {copied ? 'Copiado' : 'Copiar Link'}
            </button>
            {/* Botão de Fechar */}
            <button
              type="button"
              onClick={() => { setCopied(false); setShowShareModal(false) }}
              className="px-4 py-2 flex justify-center items-center text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
            >
              <FiX className="mr-2" />
              Fechar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal de edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={<span>Editar Lista: <span className="font-bold">{list.name}</span></span>}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Lista
            </label>
            <input
              type="text"
              id="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome da lista"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da lista"
              rows={3}
            />
          </div>

          <div>
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
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            disabled={saving}
          >
            <span className='flex justify-center items-center gap-2 cursor-pointer'> <FiX size={18} /> Cancelar</span>
          </button>

          <button
            type="button"
            onClick={handleSaveList}
            className="px-4 py-2 gap-2 flex items-center justify-center text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            disabled={saving}
          >
            {saving ? (
              <>
                Salvando...
              </>
            ) : (
              <>
                <FiSave size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
