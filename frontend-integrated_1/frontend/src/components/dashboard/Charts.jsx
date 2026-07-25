import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Light, professional palette matching the SaaS design system.
const palette = ['#2563EB', '#38BDF8', '#22C55E', '#F59E0B', '#A855F7', '#F43F5E']

const tooltipStyle = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  fontSize: 13,
}

export function ActivityAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: -10, right: 8, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="humanGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="botGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="label" stroke="#94A3B8" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="human" name="Human clicks" stroke="#2563EB" strokeWidth={2.5} fill="url(#humanGradient)" />
        <Area type="monotone" dataKey="bots" name="Bot requests" stroke="#A855F7" strokeWidth={2} fill="url(#botGradient)" />
        <Area type="monotone" dataKey="previews" name="Previews" stroke="#22C55E" strokeWidth={2} fillOpacity={0} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, centerLabel = '72%', centerSub = 'Mobile' }) {
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={235}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={66} outerRadius={92} paddingAngle={4} stroke="none">
            {data.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><strong>{centerLabel}</strong><span>{centerSub}</span></div>
    </div>
  )
}

export function HorizontalBarChart({ data, dataKey = 'value' }) {
  return (
    <ResponsiveContainer width="100%" height={235}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 10 }}>
        <CartesianGrid stroke="#F1F5F9" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} width={90} fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
