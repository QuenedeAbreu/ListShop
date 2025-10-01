'use client';

import { ToastProvider } from '@/contexts/ToastContext';

export default function ShoppingListLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">ListShop</h1>
        </div>
      </header>
      <ToastProvider>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </ToastProvider>
    </div>
  );
}