import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zhqdrayplfkbylrbysed.supabase.co'
const supabaseKey = 'sb_publishable_piyK0Si-iDkH7E3cC2QFNQ_5D_Yo0rc'

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