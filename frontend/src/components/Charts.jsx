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

const palette = ['#cabeff', '#7bd0ff', '#2fd9f4', '#8be6c1', '#f4c56b', '#ff9c9c']

export function ActivityAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: -10, right: 8, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="humanGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#7bd0ff" stopOpacity={0.42} />
            <stop offset="95%" stopColor="#7bd0ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="botGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#cabeff" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#cabeff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
        <XAxis dataKey="label" stroke="#8fa3bd" tickLine={false} axisLine={false} />
        <YAxis stroke="#8fa3bd" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: 'rgba(8,23,40,.96)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14 }} />
        <Legend />
        <Area type="monotone" dataKey="human" name="Human clicks" stroke="#7bd0ff" strokeWidth={3} fill="url(#humanGradient)" />
        <Area type="monotone" dataKey="bots" name="Bot requests" stroke="#cabeff" strokeWidth={2} fill="url(#botGradient)" />
        <Area type="monotone" dataKey="previews" name="Previews" stroke="#2fd9f4" strokeWidth={2} fillOpacity={0} />
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
          <Tooltip contentStyle={{ background: 'rgba(8,23,40,.96)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14 }} />
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
        <CartesianGrid stroke="rgba(255,255,255,.06)" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" stroke="#a9bbcf" tickLine={false} axisLine={false} width={90} />
        <Tooltip contentStyle={{ background: 'rgba(8,23,40,.96)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14 }} />
        <Bar dataKey={dataKey} radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
