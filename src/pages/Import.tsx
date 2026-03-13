import { useState } from 'react'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import useProcurementStore from '@/stores/useProcurementStore'
import { Link } from 'react-router-dom'
import { UploadCard } from '@/components/UploadCard'

export default function ImportPage() {
  const { importData, erpNeeds, supplierItems } = useProcurementStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  const [erpFiles, setErpFiles] = useState<File[]>([])
  const [amDemandaFiles, setAmDemandaFiles] = useState<File[]>([])
  const [amPedidoFiles, setAmPedidoFiles] = useState<File[]>([])
  const [quoteFiles, setQuoteFiles] = useState<File[]>([])

  const isErpLoaded = erpNeeds.length > 0
  const isAmLoaded = supplierItems.some((i) => i.source.startsWith('AM'))
  const isQuoteLoaded = supplierItems.some((i) => i.source === 'DIRECT_QUOTE')

  const handleUpload = (type: 'ERP' | 'AM' | 'QUOTE') => {
    setLoading(type)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90
        return prev + 10
      })
    }, 150)

    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        importData(type)
        setLoading(null)
        toast({ title: 'Sucesso', description: `Dados de ${type} processados com sucesso.` })
      }, 300)
    }, 1500)
  }

  const handleFileChangeError = (msg?: string) => {
    toast({
      title: 'Atenção',
      description:
        typeof msg === 'string' ? msg : 'Por favor, selecione um arquivo válido (CSV ou Excel).',
      variant: 'destructive',
    })
  }

  const showNextStep = isErpLoaded && (isAmLoaded || isQuoteLoaded)

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Importação de Dados</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Faça o upload das suas planilhas para cruzar os dados de compras e otimizar suas decisões.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <UploadCard
          title="Planilha ERP"
          description="Extração de Necessidade e Estoque Mín/Máx do seu sistema."
          loaded={isErpLoaded}
          loading={loading === 'ERP'}
          progress={loading === 'ERP' ? progress : undefined}
          slots={[
            {
              id: 'erp',
              label: 'Relatório de Estoque (ERP)',
              files: erpFiles,
              maxFiles: 1,
              required: true,
              helpText: (
                <div className="text-[11px] text-muted-foreground mt-2 p-3 bg-muted/40 rounded-md border border-border/50">
                  <span className="font-semibold block mb-1.5 text-foreground/80 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Colunas obrigatórias:
                  </span>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Descrição do Produto</li>
                    <li>Quantidade Mínima em Estoque</li>
                    <li>Quantidade Máxima de Estoque</li>
                    <li>Quantidade que deve ser comprada</li>
                  </ul>
                </div>
              ),
            },
          ]}
          onFileChange={(id, files) => setErpFiles(files)}
          onUpload={() => handleUpload('ERP')}
          onError={handleFileChangeError}
        />

        <UploadCard
          title="Ação Magistral"
          description="Relatórios de Demanda (Exclusivos) e Pedidos (Commodities)."
          loaded={isAmLoaded}
          loading={loading === 'AM'}
          progress={loading === 'AM' ? progress : undefined}
          slots={[
            {
              id: 'am_demanda',
              label: 'Relatório de Demanda',
              files: amDemandaFiles,
              maxFiles: 20,
              required: true,
            },
            {
              id: 'am_pedido',
              label: 'Relatório de Pedidos',
              files: amPedidoFiles,
              maxFiles: 20,
              required: true,
            },
          ]}
          onFileChange={(id, files) => {
            if (id === 'am_demanda') setAmDemandaFiles(files)
            if (id === 'am_pedido') setAmPedidoFiles(files)
          }}
          onUpload={() => handleUpload('AM')}
          onError={handleFileChangeError}
        />

        <UploadCard
          title="Cotações Diretas"
          description="Planilhas de cotações enviadas diretamente por fornecedores (Opcional)."
          loaded={isQuoteLoaded}
          loading={loading === 'QUOTE'}
          progress={loading === 'QUOTE' ? progress : undefined}
          slots={[
            {
              id: 'quote',
              label: 'Cotação de Fornecedor',
              files: quoteFiles,
              maxFiles: 20,
              required: true,
            },
          ]}
          onFileChange={(id, files) => setQuoteFiles(files)}
          onUpload={() => handleUpload('QUOTE')}
          onError={handleFileChangeError}
        />
      </div>

      {showNextStep && (
        <div className="flex justify-center mt-12 animate-fade-in">
          <Button asChild size="lg" className="gap-2 px-8 shadow-md">
            <Link to="/matching">
              Ir para Mapeamento IA <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
