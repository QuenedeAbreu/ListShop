'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiList, FiPlus, FiGrid, FiUser, FiLogOut } from 'react-icons/fi';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from "@/contexts/AuthContext"
import Image from 'next/image'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pageTitle, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const menuItems = [
    { href: '/lists', label: 'Minhas Listas', icon: <FiList className="w-5 h-5" /> },
    { href: '/categories', label: 'Categorias', icon: <FiGrid className="w-5 h-5" /> },
    { href: '/profile', label: 'Perfil', icon: <FiUser className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Menu para desktop (fixo) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">ListShop</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="ml-3">Sair</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-3 border-t border-gray-200 ">
          <div className='flex items-center gap-3'>
            <div>
              <Image
                src={profile?.photoUrl || '/img/perfil_png.png'}
                alt={profile?.name || 'Foto de perfil'}
                width={40}
                height={40}
                priority
                className="rounded-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="font-bold">
                {profile?.name}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com botão de menu para mobile */}
        <header className="bg-white border-b border-gray-200  flex items-center justify-between  ">
          <button
            className="md:hidden text-gray-700 ml-3 cursor-pointer"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
          <div className="w-full flex flex-col justify-center items-center md:flex p-4">
            <div className="text-lg font-semibold md:hidden">ListShop</div>
            <div className='text-xl font-bold'>{pageTitle}</div>
          </div>
        </header>

        {/* Menu mobile (retrátil) */}
        <div className={`md:hidden fixed inset-0 z-50 bg-gray-800/50 transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`bg-white w-64 h-full overflow-y-auto flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-xl font-bold">ListShop</h1>
              <button
                className="cursor-pointer"
                type='button'
                onClick={toggleMenu}>
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center p-2 rounded-lg ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={toggleMenu}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="ml-3">Sair</span>
                  </button>
                </li>
              </ul>
            </nav>
            <div className="p-3 border-t border-gray-200 ">
              <div className='flex items-center gap-3'>
                <div>
                  <Image
                    src={profile?.photoUrl || '/img/perfil_png.png'}
                    alt={profile?.name || 'Foto de perfil'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-bold">
                    {profile?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}