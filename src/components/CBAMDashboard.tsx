import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Factory, 
  BarChart3, 
  FileText, 
  Calendar,
  Plus,
  Upload,
  Settings,
  Edit,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CBAMProductForm } from './CBAMProductForm';
import { CBAMCalculator } from './CBAMCalculator';
import { CBAMReports } from './CBAMReports';
import { CBAMSchedules } from './CBAMSchedules';
import { CBAMFileUpload } from './CBAMFileUpload';

interface CBAMProduct {
  id: string;
  name: string;
  cnCode: string;
  sector: string;
  volume: number;
  status: 'Conforme' | 'En cours' | 'À réviser';
  emissions: number;
  lastUpdate: string;
}

export const CBAMDashboard = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [products, setProducts] = useState<CBAMProduct[]>([
    {
      id: '1',
      name: 'Acier laminé à chaud',
      cnCode: '7208 10',
      sector: 'Fer et acier',
      volume: 2500,
      status: 'Conforme',
      emissions: 2.1,
      lastUpdate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Ciment Portland',
      cnCode: '2523 29',
      sector: 'Ciment',
      volume: 15000,
      status: 'En cours',
      emissions: 0.82,
      lastUpdate: '2024-01-10'
    }
  ]);

  const metrics = {
    totalProducts: 12,
    avgEmissions: 2.4,
    reportsGenerated: 8,
    nextReporting: 15
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Conforme': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'À réviser': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Conforme': return <CheckCircle className="h-4 w-4" />;
      case 'En cours': return <Clock className="h-4 w-4" />;
      case 'À réviser': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleNewProduct = () => {
    setShowProductForm(true);
  };

  const handleImportLot = () => {
    toast({
      title: "Import en Lot",
      description: "Fonctionnalité d'import en cours de développement..."
    });
  };

  const handleSectorModels = () => {
    toast({
      title: "Modèles Sectoriels",
      description: "Accès aux modèles de calcul sectoriels..."
    });
  };

  const handleAdvancedConfig = () => {
    setShowFileUpload(true);
  };

  const handleEditProduct = (productId: string) => {
    toast({
      title: "Édition produit",
      description: "Ouverture du formulaire d'édition..."
    });
    setShowProductForm(true);
  };

  const handleDownloadProduct = (productId: string, productName: string) => {
    const csvData = `Nom du Produit,Code CN,Secteur,Volume,Statut,Émissions
${productName},7208 10,Fer et acier,2500,Conforme,2.1`;

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produit-${productName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();

    toast({
      title: "Téléchargement lancé",
      description: `Données de ${productName} exportées`
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Produit supprimé",
      description: "Le produit a été retiré de la liste"
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Module CBAM Compliance</h1>
          <p className="text-muted-foreground">
            Mécanisme d'Ajustement Carbone aux Frontières - Conformité UE
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Phase de Transition</Button>
          <Button variant="outline">Reporting Trimestriel</Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits CBAM</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produits configurés
            </p>
            <p className="text-xs text-green-600">+2 ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Émissions Moyennes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.avgEmissions}</div>
            <p className="text-xs text-muted-foreground">
              tonnes CO₂e
            </p>
            <p className="text-xs text-orange-600">-5% vs trim. précédent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports Générés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.reportsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              ce mois
            </p>
            <p className="text-xs text-blue-600">3 en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Échéances</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.nextReporting}j</div>
            <p className="text-xs text-muted-foreground">
              Prochaine reporting
            </p>
            <p className="text-xs text-red-600">Q1 2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Calculs
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Échéances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion des Produits CBAM</CardTitle>
                <Button onClick={handleNewProduct} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Produit
                </Button>
              </div>
              <p className="text-muted-foreground">
                Configurez vos produits soumis au mécanisme CBAM
              </p>
            </CardHeader>
            <CardContent>
              {/* Product Catalog */}
              <div className="space-y-4">
                <h3 className="font-semibold">📋 Catalogue des Produits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-muted-foreground">
                        <th className="text-left p-2">Nom du Produit</th>
                        <th className="text-left p-2">Code CN</th>
                        <th className="text-left p-2">Secteur</th>
                        <th className="text-left p-2">Volume</th>
                        <th className="text-left p-2">Statut</th>
                        <th className="text-center p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-2 font-medium">{product.name}</td>
                          <td className="p-2 text-sm text-muted-foreground">{product.cnCode}</td>
                          <td className="p-2 text-sm">{product.sector}</td>
                          <td className="p-2 text-sm">{product.volume} tonnes</td>
                          <td className="p-2">
                            <Badge className={getStatusColor(product.status)}>
                              {getStatusIcon(product.status)}
                              <span className="ml-1">{product.status}</span>
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditProduct(product.id)}
                                title="Éditer"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadProduct(product.id, product.name)}
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                  <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={handleImportLot}>
                    <Upload className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <h4 className="font-semibold mb-2">Import en Lot</h4>
                    <p className="text-sm text-muted-foreground">
                      Importez plusieurs produits via un fichier Excel
                    </p>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={handleSectorModels}>
                    <Factory className="h-8 w-8 mx-auto mb-3 text-green-600" />
                    <h4 className="font-semibold mb-2">Modèles Sectoriels</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisez des modèles prédéfinis par secteur
                    </p>
                  </Card>

                  <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={handleAdvancedConfig}>
                    <Settings className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                    <h4 className="font-semibold mb-2">Configuration Avancée</h4>
                    <p className="text-sm text-muted-foreground">
                      Paramètres détaillés et facteurs personnalisés
                    </p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          <CBAMCalculator />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <CBAMReports />
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <CBAMSchedules />
        </TabsContent>
      </Tabs>

      <CBAMProductForm 
        open={showProductForm} 
        onClose={() => setShowProductForm(false)} 
      />

      {/* Modal d'upload de fichiers */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Gestion des Documents</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowFileUpload(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CBAMFileUpload />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};