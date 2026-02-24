import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hpmwopdofvcjpkzjokxt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXdvcGRvZnZjanBrempva3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTM2NzksImV4cCI6MjA4NjU2OTY3OX0.9La76N-QnnDCQJL39UGH_LEv05ZkGzFgCn0q_iVlXxw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Fetch the last N records from bolchile_historial, ordered by most recent first.
 */
export async function fetchHistorial(limit = 50) {
    const { data, error } = await supabase
        .from('bolchile_historial')
        .select('*')
        .gt('valor_actual', 0)
        .gt('monto_usd', 0)
        .gt('negocios', 0)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Supabase fetch error:', error)
        return []
    }

    // Reverse so index 0 = oldest, last = newest (for chart display left-to-right)
    return data.reverse()
}
