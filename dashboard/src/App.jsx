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


export default function App() {
  const { data, latest, loading, loadingMore, hasMore, loadMore, lastUpdated, soloHoy, setSoloHoy, precioLive, resumenAyer } = useBolchileData()

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
          {/* 8 tarjetas · 4 columnas · 2 filas fijas */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Fila 1 */}
            <StatCard
              title="Apertura hoy"
              value={formatValue(resumenAyer?.precio_apertura, 'decimal')}
              prefix="$"
              delay={0.08}
            />
            <StatCard
              title="Precio actual"
              value={formatValue(displayPrecio, 'decimal')}
              prefix="$"
              delay={0.12}
            />
            <StatCard
              title="Volumen actual"
              value={formatValue(latest?.monto_usd, 'integer')}
              prefix="US$ "
              delay={0.16}
            />
            <StatCard
              title="Negocios actual"
              value={formatValue(latest?.negocios, 'integer')}
              delay={0.20}
            />
            {/* Fila 2 */}
            <StatCard
              title="Ayer min-max"
              value={`$${formatValue(resumenAyer?.precio_minimo, 'decimal')} – $${formatValue(resumenAyer?.precio_maximo, 'decimal')}`}
              delay={0.24}
            />
            <StatCard
              title="Cierre ayer"
              value={formatValue(resumenAyer?.precio_cierre, 'decimal')}
              prefix="$"
              delay={0.28}
            />
            <StatCard
              title="Volumen ayer"
              value={formatValue(resumenAyer?.monto_us, 'integer')}
              prefix="US$ "
              delay={0.32}
            />
            <StatCard
              title="Negocios ayer"
              value={formatValue(resumenAyer?.negocios, 'integer')}
              delay={0.36}
            />
          </div>

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
