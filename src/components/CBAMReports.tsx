import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  CreditCard,
  BarChart3,
  Database,
  Loader
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CBAMReport {
  id: string;
  productName: string;
  reportType: string;
  period: string;
  status: 'Généré' | 'En attente de données' | 'En cours de génération' | 'En cours de validation' | 'Brouillon';
  createdDate: string;
  emissions: number;
  volume: number;
  deadline?: string;
}

export const CBAMReports = () => {
  const [reports, setReports] = useState<CBAMReport[]>([
    {
      id: '1',
      productName: 'Acier laminé à chaud',
      reportType: 'Passeport Carbone Produit',
      period: 'Q1 2024',
      status: 'Généré',
      createdDate: '2024-03-28',
      emissions: 2.1,
      volume: 2500,
      deadline: '2024-04-30'
    },
    {
      id: '2',
      productName: 'Ciment Portland',
      reportType: 'Rapport Trimestriel',
      period: 'Q1 2024',
      status: 'En attente de données',
      createdDate: '2024-03-25',
      emissions: 0.82,
      volume: 15000,
      deadline: '2024-04-30'
    },
    {
      id: '3',
      productName: 'Acier laminé à chaud',
      reportType: 'Rapport Trimestriel',
      period: 'Q3 2025',
      status: 'Généré',
      createdDate: '2025-08-26',
      emissions: 1.93,
      volume: 3200
    }
  ]);

  const [showNewReport, setShowNewReport] = useState(false);
  const [newReport, setNewReport] = useState({
    product: '',
    reportType: '',
    period: '',
    notes: ''
  });
  const [search, setSearch] = useState('');

  const filteredReports = reports.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.productName.toLowerCase().includes(q) ||
      r.reportType.toLowerCase().includes(q) ||
      r.period.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Généré': return 'bg-green-100 text-green-800';
      case 'En attente de données': return 'bg-orange-100 text-orange-800';
      case 'En cours de génération': return 'bg-blue-100 text-blue-800';
      case 'En cours de validation': return 'bg-yellow-100 text-yellow-800';
      case 'Brouillon': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Généré': return <CheckCircle className="h-4 w-4" />;
      case 'En attente de données': return <Database className="h-4 w-4" />;
      case 'En cours de génération': return <Loader className="h-4 w-4 animate-spin" />;
      case 'En cours de validation': return <Clock className="h-4 w-4" />;
      case 'Brouillon': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getReportTypeIcon = (reportType: string) => {
    if (reportType.includes('Passeport')) {
      return <CreditCard className="h-4 w-4 text-blue-600" />;
    } else if (reportType.includes('Trimestriel')) {
      return <BarChart3 className="h-4 w-4 text-green-600" />;
    }
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  const getReportTypeColor = (reportType: string) => {
    if (reportType.includes('Passeport')) {
      return 'text-blue-600';
    } else if (reportType.includes('Trimestriel')) {
      return 'text-green-600';
    }
    return 'text-gray-600';
  };

  const generateReport = () => {
    if (!newReport.product || !newReport.reportType || !newReport.period) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Mapping des produits pour avoir le nom complet
    const productNames = {
      'acier': 'Acier laminé à chaud',
      'ciment': 'Ciment Portland',
      'aluminium': 'Aluminium brut'
    };

    // Créer le nouveau rapport
    const newCBAMReport: CBAMReport = {
      id: (reports.length + 1).toString(),
      productName: productNames[newReport.product as keyof typeof productNames] || newReport.product,
      reportType: newReport.reportType === 'passeport' ? 'Passeport Carbone Produit' :
                  newReport.reportType === 'trimestriel' ? 'Rapport Trimestriel' :
                  newReport.reportType === 'annuel' ? 'Rapport Annuel' : 'Données d\'Exportation',
      period: newReport.period,
      status: 'Généré',
      createdDate: new Date().toLocaleDateString('fr-CA'), // Format YYYY-MM-DD
      emissions: Math.round((Math.random() * 2 + 0.5) * 100) / 100, // Émissions aléatoires entre 0.5 et 2.5
      volume: Math.round(Math.random() * 10000 + 1000) // Volume aléatoire entre 1000 et 11000
    };

    // Ajouter le nouveau rapport à la liste
    setReports(prev => [...prev, newCBAMReport]);

    toast({
      title: "Rapport généré",
      description: `Rapport ${newCBAMReport.reportType} créé avec succès`
    });

    setShowNewReport(false);
    setNewReport({ product: '', reportType: '', period: '', notes: '' });
  };

  const downloadReport = (reportId: string, productName: string) => {
    // Génération du contenu PDF amélioré
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const pdfContent = `
PASSEPORT CARBONE PRODUIT - CBAM
================================================================

INFORMATIONS GÉNÉRALES
Produit: ${productName}
Code CN: 7208 10
Période de reporting: Q1 2024
Date de génération: ${currentDate}
Entreprise: [Nom de votre entreprise]

ÉMISSIONS EMBARQUÉES DÉTAILLÉES
================================================================
Scope 1 (Émissions directes):                    1.2 tCO₂e
- Combustion gaz naturel                         0.8 tCO₂e
- Combustion fioul                               0.3 tCO₂e
- Autres combustibles                            0.1 tCO₂e

Scope 2 (Émissions indirectes - Électricité):    0.7 tCO₂e
- Électricité réseau (mix tunisien)              0.7 tCO₂e

Scope 3 (Précurseurs):                           0.2 tCO₂e
- Matières premières                             0.15 tCO₂e
- Transport amont                                0.05 tCO₂e

TOTAL ÉMISSIONS EMBARQUÉES:                      2.1 tCO₂e

INDICATEURS CLÉS
================================================================
Intensité carbone:                               0.84 kgCO₂e/kg
Volume total produit:                            2500 tonnes
Facteur d'émission électricité:                 0.47 kgCO₂e/kWh

MÉTHODOLOGIE & CONFORMITÉ
================================================================
• Calculs basés sur les facteurs d'émission GIEC 2019
• Méthodologie conforme au règlement CBAM UE 2023/956
• Vérification: Données certifiées par audit interne
• Prix du carbone local: Non applicable (Tunisie)

DOCUMENTS JUSTIFICATIFS
================================================================
• Factures énergétiques période Q1 2024
• Certificats d'analyse matières premières
• Données de production certifiées

Ce document certifie l'exactitude des données d'émissions 
carbone embarquées conformément à la réglementation CBAM.

Signature électronique: [Hash de validation]
    `;

    // Création d'un fichier avec un nom plus professionnel
    const fileName = `CBAM_Passeport_Carbone_${productName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    // Nettoyage
    window.URL.revokeObjectURL(url);

    toast({
      title: "Rapport exporté",
      description: `Passeport carbone de ${productName} téléchargé`
    });
  };

  const previewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    const content = `Aperçu du rapport CBAM\n\nProduit: ${report?.productName}\nType: ${report?.reportType}\nPériode: ${report?.period}\nStatut: ${report?.status}\nDate: ${report?.createdDate}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    toast({ title: 'Aperçu du rapport', description: 'Ouverture dans un nouvel onglet' });
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton nouveau rapport */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rapports CBAM</h2>
          <p className="text-muted-foreground">
            Générez et gérez vos passeports carbone produit
          </p>
        </div>
        <Button onClick={() => setShowNewReport(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Rapport
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{filteredReports.filter(r => r.status === 'Généré').length}</div>
              <div className="text-sm text-muted-foreground">Rapports générés</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{filteredReports.filter(r => r.status.includes('cours') || r.status.includes('attente')).length}</div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
          toast({
            title: "Échéance CBAM",
            description: "Rapport trimestriel Q1 2024 à soumettre avant le 30 avril 2024"
          });
        }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">15j</div>
              <div className="text-sm text-muted-foreground">Échéance Q1 2024</div>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Formulaire nouveau rapport */}
      {showNewReport && (
        <Card>
          <CardHeader>
            <CardTitle>Générer un Nouveau Rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Produit*</Label>
                <Select value={newReport.product} onValueChange={(value) => setNewReport(prev => ({ ...prev, product: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acier">Acier laminé à chaud</SelectItem>
                    <SelectItem value="ciment">Ciment Portland</SelectItem>
                    <SelectItem value="aluminium">Aluminium brut</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reportType">Type de rapport*</Label>
                <Select value={newReport.reportType} onValueChange={(value) => setNewReport(prev => ({ ...prev, reportType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passeport">Passeport Carbone Produit</SelectItem>
                    <SelectItem value="trimestriel">Rapport Trimestriel</SelectItem>
                    <SelectItem value="annuel">Rapport Annuel</SelectItem>
                    <SelectItem value="export">Données d'Exportation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">Période*</Label>
                <Input
                  value={newReport.period}
                  onChange={(e) => setNewReport(prev => ({ ...prev, period: e.target.value }))}
                  placeholder="Ex: Q1 2024, Janvier 2024, 2024, etc."
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  value={newReport.notes}
                  onChange={(e) => setNewReport(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informations complémentaires..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={generateReport} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Générer le Rapport
              </Button>
              <Button variant="outline" onClick={() => setShowNewReport(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des rapports existants */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rapports Existants</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher..." className="w-64" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Rechercher des rapports" />
              <Button variant="outline" size="icon" aria-label="Lancer la recherche">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left p-2">Produit</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Période</th>
                  <th className="text-left p-2">Statut</th>
                  <th className="text-left p-2">Émissions</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{report.productName}</td>
                    <td className="p-2">
                      <div className={`flex items-center gap-2 text-sm font-medium ${getReportTypeColor(report.reportType)}`}>
                        {getReportTypeIcon(report.reportType)}
                        {report.reportType}
                      </div>
                    </td>
                    <td className="p-2 text-sm">{report.period}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1">{report.status}</span>
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">{report.emissions} tCO₂e</td>
                    <td className="p-2 text-sm text-muted-foreground">{report.createdDate}</td>
                    <td className="p-2">
                      <TooltipProvider>
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => previewReport(report.id)}
                                aria-label={`Aperçu du rapport ${report.productName}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Aperçu du rapport</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => downloadReport(report.id, report.productName)}
                                aria-label={`Télécharger le rapport ${report.productName}`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Télécharger le rapport</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};