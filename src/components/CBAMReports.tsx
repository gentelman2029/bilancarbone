import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CBAMReport {
  id: string;
  productName: string;
  reportType: string;
  period: string;
  status: 'Généré' | 'En cours' | 'Brouillon';
  createdDate: string;
  emissions: number;
  volume: number;
}

export const CBAMReports = () => {
  const [reports] = useState<CBAMReport[]>([
    {
      id: '1',
      productName: 'Acier laminé à chaud',
      reportType: 'Passeport Carbone Produit',
      period: 'Q1 2024',
      status: 'Généré',
      createdDate: '2024-01-15',
      emissions: 2.1,
      volume: 2500
    },
    {
      id: '2',
      productName: 'Ciment Portland',
      reportType: 'Rapport Trimestriel',
      period: 'Q1 2024',
      status: 'En cours',
      createdDate: '2024-01-10',
      emissions: 0.82,
      volume: 15000
    }
  ]);

  const [showNewReport, setShowNewReport] = useState(false);
  const [newReport, setNewReport] = useState({
    product: '',
    reportType: '',
    period: '',
    notes: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Généré': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'Brouillon': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Généré': return <CheckCircle className="h-4 w-4" />;
      case 'En cours': return <Clock className="h-4 w-4" />;
      case 'Brouillon': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
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

    toast({
      title: "Rapport généré",
      description: `Rapport ${newReport.reportType} créé avec succès`
    });

    setShowNewReport(false);
    setNewReport({ product: '', reportType: '', period: '', notes: '' });
  };

  const downloadReport = (reportId: string, productName: string) => {
    // Simulation de génération PDF
    const pdfContent = `
PASSEPORT CARBONE PRODUIT - CBAM

Produit: ${productName}
Code CN: 7208 10
Période: Q1 2024

ÉMISSIONS EMBARQUÉES:
- Scope 1 (Directes): 1.2 tCO₂e
- Scope 2 (Électricité): 0.7 tCO₂e  
- Scope 3 (Précurseurs): 0.2 tCO₂e
- Total: 2.1 tCO₂e

INTENSITÉ CARBONE: 0.84 kgCO₂e/kg

Méthodologie: Calculs basés sur les facteurs d'émission GIEC 2019
Vérification: Conforme au règlement CBAM UE 2023/956
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-cbam-${productName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();

    toast({
      title: "Téléchargement lancé",
      description: "Le rapport a été téléchargé"
    });
  };

  const previewReport = (reportId: string) => {
    toast({
      title: "Aperçu du rapport",
      description: "Ouverture de l'aperçu..."
    });
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
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-muted-foreground">Rapports générés</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">15j</div>
              <div className="text-sm text-muted-foreground">Prochaine échéance</div>
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
                <Select value={newReport.period} onValueChange={(value) => setNewReport(prev => ({ ...prev, period: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la période..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1-2024">Q1 2024</SelectItem>
                    <SelectItem value="q2-2024">Q2 2024</SelectItem>
                    <SelectItem value="q3-2024">Q3 2024</SelectItem>
                    <SelectItem value="q4-2024">Q4 2024</SelectItem>
                  </SelectContent>
                </Select>
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
              <Input placeholder="Rechercher..." className="w-64" />
              <Button variant="outline" size="icon">
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
                {reports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{report.productName}</td>
                    <td className="p-2 text-sm">{report.reportType}</td>
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
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => previewReport(report.id)}
                          title="Aperçu"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => downloadReport(report.id, report.productName)}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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