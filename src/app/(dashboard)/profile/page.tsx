'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { User, Profile } from '@/lib/types';
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { setPageTitle, pageTitle } = useAuth();


  useEffect(() => {
    setPageTitle('Meu Perfil')
  }, [pageTitle, setPageTitle])


  useEffect(() => {
    fetchProfile();
  }, []);
  // limpar mensagens
  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  }, [message]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Obter usuário atual
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      // console.log('authUser', authUser?.email);
      if (!authUser) throw new Error('Usuário não autenticado');
      const { data: profile } = await supabase.from('Profile').select('*').eq('userId', authUser.id).maybeSingle();
      if (!profile) throw new Error('Perfil não encontrado');

      setProfile(profile);
      setName(profile?.name || '');
      setAvatarUrl(profile?.photoUrl || null);
    } catch (error) {
      // console.error('Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setMessage(null);

    try {
      if (!user) throw new Error('Usuário não encontrado');

      // Atualizar foto de perfil se selecionada
      let photoUrl = profile?.photoUrl;
      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }
      console.log('name', name);
      // console.log('name', name);
      // Atualizar perfil
      const { error } = await supabase
        .from('Profile')
        .update({
          name,
          photoUrl,
          updatedAt: new Date(),
        })
        .eq('userId', user.id);

      // caso não tenha perfil, criar um
      if (!profile) {
        const { error } = await supabase.from('Profile').insert({
          userId: user.id,
          name: name,
          email: user.email,
          photoUrl: photoUrl,
          updatedAt: new Date(),
        });
        // console.log('error', error);
        if (error) throw error;
      }

      if (error) throw error;

      setMessage('Perfil atualizado com sucesso!');
      setAvatarUrl(photoUrl || null);
    } catch (error) {

      setError(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {message && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="text-sm text-green-700">{message}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de Perfil
              </label>
              <div className="flex items-center">
                <div className="mr-4">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={64}
                      height={64}
                      priority
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xl font-medium">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar"
                    className="cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Escolher Foto
                  </label>
                  {avatar && (
                    <p className="mt-1 text-sm text-gray-500">
                      {avatar.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="text"
                id="email"
                value={profile?.email ? profile.email : user?.email}
                // verifica profile e se não tiver email, desabilita o input
                disabled={!!profile?.email || !!user?.email}
                // onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${profile?.email || user?.email ? 'bg-gray-100' : 'bg-white'}`}
                required
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={updating}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Atualizando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}