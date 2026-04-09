import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Rocket,
  Menu,
  Moon,
  Sun,
  UploadCloud,
  BrainCircuit,
  LineChart,
  Map,
  Database,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Importar Dados', path: '/', icon: UploadCloud },
    { name: 'Mapeamento IA', path: '/matching', icon: BrainCircuit },
    { name: 'Otimização', path: '/optimization', icon: LineChart },
    { name: 'Roteiro', path: '/roteiro', icon: Map },
    { name: 'Gestão de Dados', path: '/dados', icon: Database },
  ]

  const NavItems = () => (
    <>
      {navLinks.map((link) => {
        const Icon = link.icon
        const isActive = location.pathname === link.path
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
            )}
          >
            <Icon className="w-4 h-4" />
            {link.name}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <header className="glass-nav border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">ProcureSaaS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavItems />
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <SheetDescription className="sr-only">
                  Acesse as páginas da ferramenta
                </SheetDescription>
                <div className="flex flex-col gap-2 mt-8">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t py-8 mt-12 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">Gestão de Compras Inteligente.</p>
          <p className="mt-2">
            © {new Date().getFullYear()} ProcureSaaS. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
