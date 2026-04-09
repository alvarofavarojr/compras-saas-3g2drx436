import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { ProcurementProvider } from '@/stores/useProcurementStore'
import { AuthProvider } from './hooks/use-auth'
import { AuthWrapper } from './components/AuthWrapper'

import Layout from './components/Layout'
import ImportPage from './pages/Import'
import MatchingPage from './pages/Matching'
import OptimizationPage from './pages/Optimization'
import RoadmapPage from './pages/Roadmap'
import DataManagementPage from './pages/DataManagement'
import NotFound from './pages/NotFound'

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <AuthProvider>
      <AuthWrapper>
        <ProcurementProvider>
          <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<ImportPage />} />
                  <Route path="/matching" element={<MatchingPage />} />
                  <Route path="/optimization" element={<OptimizationPage />} />
                  <Route path="/roteiro" element={<RoadmapPage />} />
                  <Route path="/dados" element={<DataManagementPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </BrowserRouter>
        </ProcurementProvider>
      </AuthWrapper>
    </AuthProvider>
  </ThemeProvider>
)

export default App
