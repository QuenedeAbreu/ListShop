import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    ,{
      auth:{
      flowType:'pkce',
      }
    }
  )
}
export const supabase = createClient()


// export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true,
//   },
// })