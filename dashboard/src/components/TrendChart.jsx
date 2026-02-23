import { motion } from 'framer-motion'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts'

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-dark-700 border border-glass-border rounded-lg px-3 py-2 shadow-xl backdrop-blur-xl">
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className="text-sm font-semibold text-text-primary">
                {prefix}{typeof payload[0].value === 'number'
                    ? payload[0].value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : payload[0].value}
            </p>
        </div>
    )
}

export default function TrendChart({ data, dataKey, color = '#34d399', label, prefix = '', delay = 0, yFormatter, yAxisTitle }) {
    const gradientId = `gradient-${dataKey}`

    // Format time for X axis
    const chartData = data.map((item) => ({
        ...item,
        time: item.created_at
            ? new Date(item.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
            : '',
        [dataKey]: parseFloat(item[dataKey]) || 0,
    }))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.1, ease: 'easeOut' }}
            className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-8 min-h-[220px] overflow-hidden flex flex-col justify-center relative"
        >
            {label && <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-5 text-center">{label}</p>}

            {/* Axis Title Overlay - Aligned with Y Axis values */}
            {yAxisTitle && (
                <div className="absolute top-4 left-8 w-[45px] text-right text-[10px] font-bold text-text-muted z-10">
                    {yAxisTitle}
                </div>
            )}

            <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData} margin={{ top: 25, right: 35, left: 45, bottom: 5 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={yFormatter || ((v) => prefix + v.toLocaleString('es-CL'))}
                    />
                    <Tooltip content={<CustomTooltip prefix={prefix} />} />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#0a0a0f' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    )
}
