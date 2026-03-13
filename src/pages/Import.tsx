import { useState } from 'react'
import { UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import useProcurementStore from '@/stores/useProcurementStore'
import { Link } from 'react-router-dom'

export default function ImportPage() {
  const { importData, erpNeeds, supplierItems } = useProcurementStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpload = (type: 'ERP' | 'AM' | 'QUOTE') => {
    setLoading(type)
    setTimeout(() => {
      importData(type)
      setLoading(null)
      toast({ title: 'Sucesso', description: `Dados de ${type} importados com sucesso.` })
    }, 1000)
  }

  const isErpLoaded = erpNeeds.length > 0
  const isAmLoaded = supplierItems.some((i) => i.source.startsWith('AM'))
  const isQuoteLoaded = supplierItems.some((i) => i.source === 'DIRECT_QUOTE')

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Importação de Dados</h1>
        <p className="text-muted-foreground">
          Faça o upload das suas planilhas para cruzar os dados de compras e otimizar suas decisões.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UploadCard
          title="Planilha ERP"
          description="Extração de Necessidade, Estoque Mín/Máx"
          loaded={isErpLoaded}
          loading={loading === 'ERP'}
          onUpload={() => handleUpload('ERP')}
        />
        <UploadCard
          title="Ação Magistral"
          description="Relatórios de Demanda e Pedidos"
          loaded={isAmLoaded}
          loading={loading === 'AM'}
          onUpload={() => handleUpload('AM')}
        />
        <UploadCard
          title="Cotações Diretas"
          description="Cotações enviadas por fornecedores"
          loaded={isQuoteLoaded}
          loading={loading === 'QUOTE'}
          onUpload={() => handleUpload('QUOTE')}
        />
      </div>

      {(isErpLoaded || isAmLoaded || isQuoteLoaded) && (
        <div className="flex justify-center mt-8">
          <Button asChild size="lg" className="gap-2">
            <Link to="/matching">
              Ir para Mapeamento IA <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function UploadCard({
  title,
  description,
  loaded,
  loading,
  onUpload,
}: {
  title: string
  description: string
  loaded: boolean
  loading: boolean
  onUpload: () => void
}) {
  return (
    <Card className={loaded ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {loaded ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={loaded ? 'outline' : 'default'}
          className="w-full"
          onClick={onUpload}
          disabled={loading}
        >
          {loading ? 'Processando...' : loaded ? 'Atualizar Arquivo' : 'Fazer Upload'}
          {!loading && !loaded && <UploadCloud className="w-4 h-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>
  )
}
