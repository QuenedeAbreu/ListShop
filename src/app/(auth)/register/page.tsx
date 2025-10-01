'use client';

import { useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase/client';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function Register() {
  const inputFileRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // 👈 pré-visualização da imagem
  const [profileImage, setProfileImage] = useState<File | null>(null); // 👈 imagem do perfil

  // const router = useRouter();

  // função para limpar os campos do formulário
  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPreview(null);
    if (inputFileRef.current) {
      (inputFileRef.current as HTMLInputElement).value = '';
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // verificar se já existe um usuário com o mesmo email
      const { data: existingPerfil } = await supabase.from('Profile').select('*').eq('email', email);

      if (existingPerfil && existingPerfil.length > 0) {
        setError('Email já existente.');
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmed`,
          data: {
            name,
          },
        },
      });
      // console.log('success', data)
      // console.log('error', error)

      if (error) {
        setError('Erro ao cadastar o usuário!');
        throw error;
      }
      if (data.user) {

        // caso o usuario seja cadastrado com sucesso agora tem salvar a imagem de perfil no storage do supabase 
        if (preview && profileImage) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(`public/${data.user?.id}`, profileImage, {
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: true,
            });
          // caso o upload da imagem no storage do supabase dê certo agora tem salvar o perfil do usuário no banco de dados
          if (uploadData) {
            const { data: profileData, error: profileError } = await supabase.from('Profile').insert({
              userId: data.user?.id,
              name,
              email,
              photoUrl: uploadError ? '' : uploadData.path,
              updatedAt: new Date(),
            });
            if (profileError) {
              setError('Erro ao cadastar o Perfil!');
              throw profileError;
            }
          }
        } else {
          //Enviar sem imagem
          const { data: profileData, error: profileError } = await supabase.from('Profile').insert({
            userId: data.user?.id,
            name,
            email,
            updatedAt: new Date(),
          });
          // console.log('profileDataError', profileError);
          if (profileError) {
            setError('Erro ao cadastar o Perfil!');
            throw profileError;
          }
        }
      }
      // Limpar os campos do formulário
      clearForm();
      setMessage('Registro realizado com sucesso! Verifique seu email para confirmar sua conta.');
      return;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  // 👇 Função para capturar e mostrar a pré-visualização da imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="flex flex-col items-center justify-center relative">

          <div className="absolute w-24 h-24 -top-22 rounded-full overflow-hidden shadow-md shadow-neutral-400 bg-white">
            <Image
              src={preview || '/img/logo_png.png'}
              alt="logo listshop"
              fill
              priority
              className="object-cover"
            />
          </div>

          <h2 className=" text-center text-2xl font-extrabold text-gray-900 -mb-5 mt-5">
            Criar conta
          </h2>
        </div>


        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Nome</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* input com revelador de senha */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <FaRegEyeSlash className="h-5 w-5" />
                ) : (
                  <FaRegEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Input para upload de foto */}
            <div className="">
              {/* <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
              Foto de perfil
            </label> */}
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={inputFileRef}
                className=" block w-full text-sm text-gray-600 
               border border-gray-300 rounded-b-md 
               cursor-pointer 
               focus:outline-none 
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100"
              />
            </div>
          </div>


          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
          {/* butão para limpar o formulario */}
          <div>
            <button
              type="button"
              onClick={clearForm}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
            >
              Limpar
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
