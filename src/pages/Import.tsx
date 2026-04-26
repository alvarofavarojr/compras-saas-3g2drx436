import { useState } from 'react'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import useProcurementStore from '@/stores/useProcurementStore'
import { Link } from 'react-router-dom'
import { UploadCard } from '@/components/UploadCard'
import pb from '@/lib/pocketbase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ImportPage() {
  const { importData, erpNeeds, supplierItems, suppliers, loadData } = useProcurementStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  const [erpFiles, setErpFiles] = useState<File[]>([])
  const [amDemandaFiles, setAmDemandaFiles] = useState<File[]>([])
  const [amPedidoFiles, setAmPedidoFiles] = useState<File[]>([])
  const [quoteFiles, setQuoteFiles] = useState<File[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')

  const [validationAlert, setValidationAlert] = useState<{
    isOpen: boolean
    type: 'ERP' | 'AM' | 'QUOTE' | null
    message: string
  }>({ isOpen: false, type: null, message: '' })

  const [uploadModeAlert, setUploadModeAlert] = useState<{
    isOpen: boolean
    type: 'ERP' | 'AM' | 'QUOTE' | null
  }>({ isOpen: false, type: null })

  const isErpLoaded = erpNeeds.length > 0
  const isAmLoaded = supplierItems.some((i) => i.source.startsWith('AM'))
  const isQuoteLoaded = supplierItems.some((i) => i.source === 'DIRECT_QUOTE')

  const handleUploadQuote = async () => {
    if (!selectedSupplier) {
      toast({
        title: 'Atenção',
        description: 'Selecione um fornecedor antes de enviar.',
        variant: 'destructive',
      })
      return
    }
    if (quoteFiles.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Selecione um arquivo de cotação.',
        variant: 'destructive',
      })
      return
    }

    setLoading('QUOTE')
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10))
    }, 150)

    try {
      const formData = new FormData()
      formData.append('file', quoteFiles[0])
      formData.append('supplier_id', selectedSupplier)

      const res = await pb.send('/backend/v1/processar_cotacao', {
        method: 'POST',
        body: formData,
      })

      clearInterval(interval)
      setProgress(100)

      setTimeout(async () => {
        await loadData()
        setLoading(null)
        toast({
          title: 'Sucesso',
          description: `Cotação processada! ${res.items_inseridos} itens inseridos.`,
          className: 'bg-emerald-600 text-white border-emerald-700',
        })
        setQuoteFiles([])
        setSelectedSupplier('')
      }, 300)
    } catch (error: any) {
      clearInterval(interval)
      setLoading(null)
      const msg = error.response?.mensagem || error.message || 'Erro desconhecido'
      toast({
        title: 'Erro',
        description: `Erro ao processar cotação: ${msg}`,
        variant: 'destructive',
      })
    }
  }

  const executeUpload = async (
    type: 'ERP' | 'AM' | 'QUOTE',
    mode: 'merge' | 'replace' = 'replace',
  ) => {
    setLoading(type)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90
        return prev + 10
      })
    }, 150)

    try {
      const user = pb.authStore.record
      if (user && mode === 'replace') {
        if (type === 'ERP') {
          const list = await pb.collection('erp_needs').getFullList()
          await Promise.all(list.map((l) => pb.collection('erp_needs').delete(l.id)))
        } else if (type === 'AM') {
          const list = await pb.collection('supplier_items').getFullList()
          const toDelete = list.filter((l) => l.source.startsWith('AM'))
          await Promise.all(toDelete.map((l) => pb.collection('supplier_items').delete(l.id)))
        } else if (type === 'QUOTE') {
          const list = await pb
            .collection('supplier_items')
            .getFullList({ filter: 'source="DIRECT_QUOTE"' })
          await Promise.all(list.map((l) => pb.collection('supplier_items').delete(l.id)))
        }
      }

      await Promise.all([
        importData(type, mode),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ])

      clearInterval(interval)
      setProgress(100)

      setTimeout(() => {
        setLoading(null)
        toast({ title: 'Sucesso', description: `Dados de ${type} processados com sucesso.` })
      }, 300)
    } catch (error) {
      clearInterval(interval)
      setLoading(null)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao importar os dados.',
        variant: 'destructive',
      })
    }
  }

  const handleUpload = async (type: 'ERP' | 'AM' | 'QUOTE') => {
    if (type === 'QUOTE') {
      await handleUploadQuote()
      return
    }

    const isLoaded = type === 'ERP' ? isErpLoaded : isAmLoaded

    if (isLoaded) {
      setUploadModeAlert({ isOpen: true, type })
      return
    }

    proceedWithUpload(type, 'replace')
  }

  const proceedWithUpload = (type: 'ERP' | 'AM' | 'QUOTE', mode: 'merge' | 'replace') => {
    if (type === 'AM') {
      setValidationAlert({
        isOpen: true,
        type,
        message:
          'Identificamos 3 itens com divergência de preço superior a 15% em relação ao histórico anterior. Deseja prosseguir com a importação mesmo assim?',
      })
      return
    }
    if (type === 'QUOTE') {
      setValidationAlert({
        isOpen: true,
        type,
        message:
          'Atenção: A cotação enviada possui itens já cadastrados com valores diferentes na Ação Magistral. O sistema registrará os dois para análise. Prosseguir?',
      })
      return
    }

    executeUpload(type, mode)
  }

  const handleConfirmValidation = () => {
    if (validationAlert.type) {
      executeUpload(validationAlert.type, 'replace')
    }
    setValidationAlert({ isOpen: false, type: null, message: '' })
  }

  const handleModeSelection = (mode: 'merge' | 'replace') => {
    if (uploadModeAlert.type) {
      proceedWithUpload(uploadModeAlert.type, mode)
    }
    setUploadModeAlert({ isOpen: false, type: null })
  }

  const handleFileChangeError = (msg?: string) => {
    toast({
      title: 'Atenção',
      description: typeof msg === 'string' ? msg : 'Por favor, selecione um arquivo válido.',
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
              accept: '.csv, .pdf, .html, .htm, .xlsx, .xls',
            },
            {
              id: 'am_pedido',
              label: 'Relatório de Pedidos',
              files: amPedidoFiles,
              maxFiles: 20,
              required: true,
              accept: '.csv, .pdf, .html, .htm, .xlsx, .xls',
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
          description="Cotações enviadas diretamente por fornecedores (Opcional)."
          loaded={isQuoteLoaded}
          loading={loading === 'QUOTE'}
          progress={loading === 'QUOTE' ? progress : undefined}
          uploadLabel="Upload de Cotação"
          extraUi={
            <div className="space-y-2 px-1">
              <label className="text-sm font-medium text-foreground/80">Fornecedor</label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          slots={[
            {
              id: 'quote',
              label: 'Arquivo da Cotação',
              files: quoteFiles,
              maxFiles: 1,
              required: true,
              accept: '.csv, .pdf, .html, .htm, .xlsx, .xls',
              validExtensions: ['csv', 'pdf', 'html', 'htm', 'xlsx', 'xls'],
              errorMessage:
                'Formato de arquivo não suportado. Por favor, envie arquivos CSV, PDF, HTML ou Excel.',
              formatHelpText: 'CSV, Excel, PDF ou HTML',
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

      <AlertDialog
        open={validationAlert.isOpen}
        onOpenChange={(open) =>
          !open && setValidationAlert({ isOpen: false, type: null, message: '' })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Aviso de Validação
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-foreground/90">
              {validationAlert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmValidation}>
              Prosseguir Importação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={uploadModeAlert.isOpen}
        onOpenChange={(open) => !open && setUploadModeAlert({ isOpen: false, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Como deseja processar o novo upload?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-foreground/90">
              Já existem dados carregados para esta fonte. Escolha como deseja importar os novos
              dados:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => handleModeSelection('merge')}
            >
              <div className="text-left">
                <div className="font-semibold">Atualizar / Mesclar</div>
                <div className="text-xs text-muted-foreground font-normal mt-1">
                  Adiciona novos registros e atualiza os existentes (via UPSERT).
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => handleModeSelection('replace')}
            >
              <div className="text-left">
                <div className="font-semibold text-destructive">Limpar e Substituir</div>
                <div className="text-xs text-muted-foreground font-normal mt-1">
                  Remove os dados antigos e importa a nova planilha como fonte única.
                </div>
              </div>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
