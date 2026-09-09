/**
 * Lightweight dependency-free bar chart built with CSS.
 * Renders a horizontal bar list with accessible labels and supporting values.
 * Chosen over a chart library to keep the bundle small and the layout responsive.
 */
const SimpleBarChart = ({ data, formatLabel, formatValue, color = "bg-button-primary" }) => {
  if (!data || data.length === 0) {
    return <p className="text-secondary text-sm py-4">No data to display.</p>
  }

  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1)

  return (
    <div className="space-y-3" role="img" aria-label="Bar chart">
      {data.map((d, i) => {
        const pct = max > 0 ? Math.max(2, Math.round((Number(d.value) / max) * 100)) : 0
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-secondary">{formatLabel ? formatLabel(d) : d.label}</span>
              <span className="text-primary font-semibold">{formatValue ? formatValue(d) : d.value}</span>
            </div>
            <div className="w-full bg-background rounded overflow-hidden" aria-hidden="true">
              <div
                className={`h-3 ${color} rounded`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SimpleBarChart