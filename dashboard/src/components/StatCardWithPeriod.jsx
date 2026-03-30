import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchVolumenStats } from '../lib/supabase'

const PERIODS = [7, 20, 200]

function formatValue(val) {
    if (val == null) return '—'
    return Math.round(val).toLocaleString('es-CL')
}

export default function StatCardWithPeriod({ title, metric, prefix = '', delay = 0 }) {
    const [period, setPeriod] = useState(7)
    const [value, setValue] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        fetchVolumenStats(period).then(stats => {
            if (cancelled) return
            setValue(metric === 'promedio' ? stats.promedio : stats.maximo)
            setLoading(false)
        })
        return () => { cancelled = true }
    }, [period, metric])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className="flex items-center justify-between rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4 min-h-[80px] sm:min-h-[95px] overflow-hidden group hover:bg-glass-bg-hover transition-colors duration-300 relative"
        >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.04)_0%,transparent_70%)]" />

            {/* Izquierda: título + botones */}
            <div className="flex flex-col gap-2 relative z-10">
                <span className="text-[10px] sm:text-xs font-medium text-text-secondary tracking-wide uppercase">
                    {title}
                </span>
                <div className="flex gap-2">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-md transition-colors duration-150 ${
                                period === p
                                    ? 'bg-emerald-dim/60 text-emerald-glow'
                                    : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            {p}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Derecha: valor */}
            <div className="flex flex-col items-end relative z-10">
                {loading ? (
                    <span className="text-text-muted animate-pulse text-sm">...</span>
                ) : (
                    <>
                        <span className="text-[10px] sm:text-xs font-medium text-text-secondary tracking-wide">{prefix.trim()}</span>
                        <span className="text-base sm:text-lg font-medium tracking-tight text-text-primary">{formatValue(value)}</span>
                    </>
                )}
            </div>
        </motion.div>
    )
}
