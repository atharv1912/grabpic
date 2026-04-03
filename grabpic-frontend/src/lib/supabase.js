import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // anon key is safe here — client side
)
async function handleRegister(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  // Supabase sends a confirmation email automatically
}
async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  // data.session.access_token is your JWT — Supabase stores it automatically
}