// Validation Workflow Component
// Pipeline: Draft → Pre-validation IA → Validation User → Archived

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Archive, 
  Eye,
  MessageSquare,
  History,
  Loader2,
  ChevronRight,
  Sparkles,
  User,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ActivityData, GHG_CATEGORIES } from '@/lib/dataCollection/types';
import { activityDataService } from '@/lib/dataCollection/activityService';
import { smartAssistService, SmartAssistResult } from '@/lib/dataCollection/smartAssistService';

// Workflow statuses
type WorkflowStatus = 'draft' | 'ai_validated' | 'validated' | 'archived' | 'rejected';

interface WorkflowActivity extends ActivityData {
  workflow_status?: WorkflowStatus;
  ai_analysis?: SmartAssistResult;
  comments?: WorkflowComment[];
  history?: WorkflowHistoryItem[];
}

interface WorkflowComment {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

interface WorkflowHistoryItem {
  action: string;
  from_status?: string;
  to_status?: string;
  user_name: string;
  timestamp: string;
  details?: string;
}

interface ValidationWorkflowProps {
  refreshTrigger?: number;
  onValidationComplete?: () => void;
}

export function ValidationWorkflow({ refreshTrigger, onValidationComplete }: ValidationWorkflowProps) {
  const [activities, setActivities] = useState<WorkflowActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkflowStatus>('draft');
  const [selectedActivity, setSelectedActivity] = useState<WorkflowActivity | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load activities
  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const result = await activityDataService.getActivityData();
      if (result.error) throw new Error(result.error);
      
      // Map to workflow activities with local storage for workflow data
      const workflowData = JSON.parse(localStorage.getItem('workflow-data') || '{}');
      
      const mapped: WorkflowActivity[] = (result.data || []).map(activity => ({
        ...activity,
        workflow_status: workflowData[activity.id]?.status || 
          (activity.status === 'validated' ? 'validated' : 
           activity.status === 'integrated' ? 'archived' : 'draft'),
        comments: workflowData[activity.id]?.comments || [],
        history: workflowData[activity.id]?.history || [],
        ai_analysis: workflowData[activity.id]?.ai_analysis,
      }));
      
      setActivities(mapped);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [refreshTrigger]);

  // Save workflow data to local storage
  const saveWorkflowData = (activityId: string, data: Partial<{ 
    status: WorkflowStatus; 
    comments: WorkflowComment[];
    history: WorkflowHistoryItem[];
    ai_analysis: SmartAssistResult;
  }>) => {
    const current = JSON.parse(localStorage.getItem('workflow-data') || '{}');
    current[activityId] = { ...current[activityId], ...data };
    localStorage.setItem('workflow-data', JSON.stringify(current));
  };

