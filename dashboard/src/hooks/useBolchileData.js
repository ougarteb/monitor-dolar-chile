import { useState, useEffect, useCallback } from 'react'
import { fetchHistorial, fetchPrecioLive, supabase } from '../lib/supabase'

const REFRESH_INTERVAL = 60_000 // 1 minute fallback

const parseValue = (val, type) => {
    if (!val) return 0
    const strVal = String(val)
    if (type === 'clean_int') {
        return parseInt(strVal.replace(/\./g, ''), 10) || 0
    }
    return parseFloat(strVal) || 0
}

export function useBolchileData() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [soloHoy, setSoloHoy] = useState(true)
    const [precioLive, setPrecioLive] = useState(null)

    const loadData = useCallback(async () => {
        try {
            const records = await fetchHistorial(soloHoy)

            // Post-process data to ensure numbers are clean
            const cleanRecords = records.map(item => ({
                ...item,
                valor_actual: parseFloat(String(item.valor_actual).replace(',', '.')) || 0,
                monto_usd: parseValue(item.monto_usd, 'clean_int'),
                negocios: parseValue(item.negocios, 'clean_int')
            }))

            setData(cleanRecords)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Error loading data:', err)
        } finally {
            setLoading(false)
        }
    }, [soloHoy])

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, REFRESH_INTERVAL)
        return () => clearInterval(interval)
    }, [loadData])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('bolchile-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bolchile_historial'
                },
                (payload) => {
                    console.log('Realtime update received:', payload)
                    loadData()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [loadData])

    // Live price: fetch + realtime
    useEffect(() => {
        fetchPrecioLive().then(d => { if (d) setPrecioLive(d.valor_actual) })

        const ch = supabase
            .channel('precio-live-realtime')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'bolchile_precio_live' },
                (payload) => {
                    if (payload.new?.valor_actual) setPrecioLive(payload.new.valor_actual)
                }
            )
            .subscribe()

        return () => supabase.removeChannel(ch)
    }, [])

    // Derive latest values and percentage changes
    const latest = data.length > 0 ? data[data.length - 1] : null
    const previous = data.length > 1 ? data[data.length - 2] : null

    const calcChange = (key) => {
        if (!latest || !previous) return 0
        const curr = latest[key]
        const prev = previous[key]
        if (prev === 0) return 0
        return ((curr - prev) / prev) * 100
    }

    const changes = {
        valor_actual: calcChange('valor_actual'),
        monto_usd: calcChange('monto_usd'),
        negocios: calcChange('negocios'),
    }

    return { data, latest, changes, loading, lastUpdated, soloHoy, setSoloHoy, precioLive }
}
