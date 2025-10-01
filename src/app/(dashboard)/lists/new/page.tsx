'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FiX, FiCheck } from "react-icons/fi";
import { MonthYearPicker } from "@/components/MonthYearCalendar";

export default function NewList() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setPageTitle, pageTitle, user } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState<{ month: number; year: number }>({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  useEffect(() => {
    setPageTitle('Nova Lista')
  }, [pageTitle, setPageTitle])

  // Fora do JSX:
  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage('');
      setError(null);
    }, 3000);

    return () => clearTimeout(timer); // cleanup
  }, [message, error]);
  // Limpar formulario
  const clearForm = () => {
    setName('');
    setDescription('');
    setSelectedDate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Criar nova lista
      const { data, error } = await supabase
        .from('List')
        .insert([{ userId: user?.id, name, year: selectedDate?.year, month: selectedDate?.month, description, updatedAt: new Date() }])
        .select();
      // console.log(error);

      if (error) {
        setError('Erro ao criar lista');
        throw error;
      }

      // // Criar categoria padrão "Sem Categoria"
      // if (data && data[0]) {
      //   const { data: categoryData, error: categoryError } = await supabase
      //     .from('Category')
      //     .insert([{ list_id: data[0].id, name: 'Sem Categoria', position: 0 }]);
      //   console.log(categoryData, categoryError);

      //   // router.push(`/lists/${data[0].id}`);
      // }
      setMessage('Lista criada com sucesso!');
      clearForm();
    } catch (error) {
      setError('Erro ao criar lista');
      console.log(error);
      setError(error instanceof Error ? error.message : 'Erro ao criar lista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Mês da Lista
            </label>
            <div className="flex items-cente">
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="descricao"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Lista de compras do mês"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={loading}
            >
              <span className="flex items-center"><FiX className='mr-2' />Cancelar</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
              disabled={loading}
            >
              <span className="flex items-center "><FiCheck className='mr-2' />{loading ? 'Criando...' : 'Criar Lista'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}