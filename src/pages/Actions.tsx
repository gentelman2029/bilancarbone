import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Calendar, TrendingDown, CheckCircle, Clock, AlertCircle, Edit, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useActions } from "@/contexts/ActionsContext";
import { useEmissions } from "@/contexts/EmissionsContext";

export const Actions = () => {
  const { toast } = useToast();
  const { emissions } = useEmissions();
  const { 
    actions, 
    addAction, 
    updateAction, 
    deleteAction,
    getTotalImpact,
    getCompletedImpact 
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
    category: ""
  });

  const [editingAction, setEditingAction] = useState<any>(null);
  const [viewingAction, setViewingAction] = useState<any>(null);

  const handleCreateAction = async () => {
    if (!newAction.title || !newAction.description || !newAction.impact || !newAction.cost || !newAction.deadline) {
      toast({
        title: "Erreur",
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
      status: "planned" as const,
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
      category: ""
    });

    toast({
      title: "Action créée",
      description: "L'action a été ajoutée avec succès au plan"
    });
  };

  const handleEditAction = (action: any) => {
    setEditingAction({...action});
  };

  const handleUpdateAction = async () => {
    if (!editingAction.title || !editingAction.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    await updateAction(editingAction.id, editingAction);
    setEditingAction(null);

    toast({
      title: "Action modifiée",
      description: "L'action a été mise à jour avec succès"
    });
  };

  const handleViewAction = (action: any) => {
    setViewingAction(action);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-accent" />;
      case "planned":
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
        return <Badge className="bg-primary/10 text-primary">Terminé</Badge>;
      case "in-progress":
        return <Badge className="bg-accent/10 text-accent">En cours</Badge>;
      case "planned":
        return <Badge variant="secondary">Planifié</Badge>;
      case "delayed":
        return <Badge variant="destructive">En retard</Badge>;
      default:
        return <Badge variant="secondary">Non défini</Badge>;
    }
  };

  const totalImpact = getTotalImpact();
  const completedImpact = getCompletedImpact();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Plan d'actions carbone</h1>
          <p className="text-muted-foreground">Pilotez vos initiatives de réduction d'empreinte</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="eco">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle action
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
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="implementationTime">Durée mise en œuvre</Label>
                  <Input
                    id="implementationTime"
                    value={newAction.implementationTime}
                    onChange={(e) => setNewAction({...newAction, implementationTime: e.target.value})}
                    placeholder="Ex: 3 mois"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalImpact} tCO2e</p>
              <p className="text-sm text-muted-foreground">Potentiel total</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <TrendingDown className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{completedImpact} tCO2e</p>
              <p className="text-sm text-muted-foreground">Déjà réalisé</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round((completedImpact / totalImpact) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Progression</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {actions.map((action) => (
          <Card key={action.id} className="p-6 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {getStatusIcon(action.status)}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{action.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{action.description}</p>
                </div>
              </div>
              {getStatusBadge(action.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">-{action.impact} tCO2e</span>
                  <span className="text-muted-foreground">/an</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">{action.scope}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{action.deadline}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  <span className="font-medium text-foreground">{action.cost.toLocaleString()} €</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-foreground">{action.progress}%</span>
              </div>
              <Progress value={action.progress} className="h-2" />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
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
                            onChange={(e) => setEditingAction({...editingAction, impact: parseInt(e.target.value)})}
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
                            <SelectItem value="planned">Planifié</SelectItem>
                            <SelectItem value="in-progress">En cours</SelectItem>
                            <SelectItem value="completed">Terminé</SelectItem>
                            <SelectItem value="delayed">En retard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleUpdateAction} className="w-full">
                        Mettre à jour
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="eco" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir détails
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Détails de l'action</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-4">
                     <div>
                       <h3 className="font-semibold text-lg">{action.title}</h3>
                       <p className="text-muted-foreground mt-1">{action.description}</p>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <p className="text-sm font-medium">Impact carbone</p>
                         <p className="text-2xl font-bold text-primary">-{action.impact} tCO2e/an</p>
                       </div>
                       <div className="space-y-2">
                         <p className="text-sm font-medium">Coût</p>
                         <p className="text-xl font-semibold">{action.cost?.toLocaleString()} €</p>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <p className="text-sm font-medium">Scope</p>
                         <Badge variant="secondary">{action.scope}</Badge>
                       </div>
                       <div className="space-y-2">
                         <p className="text-sm font-medium">Échéance</p>
                         <p className="text-sm">{action.deadline}</p>
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <div className="flex justify-between">
                         <p className="text-sm font-medium">Statut</p>
                         {getStatusBadge(action.status)}
                       </div>
                       <div className="space-y-1">
                         <div className="flex justify-between text-sm">
                           <span>Progression</span>
                           <span>{action.progress}%</span>
                         </div>
                         <Progress value={action.progress} className="h-2" />
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <p className="text-sm font-medium">Ratio coût/impact</p>
                       <p className="text-sm text-muted-foreground">
                         {Math.round(action.cost / action.impact)} €/tCO2e économisée
                       </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
               </Dialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};