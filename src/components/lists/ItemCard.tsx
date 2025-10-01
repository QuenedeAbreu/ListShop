'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiCheck, FiTrash2, FiImage, FiEdit, FiMove } from 'react-icons/fi';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '@/lib/types';
import Modal from '@/components/Modal'; // importa o seu Modal

interface ItemCardProps {
  item: Item;
  onTogglePurchased: (id: string, purchased: boolean) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: Item) => void;
  editMode: boolean;
}

export default function ItemCard({
  item,
  onTogglePurchased,
  onDeleteItem,
  onEditItem,
  editMode,
}: ItemCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id ?? '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      {/* 🔹 Se quiser arrastar o card inteiro → deixe {...listeners} aqui no <div> */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners} // 🔥 arrasta o card inteiro
        className={`relative border border-gray-300 rounded-md p-3 ${item.purchased ? 'bg-gray-50' : 'bg-white'
          } ${editMode ? 'cursor-move' : 'cursor-default'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <button
              onClick={() => onTogglePurchased(item.id, item.purchased)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border ${item.purchased
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300'
                } flex items-center justify-center mr-3`}
            >
              {item.purchased && <FiCheck size={16} />}
            </button>
            <div>
              <p
                className={`text-gray-900 ${item.purchased ? 'line-through text-gray-500' : ''
                  }`}
              >
                {item.name}
              </p>
              {item.quantity && (
                <p className="text-sm text-gray-500">{item.quantity}</p>
              )}
            </div>
          </div>

          {/* Ícone de imagem apenas se existir uma URL válida */}
          {item.imageUrl && !imageError && (
            <button
              onClick={() => setShowModal(true)}
              className="ml-2 p-1 text-blue-500 hover:text-blue-700"
              title="Ver imagem"
            >
              <FiImage className="cursor-pointer" size={20} />
            </button>
          )}

          {/* Botão para edição */}
          <button
            type="button"
            onClick={() => onEditItem(item)}
            className="text-yellow-600 hover:text-yellow-900 flex items-center cursor-pointer text-sm font-medium"
          >
            <FiEdit size={18} />
          </button>

          {/* 🔹 Se quiser arrastar só pelo ícone → use este */}
          {editMode && (
            <button
              type="button"
              {...listeners} // 🔥 arrasta só pelo ícone
              className="text-gray-500 hover:text-gray-700 p-1 cursor-grab active:cursor-grabbing"
              title="Arrastar item"
            >
              <FiMove size={18} />
            </button>
          )}

          {/* Botão de exclusão */}
          <button
            type="button"
            onClick={() => onDeleteItem(item.id)}
            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Modal com a imagem */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={item.name}
        size="lg"
      >
        {item.imageUrl && !imageError ? (
          <div className="w-full h-80 relative">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="100%"
              className="object-contain rounded-md"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <p className="text-center text-gray-500">
            ❌ Não foi possível carregar a imagem.
          </p>
        )}
      </Modal>
    </>
  );
}
