import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hpmwopdofvcjpkzjokxt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXdvcGRvZnZjanBrempva3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTM2NzksImV4cCI6MjA4NjU2OTY3OX0.9La76N-QnnDCQJL39UGH_LEv05ZkGzFgCn0q_iVlXxw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const PAGE_SIZE = 100

/**
 * Build the "today filter" start timestamp (08:00 Chile time).
 */
function todayStart() {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santiago',
        year: 'numeric', month: '2-digit', day: '2-digit'
    })
    const [year, month, day] = formatter.format(now).split('-').map(Number)
    return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T08:00:00-03:00`).toISOString()
}

/**
 * Fetch a page of records from bolchile_historial.
 * Returns rows in DESCENDING order (newest first).
 * @param {boolean} soloHoy
 * @param {number} offset - number of rows to skip (0-based)
 * @returns {{ rows: Array, hasMore: boolean }}
 */
export async function fetchHistorialPage(soloHoy = true, offset = 0) {
    let query = supabase
        .from('bolchile_historial')
        .select('*')

    if (soloHoy) {
        query = query.gte('created_at', todayStart())
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
        console.error('Supabase fetch error:', error)
        return { rows: [], hasMore: false }
    }

    return { rows: data || [], hasMore: (data || []).length === PAGE_SIZE }
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
