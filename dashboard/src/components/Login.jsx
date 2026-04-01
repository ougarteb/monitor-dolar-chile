import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('Credenciales inválidas. Por favor intente de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-dark-900 selection:bg-emerald-glow/30">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-glow/5 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-glow/5 blur-[120px] animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-xl mb-4 group">
                        <Lock className="w-8 h-8 text-emerald-glow group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">
                        Monitor Dólar Chile
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Ingresa tus datos para acceder
                    </p>
                </div>

                <div className="rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-dim/30 border border-red-glow/20 text-red-glow text-sm"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-emerald-glow transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@email.com"
                                    className="w-full bg-dark-800/50 border border-glass-border rounded-xl py-3.5 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-glow/20 focus:border-emerald-glow/30 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-emerald-glow transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-dark-800/50 border border-glass-border rounded-xl py-3.5 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-glow/20 focus:border-emerald-glow/30 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-glow text-dark-900 font-bold py-4 rounded-xl hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <>
                                    <span>Entrar</span>
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-xs text-text-muted">
                    Propiedad privada de <span className="text-text-secondary font-medium">Vextudio</span>.
                    Acceso restringido a personal autorizado.
                </p>
            </motion.div>
        </div>
    )
}
