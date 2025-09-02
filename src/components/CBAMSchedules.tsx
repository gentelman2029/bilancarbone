import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Bell,
  CalendarDays,
  Search,
  Filter,
  SortAsc,
  AlertCircle,
  XCircle,
  FileText,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      status: 'En retard',
      type: 'Rapport',
      productIds: ['1', '2']
    },
    {
      id: '2',
      title: 'Formation équipe CBAM',
      description: 'Formation du personnel sur les nouvelles procédures',
      dueDate: '2024-02-15',
      priority: 'Moyenne',
      status: 'En retard',
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
    },
    {
      id: '4',
      title: 'Rapport semestriel',
      description: 'Soumission rapport semestrielle',
      dueDate: '2025-12-31',
      priority: 'Haute',
      status: 'À venir',
      type: 'Rapport',
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

  // États pour l'édition
  const [showEditDeadline, setShowEditDeadline] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<CBAMDeadline | null>(null);
  const [editDeadlineForm, setEditDeadlineForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
    type: ''
  });

  // État pour les notifications
  const [notifications, setNotifications] = useState<Set<string>>(new Set());

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // État pour la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'bg-red-500 text-white border-red-500';
      case 'Moyenne': return 'bg-amber-500 text-white border-amber-500';
      case 'Faible': return 'bg-emerald-500 text-white border-emerald-500';
      default: return 'bg-slate-500 text-white border-slate-500';
    }
  };

  const getStatusColor = (status: string, daysLate?: number) => {
    switch (status) {
      case 'À venir': return 'bg-blue-500 text-white border-blue-500';
      case 'En retard': 
        if (daysLate && daysLate > 90) return 'bg-red-900 text-white border-red-900'; // Très critique
        if (daysLate && daysLate > 30) return 'bg-red-700 text-white border-red-700'; // Critique
        return 'bg-red-500 text-white border-red-500'; // Retard normal
      case 'Terminé': return 'bg-emerald-500 text-white border-emerald-500';
      default: return 'bg-slate-500 text-white border-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Rapport': return <FileText className="h-4 w-4" />;
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

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Données filtrées et triées
  const filteredAndSortedDeadlines = useMemo(() => {
    let filtered = deadlines.filter(deadline => {
      const matchesSearch = searchQuery === '' || 
        deadline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deadline.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === '' || statusFilter === 'all' || deadline.status === statusFilter;
      const matchesPriority = priorityFilter === '' || priorityFilter === 'all' || deadline.priority === priorityFilter;
      const matchesType = typeFilter === '' || typeFilter === 'all' || deadline.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    // Tri par date d'échéance (plus proche en premier)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [deadlines, searchQuery, statusFilter, priorityFilter, typeFilter]);

  // Calcul des statistiques dynamiques
  const stats = useMemo(() => {
    const now = new Date();
    const urgent = filteredAndSortedDeadlines.filter(d => {
      const daysRemaining = calculateDaysRemaining(d.dueDate);
      return d.status === 'En retard' || (d.status === 'À venir' && daysRemaining <= 7);
    }).length;

    const thisWeek = filteredAndSortedDeadlines.filter(d => {
      const daysRemaining = calculateDaysRemaining(d.dueDate);
      return d.status === 'À venir' && daysRemaining <= 7 && daysRemaining >= 0;
    }).length;

    const completed = filteredAndSortedDeadlines.filter(d => d.status === 'Terminé').length;

    const nextDeadline = filteredAndSortedDeadlines.find(d => d.status === 'À venir');
    const nextDeadlineText = nextDeadline 
      ? `${formatDueDate(nextDeadline.dueDate)} (dans ${calculateDaysRemaining(nextDeadline.dueDate)} jours)`
      : 'Aucune';

    return { urgent, thisWeek, completed, nextDeadlineText };
  }, [filteredAndSortedDeadlines]);

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
    const deadline = deadlines.find(d => d.id === id);
    if (deadline) {
      setEditingDeadline(deadline);
      setEditDeadlineForm({
        title: deadline.title,
        description: deadline.description,
        dueDate: deadline.dueDate,
        priority: deadline.priority,
        type: deadline.type
      });
      setShowEditDeadline(true);
    }
  };

  const saveEditedDeadline = () => {
    if (!editingDeadline || !editDeadlineForm.title || !editDeadlineForm.dueDate || !editDeadlineForm.priority || !editDeadlineForm.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setDeadlines(prev => prev.map(d => 
      d.id === editingDeadline.id 
        ? {
            ...d,
            title: editDeadlineForm.title,
            description: editDeadlineForm.description,
            dueDate: editDeadlineForm.dueDate,
            priority: editDeadlineForm.priority as 'Haute' | 'Moyenne' | 'Faible',
            type: editDeadlineForm.type as 'Rapport' | 'Notification' | 'Audit' | 'Formation'
          }
        : d
    ));

    toast({
      title: "Échéance modifiée",
      description: `L'échéance "${editDeadlineForm.title}" a été mise à jour`
    });

    setShowEditDeadline(false);
    setEditingDeadline(null);
    setEditDeadlineForm({ title: '', description: '', dueDate: '', priority: '', type: '' });
  };

  const confirmDelete = (id: string) => {
    console.log('confirmDelete appelé avec id:', id);
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const deleteDeadline = () => {
    console.log('deleteDeadline appelé, deleteId:', deleteId);
    setDeadlines(prev => prev.filter(d => d.id !== deleteId));
    setDeleteDialogOpen(false);
    setDeleteId('');
    toast({
      title: "Échéance supprimée",
      description: "L'échéance a été supprimée avec succès"
    });
  };

  const filterByStatus = (status: string) => {
    setStatusFilter(status === statusFilter ? 'all' : status);
  };

  const setReminder = (id: string) => {
    const deadline = deadlines.find(d => d.id === id);
    if (deadline) {
      const newNotifications = new Set(notifications);
      if (newNotifications.has(id)) {
        newNotifications.delete(id);
        toast({
          title: "Rappel désactivé",
          description: "Les notifications pour cette échéance ont été désactivées"
        });
      } else {
        newNotifications.add(id);
        toast({
          title: "Rappel configuré",
          description: "Vous recevrez une notification 3 jours avant l'échéance"
        });
      }
      setNotifications(newNotifications);
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // En-tête du document
    doc.setFontSize(20);
    doc.text('Rapport des Échéances CBAM', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
    doc.text(`Nombre total d'échéances: ${deadlines.length}`, 20, 40);

    // Statistiques
    const urgentCount = deadlines.filter(d => {
      const daysRemaining = calculateDaysRemaining(d.dueDate);
      return d.status === 'En retard' || (d.status === 'À venir' && daysRemaining <= 7);
    }).length;
    
    const lateCount = deadlines.filter(d => d.status === 'En retard').length;
    const completedCount = deadlines.filter(d => d.status === 'Terminé').length;

    doc.text(`Échéances urgentes: ${urgentCount}`, 20, 50);
    doc.text(`En retard: ${lateCount}`, 20, 60);
    doc.text(`Terminées: ${completedCount}`, 20, 70);

    // Tableau des échéances
    const tableData = deadlines.map(deadline => {
      const daysRemaining = calculateDaysRemaining(deadline.dueDate);
      const daysLate = daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
      
      return [
        deadline.title,
        deadline.description,
        deadline.priority,
        deadline.status,
        formatDueDate(deadline.dueDate),
        deadline.status === 'En retard' ? `${daysLate} jours` : 
          daysRemaining === 0 ? 'Aujourd\'hui' : 
          daysRemaining > 0 ? `Dans ${daysRemaining} jours` : '-'
      ];
    });

    autoTable(doc, {
      head: [['Titre', 'Description', 'Criticité', 'État', 'Date d\'échéance', 'Retard/Délai']],
      body: tableData,
      startY: 80,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [63, 81, 181] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });

    // Téléchargement
    doc.save(`rapport-echeances-cbam-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Rapport généré",
      description: "Le rapport PDF a été téléchargé avec succès"
    });
  };

  // Vérification des notifications (simulation)
  useEffect(() => {
    const checkNotifications = () => {
      deadlines.forEach(deadline => {
        if (notifications.has(deadline.id) && deadline.status === 'À venir') {
          const daysRemaining = calculateDaysRemaining(deadline.dueDate);
          if (daysRemaining === 3) {
            toast({
              title: "Rappel d'échéance",
              description: `L'échéance "${deadline.title}" arrive dans 3 jours`
            });
          }
        }
      });
    };

    // Vérification immédiate et ensuite toutes les heures
    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [deadlines, notifications]);

  return (
    <div className="space-y-6">
      {/* Header avec boutons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendrier des Échéances CBAM</h2>
          <p className="text-muted-foreground">
            Suivez et gérez vos obligations de reporting et conformité
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDFReport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
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
      </div>

      {/* Filtres et recherche */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher une échéance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="À venir">À venir</SelectItem>
              <SelectItem value="En retard">En retard</SelectItem>
              <SelectItem value="Terminé">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="Haute">Haute</SelectItem>
              <SelectItem value="Moyenne">Moyenne</SelectItem>
              <SelectItem value="Faible">Faible</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="Rapport">Rapport</SelectItem>
              <SelectItem value="Notification">Notification</SelectItem>
              <SelectItem value="Audit">Audit</SelectItem>
              <SelectItem value="Formation">Formation</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || (statusFilter && statusFilter !== 'all') || (priorityFilter && priorityFilter !== 'all') || (typeFilter && typeFilter !== 'all')) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setTypeFilter('all');
              }}
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Effacer filtres
            </Button>
          )}
        </div>
      </Card>

      {/* Vue d'ensemble rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => filterByStatus('En retard')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-muted-foreground">Échéances urgentes</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">Cette semaine</div>
            </div>
            <Calendar className="h-8 w-8 text-amber-600" />
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => filterByStatus('Terminé')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Terminées ce mois</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-blue-600 leading-tight">
                {stats.nextDeadlineText}
              </div>
              <div className="text-sm text-muted-foreground">Prochaine échéance</div>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Liste des échéances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Prochaines Échéances ({filteredAndSortedDeadlines.length})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SortAsc className="h-4 w-4" />
              Triées par date d'échéance
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedDeadlines.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Aucune échéance trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || (statusFilter && statusFilter !== 'all') || (priorityFilter && priorityFilter !== 'all') || (typeFilter && typeFilter !== 'all') 
                  ? "Essayez d'ajuster vos filtres ou de lancer une nouvelle recherche."
                  : "Créez votre première échéance pour commencer."}
              </p>
              {(searchQuery || (statusFilter && statusFilter !== 'all') || (priorityFilter && priorityFilter !== 'all') || (typeFilter && typeFilter !== 'all')) && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setTypeFilter('all');
                }}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <TooltipProvider>
                {filteredAndSortedDeadlines.map((deadline) => {
                  const daysRemaining = calculateDaysRemaining(deadline.dueDate);
                  const daysLate = daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
                  
                  return (
                    <Card key={deadline.id} className={`p-6 border-l-4 hover:shadow-md transition-shadow ${
                      deadline.status === 'En retard' 
                        ? daysLate > 90 ? 'border-l-red-900 bg-red-50' 
                          : daysLate > 30 ? 'border-l-red-700 bg-red-50'
                          : 'border-l-red-500 bg-red-50'
                        : daysRemaining <= 7 ? 'border-l-amber-500 bg-amber-50' 
                        : 'border-l-emerald-500 bg-emerald-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(deadline.type)}
                              <h3 className="font-semibold text-lg">{deadline.title}</h3>
                            </div>
                            <Badge className={getPriorityColor(deadline.priority)}>
                              {deadline.priority}
                            </Badge>
                            <Badge className={getStatusColor(deadline.status, daysLate)}>
                              {deadline.status}
                              {deadline.status === 'En retard' && daysLate > 90 && (
                                <AlertTriangle className="h-3 w-3 ml-1" />
                              )}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 text-base">
                            {deadline.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatDueDate(deadline.dueDate)}
                              </span>
                            </span>
                            <span className={`flex items-center gap-2 font-medium px-3 py-1 rounded-full ${
                              daysRemaining < 0 
                                ? daysLate > 90 ? 'bg-red-900 text-white'
                                  : daysLate > 30 ? 'bg-red-700 text-white'
                                  : 'bg-red-500 text-white'
                                : daysRemaining <= 7 ? 'bg-amber-500 text-white' 
                                : 'bg-emerald-500 text-white'
                            }`}>
                              <Clock className="h-4 w-4" />
                              {daysRemaining < 0 
                                ? `En retard de ${Math.abs(daysRemaining)} jour(s)${daysLate > 90 ? ' - TRÈS CRITIQUE' : daysLate > 30 ? ' - CRITIQUE' : ''}`
                                : daysRemaining === 0 
                                ? 'Aujourd\'hui'
                                : `Dans ${daysRemaining} jour(s)`
                              }
                            </span>
                            
                            {deadline.status !== 'Terminé' && (
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={deadline.status === 'En retard' ? 100 : Math.max(0, 100 - (daysRemaining / 30) * 100)} 
                                  className="w-20"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {deadline.status === 'En retard' ? 'Dépassé' : 
                                   daysRemaining <= 7 ? 'Urgent' : 'En cours'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button 
                                 variant="ghost" 
                                 size="icon"
                                 onClick={() => setReminder(deadline.id)}
                                 className={notifications.has(deadline.id) ? 'text-blue-600 bg-blue-50' : ''}
                               >
                                 <Bell className={`h-4 w-4 ${notifications.has(deadline.id) ? 'fill-current' : ''}`} />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>{notifications.has(deadline.id) ? 'Désactiver notification' : 'Activer notification'}</p>
                             </TooltipContent>
                           </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => editDeadline(deadline.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modifier</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => confirmDelete(deadline.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supprimer</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={showEditDeadline} onOpenChange={setShowEditDeadline}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'Échéance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Titre*</Label>
              <Input
                id="edit-title"
                value={editDeadlineForm.title}
                onChange={(e) => setEditDeadlineForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nom de l'échéance..."
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDeadlineForm.description}
                onChange={(e) => setEditDeadlineForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-dueDate">Date d'échéance*</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editDeadlineForm.dueDate}
                  onChange={(e) => setEditDeadlineForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit-priority">Priorité*</Label>
                <Select value={editDeadlineForm.priority} onValueChange={(value) => setEditDeadlineForm(prev => ({ ...prev, priority: value }))}>
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
              <Label htmlFor="edit-type">Type*</Label>
              <Select value={editDeadlineForm.type} onValueChange={(value) => setEditDeadlineForm(prev => ({ ...prev, type: value }))}>
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
              <Button onClick={saveEditedDeadline} className="flex-1">
                Sauvegarder les Modifications
              </Button>
              <Button variant="outline" onClick={() => setShowEditDeadline(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette échéance ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteDeadline} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};