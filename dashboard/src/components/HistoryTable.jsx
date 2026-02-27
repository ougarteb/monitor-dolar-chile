import { motion } from 'framer-motion'

function formatDollar(val) {
    if (val == null) return '—'
    const num = parseFloat(val)
    if (isNaN(num)) return val
    return '$' + num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatInteger(val) {
    if (val == null) return '—'
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\./g, ''), 10)
    if (isNaN(num)) return val
    return num.toLocaleString('es-CL', { maximumFractionDigits: 0 })
}

function formatMonto(val) {
    if (val == null) return '—'
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\./g, ''), 10)
    if (isNaN(num)) return val
    return 'US$' + num.toLocaleString('es-CL', { maximumFractionDigits: 0 })
}

function DeltaCell({ value, format = 'integer' }) {
    if (value == null) return <span className="text-text-muted">—</span>
    const num = parseFloat(value)
    if (isNaN(num)) return <span className="text-text-muted">—</span>

    const isPositive = num > 0
    const isZero = num === 0
    const sign = isPositive ? '+' : ''
    const colorClass = isZero
        ? 'text-text-muted'
        : isPositive
            ? 'text-emerald-400'
            : 'text-red-400'
    const formatted = format === 'monto'
        ? (isPositive ? '+' : isZero ? '' : '-') + 'US$' + Math.abs(num).toLocaleString('es-CL', { maximumFractionDigits: 0 })
        : sign + num.toLocaleString('es-CL', { maximumFractionDigits: 0 })

    return (
        <span className={`${colorClass} font-medium tabular-nums`}>
            {formatted}
        </span>
    )
}

export default function HistoryTable({ data }) {
    // Take last 20 records, newest first
    const rows = [...data].reverse().slice(0, 50)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden"
        >
            <div className="px-6 py-4 border-b border-glass-border">
                <h2 className="text-sm font-medium text-text-secondary tracking-wide uppercase">
                    Últimos 50 registros
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-glass-border">
                            <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Hora</th>
                            <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Precio del Dólar</th>
                            <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Negocios</th>
                            <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Δ Negocios</th>
                            <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Monto</th>
                            <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Δ Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={row.id || i}
                                className={`border-b border-glass-border/50 hover:bg-glass-bg-hover transition-colors duration-200 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                            >
                                <td className="px-6 py-3 text-sm text-text-secondary tabular-nums">
                                    {row.hora_limpia ?? '—'}
                                </td>
                                <td className="px-6 py-3 text-sm font-medium text-emerald-glow tabular-nums">
                                    {formatDollar(row.valor_actual)}
                                </td>
                                <td className="px-6 py-3 text-sm text-text-primary tabular-nums">
                                    {formatInteger(row.negocios)}
                                </td>
                                <td className="px-6 py-3 text-sm tabular-nums">
                                    <DeltaCell value={row.delta_negocios} format="integer" />
                                </td>
                                <td className="px-6 py-3 text-sm text-text-primary tabular-nums">
                                    {formatMonto(row.monto_usd)}
                                </td>
                                <td className="px-6 py-3 text-sm tabular-nums">
                                    <DeltaCell value={row.delta_monto} format="monto" />
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-text-muted">
                                    No hay registros disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}
