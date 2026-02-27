import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hpmwopdofvcjpkzjokxt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXdvcGRvZnZjanBrempva3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTM2NzksImV4cCI6MjA4NjU2OTY3OX0.9La76N-QnnDCQJL39UGH_LEv05ZkGzFgCn0q_iVlXxw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Fetch today's records from bolchile_historial, starting from 08:00 AM Chile time.
 */
export async function fetchHistorial() {
    // Get today's 08:00 AM in Chile time, converted to UTC for Supabase
    const now = new Date()
    // Get current date components in Chile timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santiago',
        year: 'numeric', month: '2-digit', day: '2-digit'
    })
    const [year, month, day] = formatter.format(now).split('-').map(Number)
    // Create 08:00 Chile time as a string, then parse to get correct UTC
    const chileStart = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T08:00:00-03:00`)
    const startOfDay = chileStart.toISOString()

    const { data, error } = await supabase
        .from('bolchile_historial')
        .select('*')
        .gt('valor_actual', 0)
        .gt('monto_usd', 0)
        .gt('negocios', 0)
        .gte('created_at', startOfDay)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Supabase fetch error:', error)
        return []
    }

    return data
}
