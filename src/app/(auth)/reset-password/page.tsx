'use client';

import { useEffect, useState } from 'react';
// import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase/client';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
// import router from 'next/router';
import { useRouter } from 'next/navigation';


export default function ForgotPassword() {
  const [firstPassword, setFirstPassword] = useState('');
  const [secondPassword, setSecondPassword] = useState('');
  const [showFirstPassword, setShowFirstPassword] = useState(false); // 👈 controla visibilidade
  const [showSecondPassword, setShowSecondPassword] = useState(false); // 👈 controla visibilidade
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // const [token, setToken] = useState('');
  // const [code, setCode] = useState('');
  const router = useRouter();
  // const params = useSearchParams();


  // useEffect(() => {
  //   const token = params.get("token");
  //   const code = params.get("code");
  //   setToken(token || '');
  //   setCode(code || '');
  //   console.log(token);
  //   console.log(code);
  //   // console.log(token)

  //   // // ✅ só deixa ver a página se veio do Supabase
  //   // if (!token || type !== "reset") {
  //   //   router.replace("/login"); // redireciona se for acesso direto
  //   // }
  // }, [params]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // console.log('sss');
    setErrorMsg(null);
    setMessage(null);
    // console.log('teste');

    try {
      // validar se as duas senhas batem 
      if (firstPassword !== secondPassword) {
        // console.log('As senhas não são iguais!');
        setErrorMsg('As senhas não são iguais!');
        return;
      }
      // if (!token) {
      //   console.log('Token inválido!');
      //   setErrorMsg('Token inválido!');
      //   return;
      // }
      // Define a sessão temporária com o token
      // const { data: dataTeste, error: errorTeste } = await supabase.auth.setSession({
      //   access_token: code,
      //   refresh_token: code // o Supabase aceita o mesmo token nesse caso
      // });
      // console.log(dataTeste);
      // console.log(errorTeste);

      const { error } = await supabase.auth.updateUser({
        password: firstPassword
      });

      if (error) {
        console.log(error);
        setErrorMsg('Não foi possível redefinir a senha. Tente novamente.');
        throw error;
      }

      setMessage('Senha redefinida com sucesso!');
      // redireciona para a página de login
      setTimeout(async () => {
        // console.log('redirecionando .....');
        // limpar cookie
        await fetch('/api/clear-recovery-cookie', {
          method: 'POST',
        });
        handleLogout()
        router.replace("/login");
      }, 2000);

    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message === 'Auth session missing!'
            ? 'Sessão de autenticação ausente!'
            : error.message // mantém outras mensagens do Supabase
          : 'Erro ao redefinir a senha'
      );
    } finally {
      setLoading(false);
      clearFields()
    }
  };
  // limpar campos
  const clearFields = () => {
    setFirstPassword('');
    setSecondPassword('');
    // setErrorMsg(null);
    // setMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className='flex flex-col items-center justify-center relative'>
          <Image
            src='/img/logo_png.png'
            width={100}
            height={100}
            priority
            alt='logo listshop'
            className='absolute -top-24 bg-white rounded-full shadow-md shadow-neutral-400'
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Redefinir Senha</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite sua nova senha
          </p>
        </div>
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{errorMsg}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">{message}</p>
          </div>
        )}
        <form onSubmit={handleResetPassword} className="mt-8 space-y-6" >
          <div className='rounded-md shadow-sm -space-y-px'>
            {/* input com revelador de primeira senha */}
            <div className="relative">
              <label htmlFor="firstPassword" className="sr-only">
                Senha
              </label>
              <input
                id="firstPassword"
                name="firstPassword"
                type={showFirstPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={firstPassword}
                onChange={(e) => setFirstPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowFirstPassword((prev) => !prev)}
                className="z-50 absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showFirstPassword ? (
                  <FaRegEyeSlash className="h-5 w-5" />
                ) : (
                  <FaRegEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* input com revelador de segunda senha */}
            <div className="relative">
              <label htmlFor="fistPassword" className="sr-only">
                Senha
              </label>
              <input
                id="secondPassword"
                name="secondPassword"
                type={showSecondPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar senha"
                value={secondPassword}
                onChange={(e) => setSecondPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSecondPassword((prev) => !prev)}
                className="z-50 absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showSecondPassword ? (
                  <FaRegEyeSlash className="h-5 w-5" />
                ) : (
                  <FaRegEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}

              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Lembrou sua senha?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Voltar para o login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}