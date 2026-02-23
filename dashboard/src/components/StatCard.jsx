import { motion } from 'framer-motion'

export default function StatCard({ title, value, icon: Icon, prefix = '', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className="flex flex-col justify-center items-center text-center rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-8 min-h-[160px] overflow-hidden group hover:bg-glass-bg-hover transition-colors duration-300 relative"
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
            </div>
        </motion.div>
    )
}
