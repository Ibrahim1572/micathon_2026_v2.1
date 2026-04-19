import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

/* ── Category → colour mapping ── */
var COLORS = {
  Dairy:     '#FFD166',
  Produce:   '#06D6A0',
  Grains:    '#FF8C42',
  Protein:   '#EF476F',
  Snacks:    '#A855F7',
  Beverages: '#00B4D8',
  Other:     '#64748B',
}

/** Picks the colour for the category, falls back to Other */
function getColor(name) {
  return COLORS[name] || COLORS.Other
}

/* ── Custom Tooltip ── */
function CustomTooltip(props) {
  if (!props.active || !props.payload || props.payload.length === 0) {
    return null
  }
  var entry = props.payload[0]
  return (
    <div className="chart-tooltip">
      <span
        className="chart-tooltip__dot"
        style={{ background: entry.payload.color }}
      />
      <span className="chart-tooltip__name">{entry.name}</span>
      <span className="chart-tooltip__value">{entry.value} item{entry.value !== 1 ? 's' : ''}</span>
    </div>
  )
}

/* ── Cell renderer — avoids inline arrow function in JSX map ── */
function renderCell(entry, index) {
  return (
    <Cell
      key={'cell-' + index}
      fill={entry.color}
      stroke="rgba(255,255,255,0.06)"
      strokeWidth={2}
    />
  )
}

/* ── DonutChart ── */
function DonutChart(props) {
  var data = props.data

  if (!data || data.length === 0) {
    return null
  }

  var totalItems = data.reduce(function(acc, d) { return acc + d.value }, 0)

  return (
    <div className="donut-wrapper">
      <ResponsiveContainer width="100%" height={270}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={112}
            dataKey="value"
            paddingAngle={4}
            animationBegin={0}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map(renderCell)}
          </Pie>
          <Tooltip content={CustomTooltip} />
        </PieChart>
      </ResponsiveContainer>

      {/* Centred label overlaid on the donut hole */}
      <div className="donut-center" aria-hidden="true">
        <span className="donut-center__value">{totalItems}</span>
        <span className="donut-center__label">items</span>
      </div>
    </div>
  )
}

export { getColor }
export default DonutChart
