import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Bell,
  CalendarDays
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CBAMDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Haute' | 'Moyenne' | 'Faible';
  status: 'À venir' | 'En retard' | 'Terminé';
  type: 'Rapport' | 'Notification' | 'Audit' | 'Formation';
  productIds: string[];
}

export const CBAMSchedules = () => {
  const [deadlines, setDeadlines] = useState<CBAMDeadline[]>([
    {
      id: '1',
      title: 'Rapport Trimestriel Q1 2024',
      description: 'Soumission du rapport CBAM pour le premier trimestre',
      dueDate: '2024-01-31',
      priority: 'Haute',
      status: 'À venir',
      type: 'Rapport',
      productIds: ['1', '2']
    },
    {
      id: '2',
      title: 'Formation équipe CBAM',
      description: 'Formation du personnel sur les nouvelles procédures',
      dueDate: '2024-02-15',
      priority: 'Moyenne',
      status: 'À venir',
      type: 'Formation',
      productIds: []
    },
    {
      id: '3',
      title: 'Audit interne émissions',
      description: 'Vérification des calculs d\'émissions embarquées',
      dueDate: '2024-01-20',
      priority: 'Haute',
      status: 'En retard',
      type: 'Audit',
      productIds: ['1']
    }
  ]);

  const [showNewDeadline, setShowNewDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
    type: ''
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Faible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'À venir': return 'bg-blue-100 text-blue-800';
      case 'En retard': return 'bg-red-100 text-red-800';
      case 'Terminé': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Rapport': return <Calendar className="h-4 w-4" />;
      case 'Notification': return <Bell className="h-4 w-4" />;
      case 'Audit': return <CheckCircle2 className="h-4 w-4" />;
      case 'Formation': return <CalendarDays className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const createDeadline = () => {
    if (!newDeadline.title || !newDeadline.dueDate || !newDeadline.priority || !newDeadline.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const deadline: CBAMDeadline = {
      id: Date.now().toString(),
      title: newDeadline.title,
      description: newDeadline.description,
      dueDate: newDeadline.dueDate,
      priority: newDeadline.priority as 'Haute' | 'Moyenne' | 'Faible',
      status: 'À venir',
      type: newDeadline.type as 'Rapport' | 'Notification' | 'Audit' | 'Formation',
      productIds: []
    };

    setDeadlines(prev => [...prev, deadline]);

    toast({
      title: "Échéance créée",
      description: `Nouvelle échéance "${newDeadline.title}" ajoutée au calendrier`
    });

    setShowNewDeadline(false);
    setNewDeadline({ title: '', description: '', dueDate: '', priority: '', type: '' });
  };

  const editDeadline = (id: string) => {
    toast({
      title: "Édition d'échéance",
      description: "Ouverture du formulaire d'édition..."
    });
  };

  const deleteDeadline = (id: string) => {
    toast({
      title: "Échéance supprimée",
      description: "L'échéance a été supprimée avec succès"
    });
  };

  const setReminder = (id: string) => {
    toast({
      title: "Rappel configuré",
      description: "Vous recevrez une notification 3 jours avant l'échéance"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton nouvelle échéance */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendrier des Échéances CBAM</h2>
          <p className="text-muted-foreground">
            Suivez et gérez vos obligations de reporting et conformité
          </p>
        </div>
        <Dialog open={showNewDeadline} onOpenChange={setShowNewDeadline}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Échéance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une Nouvelle Échéance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre*</Label>
                <Input
                  id="title"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nom de l'échéance..."
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description détaillée..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Date d'échéance*</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newDeadline.dueDate}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priorité*</Label>
                  <Select value={newDeadline.priority} onValueChange={(value) => setNewDeadline(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau de priorité..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haute">Haute</SelectItem>
                      <SelectItem value="Moyenne">Moyenne</SelectItem>
                      <SelectItem value="Faible">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="type">Type*</Label>
                <Select value={newDeadline.type} onValueChange={(value) => setNewDeadline(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type d'échéance..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rapport">Rapport</SelectItem>
                    <SelectItem value="Notification">Notification</SelectItem>
                    <SelectItem value="Audit">Audit</SelectItem>
                    <SelectItem value="Formation">Formation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createDeadline} className="flex-1">
                  Créer l'Échéance
                </Button>
                <Button variant="outline" onClick={() => setShowNewDeadline(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vue d'ensemble rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-muted-foreground">Échéances urgentes</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">5</div>
              <div className="text-sm text-muted-foreground">Cette semaine</div>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-muted-foreground">Terminées ce mois</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">15j</div>
              <div className="text-sm text-muted-foreground">Prochaine échéance</div>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Liste des échéances */}
      <Card>
        <CardHeader>
          <CardTitle>Prochaines Échéances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deadlines.map((deadline) => {
              const daysRemaining = calculateDaysRemaining(deadline.dueDate);
              return (
                <Card key={deadline.id} className={`p-4 border-l-4 ${
                  deadline.status === 'En retard' ? 'border-l-red-500' :
                  daysRemaining <= 7 ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(deadline.type)}
                        <h3 className="font-semibold">{deadline.title}</h3>
                        <Badge className={getPriorityColor(deadline.priority)}>
                          {deadline.priority}
                        </Badge>
                        <Badge className={getStatusColor(deadline.status)}>
                          {deadline.status}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-2">
                        {deadline.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {deadline.dueDate}
                        </span>
                        <span className={`flex items-center gap-1 font-medium ${
                          daysRemaining < 0 ? 'text-red-600' :
                          daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          <Clock className="h-4 w-4" />
                          {daysRemaining < 0 
                            ? `En retard de ${Math.abs(daysRemaining)} jour(s)`
                            : daysRemaining === 0 
                            ? 'Aujourd\'hui'
                            : `Dans ${daysRemaining} jour(s)`
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setReminder(deadline.id)}
                        title="Configurer un rappel"
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => editDeadline(deadline.id)}
                        title="Éditer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteDeadline(deadline.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};