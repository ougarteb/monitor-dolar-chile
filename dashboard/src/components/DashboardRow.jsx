import StatCard from './StatCard'
import TrendChart from './TrendChart'

export default function DashboardRow({
    title,
    value,
    change,
    icon,
    prefix,
    chartData,
    dataKey,
    chartColor,
    chartLabel,
    chartPrefix,
    yFormatter,
    yAxisTitle,
    delay = 0,
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            <StatCard
                title={title}
                value={value}
                change={change}
                icon={icon}
                prefix={prefix}
                delay={delay}
            />
            <TrendChart
                data={chartData}
                dataKey={dataKey}
                color={chartColor}
                label={chartLabel}
                prefix={chartPrefix}
                yFormatter={yFormatter}
                yAxisTitle={yAxisTitle}
                delay={delay}
            />
        </div>
    )
}
