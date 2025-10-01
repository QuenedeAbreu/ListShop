import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          ListShop
        </h1>
        <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
          Organize suas compras de forma simples e eficiente. Crie listas, compartilhe com amigos e familiares, e nunca mais esqueça um item importante.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}

// export default function Home() {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-gray-900">ListShop</h1>
//           <div className="flex space-x-4">
//             <Link
//               href="/login"
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
//             >
//               Login
//             </Link>
//             <Link
//               href="/register"
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
//             >
//               Registrar
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main className="flex-grow">
//         <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
//               Organize suas compras com facilidade
//             </h2>
//             <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
//               Crie listas de compras, organize por categorias e compartilhe com quem quiser.
//             </p>
//             <div className="mt-8">
//               <Link
//                 href="/register"
//                 className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
//               >
//                 Comece agora - é grátis!
//               </Link>
//             </div>
//           </div>

//           <div className="mt-20">
//             <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Recursos</h3>
//             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
//               <div className="bg-white overflow-hidden shadow rounded-lg">
//                 <div className="px-4 py-5 sm:p-6">
//                   <h4 className="text-lg font-medium text-gray-900">Listas Personalizadas</h4>
//                   <p className="mt-2 text-sm text-gray-500">Crie listas de compras personalizadas com categorias e itens organizados.</p>
//                 </div>
//               </div>
//               <div className="bg-white overflow-hidden shadow rounded-lg">
//                 <div className="px-4 py-5 sm:p-6">
//                   <h4 className="text-lg font-medium text-gray-900">Compartilhamento</h4>
//                   <p className="mt-2 text-sm text-gray-500">Compartilhe suas listas com amigos e familiares, com controle de permissões.</p>
//                 </div>
//               </div>
//               <div className="bg-white overflow-hidden shadow rounded-lg">
//                 <div className="px-4 py-5 sm:p-6">
//                   <h4 className="text-lg font-medium text-gray-900">Fotos dos Produtos</h4>
//                   <p className="mt-2 text-sm text-gray-500">Adicione fotos aos itens para facilitar a identificação durante as compras.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       <footer className="bg-gray-50">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//           <p className="text-center text-sm text-gray-500">
//             &copy; {new Date().getFullYear()} ListShop. Todos os direitos reservados.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }
