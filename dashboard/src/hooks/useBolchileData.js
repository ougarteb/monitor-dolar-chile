import { useState, useEffect, useCallback } from 'react'
import { fetchHistorialPage, fetchLatestHistorial, fetchPrecioLive, fetchResumenAyer, supabase } from '../lib/supabase'

const REFRESH_INTERVAL = 60_000 // 1 minute fallback

const parseValue = (val, type) => {
    if (!val) return 0
    const strVal = String(val)
    if (type === 'clean_int') {
        return parseInt(strVal.replace(/\./g, ''), 10) || 0
    }
    return parseFloat(strVal) || 0
}

function cleanRecords(records) {
    return records.map(item => ({
        ...item,
        valor_actual: parseFloat(String(item.valor_actual).replace(',', '.')) || 0,
        monto_usd: parseValue(item.monto_usd, 'clean_int'),
        negocios: parseValue(item.negocios, 'clean_int')
    }))
}

export function useBolchileData() {
    const [data, setData] = useState([])          // all loaded rows, newest-first
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [soloHoy, setSoloHoy] = useState(true)
    const [latestRow, setLatestRow] = useState(null) // último registro de bolchile_historial, independiente del filtro soloHoy
    const [precioLive, setPrecioLive] = useState(null)
    const [resumenAyer, setResumenAyer] = useState(null)

    // Initial load (resets when soloHoy changes)
    const loadData = useCallback(async () => {
        try {
            const { rows, hasMore: more } = await fetchHistorialPage(soloHoy, 0)
            setData(cleanRecords(rows))
            setHasMore(more)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Error loading data:', err)
        } finally {
            setLoading(false)
        }
    }, [soloHoy])

    // Load more (append next page)
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        try {
            const offset = data.length
            const { rows, hasMore: more } = await fetchHistorialPage(soloHoy, offset)
            setData(prev => [...prev, ...cleanRecords(rows)])
            setHasMore(more)
        } catch (err) {
            console.error('Error loading more data:', err)
        } finally {
            setLoadingMore(false)
        }
    }, [data.length, soloHoy, loadingMore, hasMore])

    const refreshCards = useCallback(async () => {
        const [row, resumen] = await Promise.all([
            fetchLatestHistorial(),
            fetchResumenAyer()
        ])
        if (row) setLatestRow(cleanRecords([row])[0])
        if (resumen) {
            resumen.monto_us = parseValue(resumen.monto_us, 'clean_int')
            setResumenAyer(resumen)
        }
    }, [])

    useEffect(() => {
        loadData()
        refreshCards()
        const interval = setInterval(() => {
            loadData()
            refreshCards()
        }, REFRESH_INTERVAL)
        return () => clearInterval(interval)
    }, [loadData, refreshCards])

    // Real-time subscription — prepend new row
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
                    const clean = cleanRecords([payload.new])
                    if (clean.length > 0) {
                        const newRow = clean[0]
                        // Actualizar latestRow si el nuevo registro es más reciente
                        setLatestRow(prev => {
                            if (!prev || new Date(newRow.created_at) > new Date(prev.created_at)) {
                                return newRow
                            }
                            return prev
                        })
                        setData(prev => {
                            // Combine, remove duplicates by ID, and sort newest-first
                            const combined = [newRow, ...prev]
                            const seen = new Set()
                            return combined
                                .filter(item => {
                                    if (seen.has(item.id)) return false
                                    seen.add(item.id)
                                    return true
                                })
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        })
                        setLastUpdated(new Date())
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

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

    // latestRow siempre tiene el último registro de bolchile_historial independiente del filtro soloHoy.
    // data[0] es fallback por si latestRow aún no cargó.
    const latest = latestRow ?? (data.length > 0 ? data[0] : null)

    return { data, latest, loading, loadingMore, hasMore, loadMore, lastUpdated, soloHoy, setSoloHoy, precioLive, resumenAyer }
}
