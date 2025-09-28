"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface EventStatusChartProps {
  data: Array<{
    status: string
    _count: number
  }>
}

const COLORS = {
  UPCOMING: 'hsl(var(--primary))',
  ONGOING: 'hsl(var(--warning))',
  COMPLETED: 'hsl(var(--success))',
  CANCELLED: 'hsl(var(--destructive))'
}

export function EventStatusChart({ data }: EventStatusChartProps) {
  const chartData = data.map(item => ({
    name: item.status,
    value: item._count,
    fill: COLORS[item.status as keyof typeof COLORS] || 'hsl(var(--muted))'
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}