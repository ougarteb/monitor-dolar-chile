import { motion } from 'framer-motion'
import { Activity, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Header({ lastUpdated, loading }) {
    const timeStr = lastUpdated
        ? lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '—'

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
        >
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold tracking-tight text-text-primary">
                    Monitor Dólar Chile
                </h1>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg border border-glass-border bg-glass-bg hover:bg-red-dim/20 hover:border-red-glow/30 text-text-muted hover:text-red-glow transition-all duration-300"
                    title="Cerrar sesión"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-amber-400 animate-ping' : 'bg-emerald-glow animate-ping'}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${loading ? 'bg-amber-400' : 'bg-emerald-glow'}`} />
                </span>
                <span className="text-[11px] text-text-secondary font-medium">
                    {loading ? 'Cargando...' : `Actualizado: ${timeStr}`}
                </span>
                <Activity className="w-3.5 h-3.5 text-text-muted" />
            </div>
        </motion.header>
    )
}

