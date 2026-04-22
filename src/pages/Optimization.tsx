import { DecisionTable } from '@/components/optimization/DecisionTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function OptimizationPage() {
  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/matching">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Otimização de Compras</h1>
          <p className="text-muted-foreground">Análise de savings e decisão final.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Decisão de Compras</CardTitle>
          <CardDescription>Revise os fornecedores selecionados.</CardDescription>
        </CardHeader>
        <CardContent>
          <DecisionTable />
        </CardContent>
      </Card>
    </div>
  )
}
