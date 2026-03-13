import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { PlannerProvider } from '@/stores/usePlannerStore'

import Index from './pages/Index'
import Roadmap from './pages/Roadmap'
import Tools from './pages/Tools'
import Planner from './pages/Planner'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="saas-blueprint-theme">
    <PlannerProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/roteiro" element={<Roadmap />} />
              <Route path="/ferramentas" element={<Tools />} />
              <Route path="/plano" element={<Planner />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </PlannerProvider>
  </ThemeProvider>
)

export default App
