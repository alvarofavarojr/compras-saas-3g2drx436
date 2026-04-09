import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SuppliersTab from './SuppliersTab'
import ErpNeedsTab from './ErpNeedsTab'
import SupplierItemsTab from './SupplierItemsTab'
import MatchedNeedsTab from './MatchedNeedsTab'

export default function DataManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Dados</h1>
        <p className="text-muted-foreground">
          Gerencie seus fornecedores, itens e necessidades de ERP.
        </p>
      </div>
      <Tabs defaultValue="suppliers">
        <TabsList className="w-full sm:w-auto overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="erp-needs">Necessidades ERP</TabsTrigger>
          <TabsTrigger value="supplier-items">Itens</TabsTrigger>
          <TabsTrigger value="matched-needs">Mapeamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers">
          <SuppliersTab />
        </TabsContent>
        <TabsContent value="erp-needs">
          <ErpNeedsTab />
        </TabsContent>
        <TabsContent value="supplier-items">
          <SupplierItemsTab />
        </TabsContent>
        <TabsContent value="matched-needs">
          <MatchedNeedsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
