import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check .env file.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Admin Client (para operações com service role) ───
// IMPORTANTE: Service role key nunca deve ser exposto em produção
// Use variável de ambiente VITE_SUPABASE_SERVICE_ROLE_KEY
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

export default supabase
export { supabaseAdmin }