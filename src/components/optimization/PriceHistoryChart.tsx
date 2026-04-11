import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const mockData = [
  { month: 'Jan', 'Fornecedor A': 12.5, 'Fornecedor B': 13.0, 'Média Mercado': 12.8 },
  { month: 'Fev', 'Fornecedor A': 12.8, 'Fornecedor B': 12.9, 'Média Mercado': 13.0 },
  { month: 'Mar', 'Fornecedor A': 13.2, 'Fornecedor B': 12.5, 'Média Mercado': 13.1 },
  { month: 'Abr', 'Fornecedor A': 13.0, 'Fornecedor B': 12.2, 'Média Mercado': 12.9 },
  { month: 'Mai', 'Fornecedor A': 12.9, 'Fornecedor B': 12.4, 'Média Mercado': 12.7 },
  { month: 'Jun', 'Fornecedor A': 12.5, 'Fornecedor B': 12.8, 'Média Mercado': 12.6 },
]

export default function PriceHistoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Preços Médios</CardTitle>
        <CardDescription>
          Evolução de custos dos principais insumos nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            fornecedorA: { label: 'Fornecedor A', color: 'hsl(var(--chart-1))' },
            fornecedorB: { label: 'Fornecedor B', color: 'hsl(var(--chart-2))' },
            media: { label: 'Média Mercado', color: 'hsl(var(--muted-foreground))' },
          }}
          className="h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dx={-10}
                tickFormatter={(val) => `$${val}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
              />
              <Line
                type="monotone"
                dataKey="Fornecedor A"
                stroke="var(--color-fornecedorA)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Fornecedor B"
                stroke="var(--color-fornecedorB)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Média Mercado"
                stroke="var(--color-media)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
