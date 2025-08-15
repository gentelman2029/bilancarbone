import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Calendar, TrendingDown, CheckCircle, Clock, AlertCircle, Edit, Eye, FileDown, Lightbulb, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useActions } from "@/contexts/ActionsContext";
import { useEmissions } from "@/contexts/EmissionsContext";
import { ActionFilters } from "@/components/ActionFilters";
import { generateSuggestedActions } from "@/utils/suggestedActions";

export const Actions = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { emissions } = useEmissions();
  const { 
    actions, 
    addAction, 
    updateAction, 
    deleteAction,
    getTotalImpact,
    getCompletedImpact,
    filteredActions,
    setFilters,
    sortActions,
    exportToPDF,
    exportToExcel
  } = useActions();

  const [newAction, setNewAction] = useState({
    title: "",
    description: "",
    impact: "",
    cost: "",
    deadline: "",
    scope: "Scope 1",
    priority: "medium" as const,
    implementationTime: "",
    category: "",
    responsible: ""
  });

  const [editingAction, setEditingAction] = useState<any>(null);
  const [viewingAction, setViewingAction] = useState<any>(null);
  const [suggestedActions, setSuggestedActions] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter and sort states (managed through ActionFilters component)
  const [filters, setFiltersState] = useState({});
  const [sortField, setSortField] = useState('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    // Generate suggested actions based on emissions data
    if (emissions.scope1 || emissions.scope2 || emissions.scope3) {
      const suggestions = generateSuggestedActions({
        scope1: emissions.scope1,
        scope2: emissions.scope2,
        scope3: emissions.scope3
      });
      setSuggestedActions(suggestions);
    }
  }, [emissions]);

  const handleCreateAction = async () => {
    if (!newAction.title || !newAction.description || !newAction.impact || !newAction.cost || !newAction.deadline) {
      toast({
        title: t('common.error'),
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const action = {
      title: newAction.title,
      description: newAction.description,
      impact: parseFloat(newAction.impact),
      cost: parseFloat(newAction.cost.replace(/[€,\s]/g, '')),
      deadline: newAction.deadline,
      scope: newAction.scope,
      priority: newAction.priority,
      implementationTime: newAction.implementationTime,
      category: newAction.category,
      responsible: newAction.responsible,
      status: "todo" as const,
      progress: 0,
      estimatedReduction: 0,
      calculationId: emissions.calculationId
    };

    await addAction(action);
    setNewAction({
      title: "",
      description: "",
      impact: "",
      cost: "",
      deadline: "",
      scope: "Scope 1",
      priority: "medium" as const,
      implementationTime: "",
      category: "",
      responsible: ""
    });
    setShowCreateDialog(false);

    toast({
      title: t('common.success'),
      description: "L'action a été ajoutée avec succès"
    });
  };

  const handleAddSuggestedAction = async (suggestion: any) => {
    await addAction({
      ...suggestion,
      calculationId: emissions.calculationId
    });

    setSuggestedActions(prev => prev.filter(s => s.title !== suggestion.title));
    toast({
      title: t('common.success'),
      description: "Action suggérée ajoutée au plan"
    });
  };

  const handleEditAction = (action: any) => {
    setEditingAction({...action});
  };

  const handleUpdateAction = async () => {
    if (!editingAction.title || !editingAction.description) {
      toast({
        title: t('common.error'),
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    await updateAction(editingAction.id, editingAction);
    setEditingAction(null);

    toast({
      title: t('common.success'),
      description: "L'action a été mise à jour"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-accent" />;
      case "todo":
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
      case "delayed":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-primary/10 text-primary">{t('actions.status.completed')}</Badge>;
      case "in-progress":
        return <Badge className="bg-accent/10 text-accent">{t('actions.status.in_progress')}</Badge>;
      case "todo":
        return <Badge variant="secondary">{t('actions.status.todo')}</Badge>;
      case "delayed":
        return <Badge variant="destructive">{t('actions.status.delayed')}</Badge>;
      default:
        return <Badge variant="secondary">Non défini</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const totalImpact = getTotalImpact();
  const completedImpact = getCompletedImpact();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('actions.title')}</h1>
          <p className="text-muted-foreground">{t('actions.tracking')}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToPDF()} className="gap-2">
            <FileDown className="w-4 h-4" />
            {t('actions.export.pdf')}
          </Button>
          <Button variant="outline" onClick={() => exportToExcel()} className="gap-2">
            <Download className="w-4 h-4" />
            {t('actions.export.excel')}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="eco">
                <Plus className="w-4 h-4 mr-2" />
                {t('actions.add_action')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle action</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre*</Label>
                  <Input
                    id="title"
                    value={newAction.title}
                    onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                    placeholder="Nom de l'action"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    value={newAction.description}
                    onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                    placeholder="Description détaillée"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="impact">Impact (tCO2e)*</Label>
                    <Input
                      id="impact"
                      type="number"
                      value={newAction.impact}
                      onChange={(e) => setNewAction({...newAction, impact: e.target.value})}
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Coût (€)*</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newAction.cost}
                      onChange={(e) => setNewAction({...newAction, cost: e.target.value})}
                      placeholder="Ex: 10000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scope">Scope*</Label>
                    <Select
                      value={newAction.scope}
                      onValueChange={(value) => setNewAction({...newAction, scope: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scope 1">Scope 1</SelectItem>
                        <SelectItem value="Scope 2">Scope 2</SelectItem>
                        <SelectItem value="Scope 3">Scope 3</SelectItem>
                        <SelectItem value="Transverse">{t('actions.scope.transverse')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Échéance*</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newAction.deadline}
                      onChange={(e) => setNewAction({...newAction, deadline: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Select
                      value={newAction.priority}
                      onValueChange={(value: any) => setNewAction({...newAction, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('actions.priority.low')}</SelectItem>
                        <SelectItem value="medium">{t('actions.priority.medium')}</SelectItem>
                        <SelectItem value="high">{t('actions.priority.high')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="responsible">{t('actions.form.responsible')}</Label>
                    <Input
                      id="responsible"
                      value={newAction.responsible}
                      onChange={(e) => setNewAction({...newAction, responsible: e.target.value})}
                      placeholder={t('actions.form.responsible_placeholder')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={newAction.category}
                    onChange={(e) => setNewAction({...newAction, category: e.target.value})}
                    placeholder="Ex: Énergie, Transport, etc."
                  />
                </div>
                <Button onClick={handleCreateAction} className="w-full">
                  Créer l'action
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Suggested Actions */}
      {suggestedActions.length > 0 && (
        <Card className="p-6 mb-8 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">{t('actions.suggested_actions')}</h3>
            <Badge variant="secondary">{suggestedActions.length}</Badge>
          </div>
          <div className="grid gap-4">
            {suggestedActions.slice(0, 3).map((suggestion, index) => (
              <div key={index} className="flex justify-between items-start p-4 bg-background rounded-lg border">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>-{suggestion.impact.toFixed(1)} tCO2e</span>
                    <span>{(suggestion.cost / 1000).toFixed(0)}k€</span>
                    <span className={getPriorityColor(suggestion.priority)}>
                      {t(`actions.priority.${suggestion.priority}`)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddSuggestedAction(suggestion)}
                  className="ml-4"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalImpact.toFixed(1)} tCO2e</p>
              <p className="text-sm text-muted-foreground">Potentiel total</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <TrendingDown className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{completedImpact.toFixed(1)} tCO2e</p>
              <p className="text-sm text-muted-foreground">Déjà réalisé</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalImpact > 0 ? Math.round((completedImpact / totalImpact) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Progression</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <ActionFilters
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFiltersState(prev => ({ ...prev, ...newFilters }));
          setFilters(newFilters);
        }}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
          sortActions(field, direction);
        }}
        actionsCount={actions.length}
        filteredCount={filteredActions.length}
      />

      {/* Actions List */}
      <div className="space-y-6 mt-6">
        {filteredActions.map((action) => (
          <Card key={action.id} className="p-6 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {getStatusIcon(action.status)}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{action.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{action.description}</p>
                  {action.responsible && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Responsable: {action.responsible}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(action.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">-{action.impact.toFixed(1)} tCO2e</span>
                  <span className="text-muted-foreground">/an</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">{action.scope}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(action.deadline).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  <span className="font-medium text-foreground">{action.cost.toLocaleString()} €</span>
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-foreground">{action.progress}%</span>
              </div>
              <Progress value={action.progress} className="h-2" />
            </div>

            <div className="flex justify-end space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => handleEditAction(action)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Modifier l'action</DialogTitle>
                  </DialogHeader>
                  {editingAction && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title">Titre</Label>
                        <Input
                          id="edit-title"
                          value={editingAction.title}
                          onChange={(e) => setEditingAction({...editingAction, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editingAction.description}
                          onChange={(e) => setEditingAction({...editingAction, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-impact">Impact (tCO2e)</Label>
                          <Input
                            id="edit-impact"
                            type="number"
                            value={editingAction.impact}
                            onChange={(e) => setEditingAction({...editingAction, impact: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-progress">Progression (%)</Label>
                          <Input
                            id="edit-progress"
                            type="number"
                            min="0"
                            max="100"
                            value={editingAction.progress}
                            onChange={(e) => setEditingAction({...editingAction, progress: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="edit-status">Statut</Label>
                        <Select
                          value={editingAction.status}
                          onValueChange={(value) => setEditingAction({...editingAction, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">{t('actions.status.todo')}</SelectItem>
                            <SelectItem value="in-progress">{t('actions.status.in_progress')}</SelectItem>
                            <SelectItem value="completed">{t('actions.status.completed')}</SelectItem>
                            <SelectItem value="delayed">{t('actions.status.delayed')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-responsible">{t('actions.form.responsible')}</Label>
                        <Input
                          id="edit-responsible"
                          value={editingAction.responsible || ''}
                          onChange={(e) => setEditingAction({...editingAction, responsible: e.target.value})}
                          placeholder={t('actions.form.responsible_placeholder')}
                        />
                      </div>
                      <Button onClick={handleUpdateAction} className="w-full">
                        Mettre à jour
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>

      {filteredActions.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune action trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {actions.length === 0 
              ? "Créez votre première action pour commencer"
              : "Aucune action ne correspond aux filtres sélectionnés"
            }
          </p>
          {actions.length === 0 && (
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer une action
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};