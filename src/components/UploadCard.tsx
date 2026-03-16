import { CheckCircle2, FileSpreadsheet, UploadCloud } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { FileSlot } from './FileSlot'

export type SlotConfig = {
  id: string
  label: string
  files: File[]
  required?: boolean
  maxFiles?: number
  helpText?: React.ReactNode
  accept?: string
  validExtensions?: string[]
  errorMessage?: string
  formatHelpText?: string
}

export interface UploadCardProps {
  title: string
  description: string
  slots: SlotConfig[]
  onFileChange: (slotId: string, files: File[]) => void
  onUpload: () => void
  loading: boolean
  progress?: number
  loaded: boolean
  onError: (msg: string) => void
}

export function UploadCard({
  title,
  description,
  slots,
  onFileChange,
  onUpload,
  loading,
  progress,
  loaded,
  onError,
}: UploadCardProps) {
  const allRequiredFilesPresent = slots.every((s) => !s.required || s.files.length > 0)
  const anyFilePresent = slots.some((s) => s.files.length > 0)
  const canUpload = anyFilePresent && allRequiredFilesPresent && !loading && !loaded

  return (
    <Card
      className={cn(
        'flex flex-col h-full transition-colors',
        loaded ? 'border-primary/50 bg-primary/[0.03]' : '',
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {loaded ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
          )}
          {title}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-5 pb-4">
        {slots.map((slot) => (
          <div key={slot.id} className="space-y-1.5">
            <FileSlot
              label={slot.label}
              files={slot.files}
              onChange={(files) => onFileChange(slot.id, files)}
              accept={
                slot.accept ||
                '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
              }
              validExtensions={slot.validExtensions || ['csv', 'xls', 'xlsx']}
              errorMessage={
                slot.errorMessage || 'Por favor, selecione apenas arquivos válidos (CSV ou Excel).'
              }
              formatHelpText={slot.formatHelpText || 'CSV ou Excel (.xlsx, .xls)'}
              disabled={loading || loaded}
              maxFiles={slot.maxFiles}
              onError={onError}
            />
            {slot.helpText}
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-2 flex flex-col gap-3 items-stretch">
        {loading && typeof progress === 'number' && (
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processando arquivos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
        {loaded ? (
          <div className="w-full flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-500/10 py-2.5 rounded-md border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> Dados Processados
          </div>
        ) : (
          <Button
            className="w-full transition-all"
            onClick={onUpload}
            disabled={!canUpload || loading}
            variant={canUpload ? 'default' : 'secondary'}
          >
            {loading ? 'Processando...' : 'Processar Dados'}
            {!loading && canUpload && <UploadCloud className="w-4 h-4 ml-2" />}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
