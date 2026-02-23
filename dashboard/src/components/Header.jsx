import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function Header({ lastUpdated, loading }) {
    const timeStr = lastUpdated
        ? lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '—'

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                    Tablero personalizado
                </h1>
                <p className="text-sm text-text-muted mt-1 font-medium">
                    Ingrese subtítulo aquí
                </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-amber-400 animate-ping' : 'bg-emerald-glow animate-ping'}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${loading ? 'bg-amber-400' : 'bg-emerald-glow'}`} />
                </span>
                <span className="text-xs text-text-secondary font-medium">
                    {loading ? 'Cargando...' : `Actualizado: ${timeStr}`}
                </span>
                <Activity className="w-3.5 h-3.5 text-text-muted" />
            </div>
        </motion.header>
    )
}
