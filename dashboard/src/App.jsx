import { DollarSign, BarChart3, Briefcase } from 'lucide-react'
import { useBolchileData } from './hooks/useBolchileData'
import Header from './components/Header'
import DashboardRow from './components/DashboardRow'

function LoadingSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <div className="rounded-2xl bg-dark-700/50 h-[220px]" />
          <div className="rounded-2xl bg-dark-700/50 h-[220px]" />
        </div>
      ))}
    </div>
  )
}

function formatValue(val, type) {
  if (val == null) return '—'
  const num = parseFloat(val)
  if (isNaN(num)) return val
  if (type === 'integer') return num.toLocaleString('es-CL', { maximumFractionDigits: 0 })
  return num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function App() {
  const { data, latest, changes, loading, lastUpdated } = useBolchileData()

  return (
    <div className="min-h-screen flex flex-col justify-start px-6 sm:px-10 lg:px-16 pb-20 max-w-7xl mx-auto">
      {/* Spacer to ensure content starts with ~60px of spacing */}
      <div className="h-16 w-full shrink-0" />

      <Header lastUpdated={lastUpdated} loading={loading} />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-10">
          {/* Row 1: Valor Actual (CLP) */}
          <DashboardRow
            title="Valor Actual"
            value={formatValue(latest?.valor_actual, 'decimal')}
            change={changes.valor_actual}
            prefix="$"
            chartData={data}
            dataKey="valor_actual"
            chartColor="#34d399"

            chartPrefix="$"
            yAxisTitle="CLP$"
            delay={0}
          />

          {/* Row 2: Monto (USD) */}
          <DashboardRow
            title="Monto"
            value={formatValue(latest?.monto_usd, 'integer')}
            change={changes.monto_usd}
            prefix="US$ "
            chartData={data}
            dataKey="monto_usd"
            chartColor="#60a5fa"

            chartPrefix="US$ "
            yAxisTitle="US$"
            yFormatter={(v) => (v / 1_000_000).toLocaleString('es-CL', { maximumFractionDigits: 0 }) + 'M'}
            delay={0.15}
          />

          {/* Row 3: Negocios */}
          <DashboardRow
            title="Negocios"
            value={formatValue(latest?.negocios, 'integer')}
            change={changes.negocios}
            prefix=""
            chartData={data}
            dataKey="negocios"
            chartColor="#a78bfa"

            chartPrefix=""
            yAxisTitle="Negocios"
            delay={0.3}
          />
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-text-muted">
        <p>Tiempo real + Respaldo 1m · Datos de <a href="https://www.bolchile.com/dollar" target="_blank" rel="noopener noreferrer" className="underline hover:text-text-secondary transition-colors">Bolchile</a> · Desarrollado por <a href="https://vextudio.cl/" target="_blank" rel="noopener noreferrer" className="font-semibold text-text-secondary hover:text-text-primary transition-colors">Vextudio</a></p>
      </div>
    </div>
  )
}
