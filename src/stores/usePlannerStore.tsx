import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ProjectData {
  name: string
  problem: string
  audience: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  phase: number
}

interface PlannerStoreState {
  projectData: ProjectData
  setProjectData: (data: Partial<ProjectData>) => void
  checklist: ChecklistItem[]
  toggleChecklistItem: (id: string) => void
  progress: number
}

const defaultChecklist: ChecklistItem[] = [
  { id: '1-1', text: 'Definir o nicho de mercado', completed: false, phase: 1 },
  { id: '1-2', text: 'Identificar a dor principal', completed: false, phase: 1 },
  { id: '2-1', text: 'Entrevistar 5 potenciais clientes', completed: false, phase: 2 },
  { id: '2-2', text: 'Criar Landing Page de pré-venda', completed: false, phase: 2 },
  {
    id: '3-1',
    text: 'Listar features essenciais (cortar os excessos)',
    completed: false,
    phase: 3,
  },
  { id: '3-2', text: 'Desenhar wireframes básicos', completed: false, phase: 3 },
  { id: '4-1', text: 'Definir modelo de precificação', completed: false, phase: 4 },
  { id: '5-1', text: 'Escolher a Stack Tecnológica', completed: false, phase: 5 },
  {
    id: '5-2',
    text: 'Configurar gateway de pagamento (Stripe/Pagar.me)',
    completed: false,
    phase: 5,
  },
]

const PlannerContext = createContext<PlannerStoreState | null>(null)

export const PlannerProvider = ({ children }: { children: ReactNode }) => {
  const [projectData, setProjectDataState] = useState<ProjectData>(() => {
    const saved = localStorage.getItem('saas-planner-data')
    return saved ? JSON.parse(saved) : { name: '', problem: '', audience: '' }
  })

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('saas-planner-checklist')
    return saved ? JSON.parse(saved) : defaultChecklist
  })

  useEffect(() => {
    localStorage.setItem('saas-planner-data', JSON.stringify(projectData))
  }, [projectData])

  useEffect(() => {
    localStorage.setItem('saas-planner-checklist', JSON.stringify(checklist))
  }, [checklist])

  const setProjectData = (data: Partial<ProjectData>) => {
    setProjectDataState((prev) => ({ ...prev, ...data }))
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    )
  }

  const completedCount = checklist.filter((item) => item.completed).length
  const progress = Math.round((completedCount / checklist.length) * 100) || 0

  return (
    <PlannerContext.Provider
      value={{ projectData, setProjectData, checklist, toggleChecklistItem, progress }}
    >
      {children}
    </PlannerContext.Provider>
  )
}

export default function usePlannerStore() {
  const context = useContext(PlannerContext)
  if (!context) {
    throw new Error('usePlannerStore must be used within a PlannerProvider')
  }
  return context
}
