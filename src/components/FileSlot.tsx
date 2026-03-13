import { useRef } from 'react'
import { UploadCloud, X, File as FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FileSlotProps {
  label: string
  files: File[]
  onChange: (files: File[]) => void
  accept: string
  disabled: boolean
  maxFiles?: number
  onError?: (msg: string) => void
}

export function FileSlot({
  label,
  files,
  onChange,
  accept,
  disabled,
  maxFiles = 1,
  onError,
}: FileSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const validFiles = selected.filter((f) => f.name.match(/\.(csv|xls|xlsx)$/i))
    if (validFiles.length !== selected.length) {
      if (onError) onError('Por favor, selecione apenas arquivos válidos (CSV ou Excel).')
    }

    if (maxFiles === 1) {
      if (validFiles.length > 0) {
        onChange([validFiles[0]])
      }
    } else {
      const newFiles = [...files, ...validFiles]
      const unique = Array.from(new Map(newFiles.map((f) => [f.name, f])).values())
      if (unique.length > maxFiles) {
        if (onError) onError(`Você pode enviar no máximo ${maxFiles} arquivos para esta categoria.`)
        onChange(unique.slice(0, maxFiles))
      } else {
        onChange(unique)
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-foreground/90">{label}</div>
        {maxFiles > 1 && files.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {files.length} / {maxFiles} arquivos
          </div>
        )}
      </div>

      {(!maxFiles || files.length < maxFiles) && !disabled && (
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          className={cn(
            'w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            disabled
              ? 'opacity-50 cursor-not-allowed bg-muted/50'
              : 'hover:bg-accent/40 hover:border-primary/40 cursor-pointer bg-background',
          )}
        >
          <UploadCloud className="w-6 h-6 text-muted-foreground/70 mb-2" />
          <span className="text-sm font-medium text-muted-foreground">Clique para selecionar</span>
          <span className="text-xs text-muted-foreground/70 mt-1">CSV ou Excel (.xlsx, .xls)</span>
        </button>
      )}

      {files.length > 0 && (
        <div className="space-y-2 mt-3 max-h-[160px] overflow-y-auto pr-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 border rounded-lg bg-accent/20 border-primary/20 shadow-sm transition-all duration-200"
            >
              <div className="flex items-center space-x-3 overflow-hidden pr-2">
                <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                  <FileIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-xs font-medium truncate" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeFile(idx)}
                  title="Remover arquivo"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        className="hidden"
        accept={accept}
        ref={inputRef}
        onChange={handleFileChange}
        disabled={disabled}
        multiple={maxFiles > 1}
      />
    </div>
  )
}
