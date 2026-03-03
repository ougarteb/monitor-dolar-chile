import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hpmwopdofvcjpkzjokxt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXdvcGRvZnZjanBrempva3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTM2NzksImV4cCI6MjA4NjU2OTY3OX0.9La76N-QnnDCQJL39UGH_LEv05ZkGzFgCn0q_iVlXxw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Fetch records from bolchile_historial.
 * @param {boolean} soloHoy - If true, fetch only today's records (from 08:00 Chile time). If false, fetch last 50 records.
 */
export async function fetchHistorial(soloHoy = true) {
    let query = supabase
        .from('bolchile_historial')
        .select('*')

    if (soloHoy) {
        // Get today's 08:00 AM in Chile time, converted to UTC for Supabase
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Santiago',
            year: 'numeric', month: '2-digit', day: '2-digit'
        })
        const [year, month, day] = formatter.format(now).split('-').map(Number)
        const chileStart = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T08:00:00-03:00`)
        query = query.gte('created_at', chileStart.toISOString())
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(soloHoy ? 1000 : 50)

    if (error) {
        console.error('Supabase fetch error:', error)
        return []
    }

    // Reverse so index 0 is oldest, last is newest (for tables)
    return data.reverse()
}

/**
 * Fetch the live price from bolchile_precio_live (single row, id=1).
 */
export async function fetchPrecioLive() {
    const { data, error } = await supabase
        .from('bolchile_precio_live')
        .select('valor_actual, updated_at')
        .eq('id', 1)
        .single()

    if (error) {
        console.error('Supabase precio_live fetch error:', error)
        return null
    }
    return data
}
