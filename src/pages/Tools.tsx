import { useState } from 'react'
import { ExternalLink, Filter } from 'lucide-react'
import { toolsData, ToolCategory } from '@/data/toolsData'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const categories: ToolCategory[] = [
  'Desenvolvimento',
  'Pagamentos',
  'Design',
  'Marketing',
  'No-Code',
]

export default function Tools() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'Todas'>('Todas')

  const filteredTools = toolsData.filter(
    (tool) => activeCategory === 'Todas' || tool.category === activeCategory,
  )

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-3">SaaS Stack</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Uma seleção curada das melhores ferramentas para construir, lançar e escalar o seu SaaS
          sem dores de cabeça.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
          <Filter className="w-4 h-4" /> Filtros:
        </div>
        <div className="flex gap-2">
          <Badge
            variant={activeCategory === 'Todas' ? 'default' : 'secondary'}
            className="cursor-pointer text-sm px-4 py-1"
            onClick={() => setActiveCategory('Todas')}
          >
            Todas
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? 'default' : 'secondary'}
              className="cursor-pointer text-sm px-4 py-1 whitespace-nowrap"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => (
          <Card
            key={tool.id}
            className="group flex flex-col h-full hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all"
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="w-12 h-12 rounded-xl border bg-background flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={tool.logoUrl}
                  alt={`Logo ${tool.name}`}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">{tool.name}</h3>
                <span className="text-xs text-muted-foreground">{tool.category}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                {tool.description}
              </p>
            </CardContent>
            <CardFooter className="pt-4 border-t flex items-center justify-between">
              {tool.freeTier ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                >
                  Tem versão Grátis
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Pago
                </Badge>
              )}
              <Button size="icon" variant="ghost" asChild className="group-hover:text-primary">
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  <span className="sr-only">Visitar site do {tool.name}</span>
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
