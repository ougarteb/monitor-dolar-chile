import { useState, useEffect, useCallback } from 'react'
import { fetchHistorial } from '../lib/supabase'

const REFRESH_INTERVAL = 30_000 // 30 seconds

const parseValue = (val, type) => {
    if (!val) return 0
    // If it's a string like "50.550.000", remove dots before parsing
    // If type is 'decimal' (like Dollar), it might have dot or comma.
    // Our data:
    // - valor_actual: "864.14" (dots for decimals, already accessible as float)
    // - monto_usd: "50.550.000" (dots for thousands) or "595.52" (could mean 595M?)
    // - negocios: "1.234" (dots for thousands)

    const strVal = String(val)

    if (type === 'clean_int') {
        // Remove dots, then parse int
        return parseInt(strVal.replace(/\./g, ''), 10) || 0
    }

    // For valor_actual, it's already a float-like string or number
    return parseFloat(strVal) || 0
}

export function useBolchileData() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)

    const loadData = useCallback(async () => {
        try {
            const records = await fetchHistorial(50)

            // Post-process data to ensure numbers are clean
            const cleanRecords = records.map(item => ({
                ...item,
                // valor_actual is usually distinct; ensure it's a float
                valor_actual: parseFloat(String(item.valor_actual).replace(',', '.')) || 0,
                // monto and negocios likely have thousands dots
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
    }, [])

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, REFRESH_INTERVAL)
        return () => clearInterval(interval)
    }, [loadData])

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

    return { data, latest, changes, loading, lastUpdated }
}
