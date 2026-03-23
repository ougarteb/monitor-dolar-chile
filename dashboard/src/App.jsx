import { useBolchileData } from './hooks/useBolchileData'
import Header from './components/Header'
import StatCard from './components/StatCard'
import HistoryTable from './components/HistoryTable'

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-dark-700/50 h-[140px]" />
        ))}
      </div>
      <div className="rounded-2xl bg-dark-700/50 h-[400px]" />
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

function formatMillions(val) {
  if (val == null) return '—'
  const num = parseFloat(val)
  if (isNaN(num)) return val
  const millions = num / 1_000_000
  return millions.toLocaleString('es-CL', { maximumFractionDigits: 6 }) + 'M'
}

export default function App() {
  const { data, latest, loading, loadingMore, hasMore, loadMore, lastUpdated, soloHoy, setSoloHoy, precioLive, resumenAyer } = useBolchileData()

  const horaLimpia = latest?.hora_limpia ?? '—'

  // Use live price if available, fallback to latest historial
  const displayPrecio = precioLive ?? latest?.valor_actual

  return (
    <div className="min-h-screen flex flex-col justify-start px-6 sm:px-10 lg:px-16 pb-20 max-w-7xl mx-auto">
      {/* Spacer to ensure content starts with ~60px of spacing */}
      <div className="h-16 w-full shrink-0" />

      <Header lastUpdated={lastUpdated} loading={loading} />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Row of 3 stat cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <StatCard
              title="Precio"
              value={formatValue(displayPrecio, 'decimal')}
              prefix="$"
              delay={0.08}
            />
            <StatCard
              title="Volumen"
              value={formatMillions(latest?.monto_usd)}
              prefix="US$"
              delay={0.16}
            />
            <StatCard
              title="Negocios"
              value={formatValue(latest?.negocios, 'integer')}
              delay={0.24}
            />
          </div>

          {/* Yesterday summary cards */}
          {resumenAyer && (
            <div>
              <h2 className="text-sm font-medium text-text-secondary tracking-wide uppercase mb-3">
                Día anterior
              </h2>
              <div className="grid grid-cols-5 gap-2 sm:gap-4">
                <StatCard
                  title="Apertura"
                  value={formatValue(resumenAyer.precio_apertura, 'decimal')}
                  prefix="$"
                  delay={0.32}
                />
                <StatCard
                  title="Volumen"
                  value={resumenAyer.monto_us ?? '—'}
                  delay={0.40}
                />
                <StatCard
                  title="Máximo"
                  value={formatValue(resumenAyer.precio_maximo, 'decimal')}
                  prefix="$"
                  delay={0.48}
                />
                <StatCard
                  title="Mínimo"
                  value={formatValue(resumenAyer.precio_minimo, 'decimal')}
                  prefix="$"
                  delay={0.56}
                />
                <StatCard
                  title="ATR"
                  value={(() => {
                    const max = parseFloat(resumenAyer.precio_maximo)
                    const min = parseFloat(resumenAyer.precio_minimo)
                    if (isNaN(max) || isNaN(min)) return '—'
                    return '$' + (max - min).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  })()}
                  delay={0.64}
                />
              </div>
            </div>
          )}

          {/* History table */}
          <HistoryTable data={data} soloHoy={soloHoy} setSoloHoy={setSoloHoy} hasMore={hasMore} loadMore={loadMore} loadingMore={loadingMore} />
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-text-muted">
        <p>Desarrollado por <a href="https://vextudio.cl/" target="_blank" rel="noopener noreferrer" className="font-semibold text-text-secondary hover:text-text-primary transition-colors">Vextudio</a></p>
      </div>
    </div>
  )
}
