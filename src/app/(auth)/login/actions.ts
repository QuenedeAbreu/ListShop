'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()


  // type-casting here for convenience
  // in practice, you should validate your inputs
  const datas = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error,data } = await supabase.auth.signInWithPassword(datas)
  // console.log(data);

  if (error) {
    throw new Error(error?.message);
  }


  // revalidatePath('/', 'layout')
  return data
  // redirect('/lists')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/lists')
}