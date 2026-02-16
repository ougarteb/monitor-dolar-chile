import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ title, value, change, icon: Icon, prefix = '', delay = 0 }) {
    const isPositive = change > 0
    const isNeutral = change === 0
    const changeColor = isNeutral
        ? 'text-text-muted'
        : isPositive
            ? 'text-emerald-glow'
            : 'text-red-glow'
    const changeBg = isNeutral
        ? 'bg-dark-600'
        : isPositive
            ? 'bg-emerald-dim/50'
            : 'bg-red-dim/50'

    const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className="flex flex-col justify-center items-center text-center rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-8 min-h-[220px] overflow-hidden group hover:bg-glass-bg-hover transition-colors duration-300 relative"
        >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.04)_0%,transparent_70%)]" />

            <div className="flex flex-col items-center gap-4 relative z-10 w-full">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-text-secondary tracking-wide uppercase">
                        {title}
                    </span>
                </div>

                <p className="text-4xl font-bold tracking-tight text-text-primary my-2">
                    {prefix}{value ?? '—'}
                </p>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${changeBg}`}>
                    <TrendIcon className={`w-4 h-4 ${changeColor}`} />
                    <span className={`text-sm font-semibold ${changeColor}`}>
                        {isNeutral ? '0.00' : Math.abs(change).toFixed(2)}%
                    </span>
                    <span className="text-xs text-text-muted ml-0.5">vs anterior</span>
                </div>
            </div>
        </motion.div>
    )
}
