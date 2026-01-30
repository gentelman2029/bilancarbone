import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Kanban, 
  Users, 
  BookOpen, 
  Plus,
  Sparkles,
  FileText
} from 'lucide-react';
import { RSEKanbanBoard } from '@/components/rse/RSEKanbanBoard';
import { RSEActionForm } from '@/components/rse/RSEActionForm';
import { RSEStakeholderMatrix } from '@/components/rse/RSEStakeholderMatrix';
import { RSEActionLibrary } from '@/components/rse/RSEActionLibrary';
import { RSEStrategicDashboard } from '@/components/rse/RSEStrategicDashboard';
import { RSEPilotageReport } from '@/components/rse/RSEPilotageReport';
import { RSEReportViewer, generateRSEReportPDF } from '@/components/rse/report';
import { useRSEReport } from '@/hooks/useRSEReport';
import { RSEAction, ActionStatus, DEFAULT_STAKEHOLDERS } from '@/lib/rse/types';
import { generateActionSuggestions } from '@/lib/rse/actionEngine';
import { BVMT_ESG_SCHEMA, ESGCategory } from '@/lib/esg/types';
import { toast } from 'sonner';

export default function RSEPilotage() {
  const [actions, setActions] = useState<RSEAction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<RSEAction | null>(null);
  const [stakeholders] = useState(DEFAULT_STAKEHOLDERS);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Integrated RSE Report hook
  const { reportData, isLoading: isReportLoading, refreshReport } = useRSEReport(actions);

  // Load actions from localStorage
  useEffect(() => {
    const savedActions = localStorage.getItem('rse_actions');
    if (savedActions) {
      setActions(JSON.parse(savedActions));
    }
  }, []);

  // Save actions to localStorage
  useEffect(() => {
    localStorage.setItem('rse_actions', JSON.stringify(actions));
  }, [actions]);

  const handleStatusChange = (id: string, status: ActionStatus) => {
    setActions(prev => prev.map(a => 
      a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
    ));
    toast.success('Statut mis à jour');
  };

  const handleEditAction = (action: RSEAction) => {
    setEditingAction(action);
    setIsFormOpen(true);
  };

  const handleSaveAction = (actionData: Omit<RSEAction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingAction) {
      setActions(prev => prev.map(a => 
        a.id === editingAction.id 
          ? { ...a, ...actionData, updatedAt: now }
          : a
      ));
      toast.success('Action mise à jour');
    } else {
      const newAction: RSEAction = {
        ...actionData,
        id: `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        status: 'todo',
      };
      setActions(prev => [...prev, newAction]);
      toast.success('Action créée');
    }
    
    setEditingAction(null);
  };

  const handleAddFromLibrary = (actionData: Omit<RSEAction, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = new Date().toISOString();
    const newAction: RSEAction = {
      ...actionData,
      id: `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      status: 'todo',
    };
    setActions(prev => [...prev, newAction]);
    toast.success('Action ajoutée au backlog');
  };

  const handleGenerateSuggestions = () => {
    // Get ESG data from localStorage
    const savedEsgData = localStorage.getItem('esg_data');
    if (!savedEsgData) {
      toast.error('Veuillez d\'abord remplir les données ESG dans le module de scoring');
      return;
    }

    try {
      const esgData = JSON.parse(savedEsgData);
      const suggestions = generateActionSuggestions(esgData.categories || BVMT_ESG_SCHEMA);
      
      // Filter out already existing suggestions
      const existingTitles = new Set(actions.map(a => a.title));
      const newSuggestions = suggestions.filter(s => !existingTitles.has(s.title));
      
      if (newSuggestions.length === 0) {
        toast.info('Toutes les suggestions ont déjà été ajoutées');
        return;
      }

      setActions(prev => [...prev, ...newSuggestions]);
      toast.success(`${newSuggestions.length} suggestions générées à partir de vos scores ESG`);
    } catch (error) {
      toast.error('Erreur lors de la génération des suggestions');
    }
  };

  // Handle integrated PDF export
  const handleExportIntegratedPDF = async () => {
    if (!reportData) {
      toast.error('Données du rapport non disponibles');
      return;
    }
    
    setIsExportingPDF(true);
    try {
      await generateRSEReportPDF(reportData, (step) => {
        console.log('PDF Generation:', step);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const suggestionCount = actions.filter(a => a.isSuggestion).length;

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pilotage RSE & Conformité</h1>
          <p className="text-muted-foreground">
            Gestion des actions RSE - Loi 2018-35 & CSRD
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerateSuggestions}>
            <Sparkles className="h-4 w-4 mr-2" />
            Générer Suggestions
            {suggestionCount > 0 && (
              <Badge variant="secondary" className="ml-2">{suggestionCount}</Badge>
            )}
          </Button>
          <Button onClick={() => { setEditingAction(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Action
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
            <Badge variant="secondary" className="ml-1">{actions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Parties Prenantes</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Bibliothèque</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Rapport RSE</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <RSEStrategicDashboard actions={actions} />
        </TabsContent>

        <TabsContent value="kanban">
          <RSEKanbanBoard 
            actions={actions} 
            onStatusChange={handleStatusChange}
            onEditAction={handleEditAction}
          />
        </TabsContent>

        <TabsContent value="stakeholders">
          <RSEStakeholderMatrix stakeholders={stakeholders} />
        </TabsContent>

        <TabsContent value="library">
          <RSEActionLibrary onAddToBacklog={handleAddFromLibrary} />
        </TabsContent>

        <TabsContent value="report">
          {reportData ? (
            <RSEReportViewer 
              reportData={reportData}
              onExportPDF={handleExportIntegratedPDF}
              onRefresh={refreshReport}
              isExporting={isExportingPDF}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Chargement du rapport...</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Form Modal */}
      <RSEActionForm
        open={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingAction(null); }}
        onSave={handleSaveAction}
        editAction={editingAction}
      />

      {/* Hidden Report Dialog - triggered via custom event */}
      <RSEPilotageReport actions={actions} />
    </div>
  );
}