  // Run AI analysis
  const runAIAnalysis = async (activity: WorkflowActivity) => {
    setIsAnalyzing(true);
    try {
      const analysis = await smartAssistService.analyzeDocument({
        quantity: activity.quantity,
        unit: activity.unit,
        ghg_scope: activity.ghg_scope,
        ghg_category: activity.ghg_category,
        supplier_name: activity.supplier_name || undefined,
        period_start: activity.period_start,
        period_end: activity.period_end,
        amount_ht: activity.amount_ht || undefined,
      });
      
      // Update activity with AI analysis
      const historyItem: WorkflowHistoryItem = {
        action: 'Analyse IA',
        from_status: activity.workflow_status,
        to_status: 'ai_validated',
        user_name: 'Système IA',
        timestamp: new Date().toISOString(),
        details: `Confiance: ${Math.round(analysis.overall_confidence * 100)}%`,
      };
      
      saveWorkflowData(activity.id, {
        status: 'ai_validated',
        ai_analysis: analysis,
        history: [...(activity.history || []), historyItem],
      });
      
      setActivities(prev => prev.map(a => 
        a.id === activity.id 
          ? { ...a, workflow_status: 'ai_validated', ai_analysis: analysis, history: [...(a.history || []), historyItem] }
          : a
      ));
      
      toast.success('Analyse IA terminée', {
        description: `Confiance: ${Math.round(analysis.overall_confidence * 100)}%`
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Erreur lors de l\'analyse IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Validate activity
  const validateActivity = async (activity: WorkflowActivity) => {
    setIsSubmitting(true);
    try {
      // Update in database
      await activityDataService.validateAndCalculate(activity.id);
      
      const historyItem: WorkflowHistoryItem = {
        action: 'Validation manuelle',
        from_status: activity.workflow_status,
        to_status: 'validated',
        user_name: 'Utilisateur',
        timestamp: new Date().toISOString(),
      };
      
      saveWorkflowData(activity.id, {
        status: 'validated',
        history: [...(activity.history || []), historyItem],
      });
      
      setActivities(prev => prev.map(a => 
        a.id === activity.id 
          ? { ...a, workflow_status: 'validated', status: 'validated', history: [...(a.history || []), historyItem] }
          : a
      ));
      
      toast.success('Activité validée');
      onValidationComplete?.();
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setIsSubmitting(false);
      setSelectedActivity(null);
    }
  };

  // Archive activity
  const archiveActivity = async (activity: WorkflowActivity) => {
    const historyItem: WorkflowHistoryItem = {
      action: 'Archivage',
      from_status: activity.workflow_status,
      to_status: 'archived',
      user_name: 'Utilisateur',
      timestamp: new Date().toISOString(),
    };
    
    saveWorkflowData(activity.id, {
      status: 'archived',
      history: [...(activity.history || []), historyItem],
    });
    
    setActivities(prev => prev.map(a => 
      a.id === activity.id 
        ? { ...a, workflow_status: 'archived', history: [...(a.history || []), historyItem] }
        : a
    ));
    
    toast.success('Activité archivée');
  };

  // Add comment
  const addComment = () => {
    if (!selectedActivity || !comment.trim()) return;
    
    const newComment: WorkflowComment = {
      id: crypto.randomUUID(),
      user_id: 'current-user',
      user_name: 'Utilisateur',
      text: comment,
      created_at: new Date().toISOString(),
    };
    
    const updatedComments = [...(selectedActivity.comments || []), newComment];
    
    saveWorkflowData(selectedActivity.id, { comments: updatedComments });
    
    setActivities(prev => prev.map(a => 
      a.id === selectedActivity.id 
        ? { ...a, comments: updatedComments }
        : a
    ));
    
    setSelectedActivity({ ...selectedActivity, comments: updatedComments });
    setComment('');
    toast.success('Commentaire ajouté');
  };

  // Get counts by status
  const getCounts = () => ({
    draft: activities.filter(a => a.workflow_status === 'draft').length,
    ai_validated: activities.filter(a => a.workflow_status === 'ai_validated').length,
    validated: activities.filter(a => a.workflow_status === 'validated').length,
    archived: activities.filter(a => a.workflow_status === 'archived').length,
  });

  const counts = getCounts();

  // Get status badge
  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="border-gray-400"><Clock className="h-3 w-3 mr-1" />Brouillon</Badge>;
      case 'ai_validated':
        return <Badge variant="outline" className="border-purple-500 text-purple-600"><Sparkles className="h-3 w-3 mr-1" />Pré-validé IA</Badge>;
      case 'validated':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Validé</Badge>;
      case 'archived':
        return <Badge variant="secondary"><Archive className="h-3 w-3 mr-1" />Archivé</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Rejeté</Badge>;
    }
  };

  // Get AI badge
  const getAIBadge = (badge?: 'high' | 'medium' | 'low' | 'manual_required') => {
    if (!badge) return null;
    
    switch (badge) {
      case 'high':
        return <Badge className="bg-green-500 text-xs">IA ✓</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 text-xs">IA ~</Badge>;
      case 'low':
        return <Badge className="bg-orange-500 text-xs">IA ?</Badge>;
      case 'manual_required':
        return <Badge variant="destructive" className="text-xs">Manuel requis</Badge>;
    }
  };

  // Get category label
  const getCategoryLabel = (scope: string, category: string) => {
    const scopeCategories = GHG_CATEGORIES[scope as keyof typeof GHG_CATEGORIES] || [];
    const found = scopeCategories.find(c => c.id === category);
    return found?.label || category;
  };

  // Filtered activities by tab
  const filteredActivities = activities.filter(a => a.workflow_status === activeTab);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Pipeline de Validation
          </CardTitle>
          <CardDescription>
            Workflow de validation des données : Brouillon → Pré-validation IA → Validation → Archive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Workflow Steps Visualization */}
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
            {/* Draft */}
            <div className={`flex flex-col items-center ${activeTab === 'draft' ? 'opacity-100' : 'opacity-60'}`}>
              <div className={`p-3 rounded-full ${activeTab === 'draft' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs mt-2">Brouillon</span>
              <Badge variant="secondary" className="mt-1">{counts.draft}</Badge>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            
            {/* AI Validated */}
            <div className={`flex flex-col items-center ${activeTab === 'ai_validated' ? 'opacity-100' : 'opacity-60'}`}>
              <div className={`p-3 rounded-full ${activeTab === 'ai_validated' ? 'bg-purple-500 text-white' : 'bg-muted'}`}>
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs mt-2">Pré-validé IA</span>
              <Badge variant="secondary" className="mt-1">{counts.ai_validated}</Badge>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            
            {/* Validated */}
            <div className={`flex flex-col items-center ${activeTab === 'validated' ? 'opacity-100' : 'opacity-60'}`}>
              <div className={`p-3 rounded-full ${activeTab === 'validated' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-xs mt-2">Validé</span>
              <Badge variant="secondary" className="mt-1">{counts.validated}</Badge>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            
            {/* Archived */}
            <div className={`flex flex-col items-center ${activeTab === 'archived' ? 'opacity-100' : 'opacity-60'}`}>
              <div className={`p-3 rounded-full ${activeTab === 'archived' ? 'bg-gray-500 text-white' : 'bg-muted'}`}>
                <Archive className="h-5 w-5" />
              </div>
              <span className="text-xs mt-2">Archivé</span>
              <Badge variant="secondary" className="mt-1">{counts.archived}</Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as WorkflowStatus)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="draft">Brouillons ({counts.draft})</TabsTrigger>
              <TabsTrigger value="ai_validated">Pré-validés ({counts.ai_validated})</TabsTrigger>
              <TabsTrigger value="validated">Validés ({counts.validated})</TabsTrigger>
              <TabsTrigger value="archived">Archives ({counts.archived})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune activité dans cette catégorie
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredActivities.map(activity => (
                    <div 
                      key={activity.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">
                            {getCategoryLabel(activity.ghg_scope, activity.ghg_category)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.quantity.toLocaleString('fr-FR')} {activity.unit} • 
                            {activity.co2_equivalent_kg 
                              ? ` ${activity.co2_equivalent_kg.toFixed(2)} kgCO₂e`
                              : ' Non calculé'}
                          </p>
                        </div>
                        {getAIBadge(activity.ai_analysis?.ai_badge)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activity.comments && activity.comments.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {activity.comments.length}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {activity.comments.length} commentaire(s)
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {activeTab === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => runAIAnalysis(activity)}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            <span className="ml-1 hidden sm:inline">Analyser</span>
                          </Button>
                        )}
                        
                        {(activeTab === 'draft' || activeTab === 'ai_validated') && (
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedActivity(activity)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Valider
                          </Button>
                        )}
                        
                        {activeTab === 'validated' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => archiveActivity(activity)}
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            Archiver
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => { setSelectedActivity(activity); setShowHistory(true); }}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedActivity && !showHistory} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Validation de l'activité</DialogTitle>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4">
              {/* AI Analysis Summary */}
              {selectedActivity.ai_analysis && (
                <div className={`p-4 rounded-lg border ${
                  selectedActivity.ai_analysis.ai_badge === 'high' ? 'bg-green-50 border-green-200' :
                  selectedActivity.ai_analysis.ai_badge === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Analyse IA</span>
                    {getAIBadge(selectedActivity.ai_analysis.ai_badge)}
                  </div>
                  <p className="text-sm">
                    Confiance: {Math.round(selectedActivity.ai_analysis.overall_confidence * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedActivity.ai_analysis.scope_suggestion.reason}
                  </p>
                  
                  {selectedActivity.ai_analysis.anomalies.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedActivity.ai_analysis.anomalies.map((anomaly, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className={`h-3 w-3 ${
                            anomaly.severity === 'high' ? 'text-red-500' :
                            anomaly.severity === 'medium' ? 'text-amber-500' :
                            'text-gray-500'
                          }`} />
                          {anomaly.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Scope</p>
                  <p className="font-medium">{selectedActivity.ghg_scope}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Catégorie</p>
                  <p className="font-medium">{getCategoryLabel(selectedActivity.ghg_scope, selectedActivity.ghg_category)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantité</p>
                  <p className="font-medium">{selectedActivity.quantity} {selectedActivity.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Émissions</p>
                  <p className="font-medium">{selectedActivity.co2_equivalent_kg?.toFixed(2) || '-'} kgCO₂e</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Commentaires</p>
                <ScrollArea className="h-32 border rounded-lg p-2">
                  {selectedActivity.comments && selectedActivity.comments.length > 0 ? (
                    selectedActivity.comments.map(c => (
                      <div key={c.id} className="mb-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{c.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="ml-5">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Aucun commentaire</p>
                  )}
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Ajouter un commentaire..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={addComment} disabled={!comment.trim()}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedActivity(null)}>
              Annuler
            </Button>
            <Button 
              onClick={() => selectedActivity && validateActivity(selectedActivity)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Valider et calculer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory && !!selectedActivity} onOpenChange={() => setShowHistory(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-64">
            {selectedActivity?.history && selectedActivity.history.length > 0 ? (
              <div className="space-y-3">
                {selectedActivity.history.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm border-l-2 border-primary/30 pl-3">
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.user_name} • {new Date(item.timestamp).toLocaleString('fr-FR')}
                      </p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucun historique</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
