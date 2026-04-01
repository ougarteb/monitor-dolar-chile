import { motion } from 'framer-motion'

function formatDollar(val) {
    if (val == null) return '—'
    const num = parseFloat(val)
    if (isNaN(num)) return val
    return '$' + num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMonto(val) {
    if (val == null) return '—'
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\./g, ''), 10)
    if (isNaN(num)) return val
    return 'US$' + num.toLocaleString('es-CL', { maximumFractionDigits: 0 })
}

// direction: 'up' | 'down' | 'flat' | null
function dirColor(direction) {
    if (direction === 'up') return 'text-emerald-400'
    if (direction === 'down') return 'text-red-400'
    return 'text-text-muted'
}

function DeltaCell({ value, format = 'integer', priceDir = null }) {
    if (value == null) return <span className="text-text-muted">—</span>
    const num = parseFloat(value)
    if (isNaN(num)) return <span className="text-text-muted">—</span>

    const isPositive = num > 0
    const isZero = num === 0
    const colorClass = priceDir
        ? dirColor(priceDir)
        : isZero ? 'text-text-muted' : isPositive ? 'text-emerald-400' : 'text-red-400'

    const formatted = format === 'monto'
        ? (isPositive ? '+' : isZero ? '' : '-') + 'US$' + Math.abs(num).toLocaleString('es-CL', { maximumFractionDigits: 0 })
        : (isPositive ? '+' : '') + num.toLocaleString('es-CL', { maximumFractionDigits: 0 })

    return (
        <span className={`${colorClass} font-medium tabular-nums`}>
            {formatted}
        </span>
    )
}

export default function HistoryTable({ data, soloHoy, setSoloHoy, hasMore, loadMore, loadingMore }) {
    // data is already newest-first from the hook
    const rows = data

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden"
        >
            <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
                <h2 className="text-sm font-medium text-text-secondary tracking-wide uppercase">
                    {soloHoy ? 'Registros de hoy' : 'Historial'}
                    <span className="ml-2 text-text-muted font-normal normal-case">
                        ({rows.length} registros)
                    </span>
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-text-muted">
                        {(() => {
                            const dateStr = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' }).format(new Date())
                            return dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
                        })()}
                    </span>
                    <label className="toggle-switch" title={soloHoy ? 'Mostrando solo hoy' : 'Mostrando historial'}>
                        <input
                            type="checkbox"
                            checked={soloHoy}
                            onChange={(e) => setSoloHoy(e.target.checked)}
                        />
                        <span className="toggle-slider" />
                        <span className="ml-3 text-xs font-semibold text-text-primary select-none whitespace-nowrap">
                            Ver sólo hoy
                        </span>
                    </label>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-glass-border">
                            <th className="px-4 py-2 text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">Hora</th>
                            <th className="px-4 py-2 text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">Precio</th>
                            <th className="px-4 py-2 text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">▲ Volumen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => {
                            const prevRow = rows[i + 1]
                            const priceDelta = prevRow
                                ? parseFloat(row.valor_actual) - parseFloat(prevRow.valor_actual)
                                : null
                            const priceDir = priceDelta == null ? null
                                : priceDelta > 0 ? 'up'
                                    : priceDelta < 0 ? 'down'
                                        : 'flat'
                            const priceColor = dirColor(priceDir)

                            return (
                                <tr
                                    key={row.id || row.created_at}
                                    className={`border-b border-glass-border/50 hover:bg-glass-bg-hover transition-colors duration-200 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                                >
                                    <td className="px-4 py-2 text-[17px] text-text-secondary tabular-nums">
                                        {row.hora_limpia ?? '—'}
                                    </td>
                                    <td className={`px-4 py-2 text-[17px] font-medium tabular-nums ${priceDir ? priceColor : 'text-emerald-glow'}`}>
                                        {formatDollar(row.valor_actual)}
                                    </td>
                                    <td className="px-4 py-2 text-[17px] tabular-nums">
                                        <DeltaCell value={row.delta_monto} format="monto" priceDir={priceDir} />
                                    </td>
                                </tr>
                            )
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-sm text-text-muted">
                                    No hay registros disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Load more button */}
            {hasMore && rows.length > 0 && (
                <div className="px-6 py-4 border-t border-glass-border flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300
                            border border-glass-border bg-glass-bg hover:bg-glass-bg-hover
                            text-text-secondary hover:text-text-primary
                            disabled:opacity-50 disabled:cursor-not-allowed
                            hover:border-emerald-500/30 active:scale-[0.97]"
                    >
                        {loadingMore ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Cargando...
                            </span>
                        ) : (
                            'Ver 100 más'
                        )}
                    </button>
                </div>
            )}
        </motion.div>
    )
}
