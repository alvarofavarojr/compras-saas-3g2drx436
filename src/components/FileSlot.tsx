import { useRef } from 'react'
import { UploadCloud, X, File as FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FileSlotProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  accept: string
  disabled: boolean
  onError: () => void
}

export function FileSlot({ label, file, onChange, accept, disabled, onError }: FileSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected) {
      if (!selected.name.match(/\.(csv|xls|xlsx)$/i)) {
        if (onError) onError()
        if (inputRef.current) inputRef.current.value = ''
        return
      }
    }
    onChange(selected)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground/90">{label}</div>
      {!file ? (
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
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/20 border-primary/20 shadow-sm transition-all duration-200">
          <div className="flex items-center space-x-3 overflow-hidden pr-2">
            <div className="p-2 bg-primary/10 rounded-md shrink-0">
              <FileIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-sm font-medium truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          {!disabled && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onChange(null)}
              title="Remover arquivo"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
      <input
        type="file"
        className="hidden"
        accept={accept}
        ref={inputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  )
}
