import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CBAMBulkImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportProducts: (products: any[]) => void;
}

export const CBAMBulkImport = ({ open, onOpenChange, onImportProducts }: CBAMBulkImportProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      }
    }
  };

  const downloadTemplate = () => {
    // Créer un contenu CSV pour le template
    const csvContent = `Nom du Produit,Code CN,Secteur,Volume Mensuel (tonnes),Type de Production,Matières Premières
Acier laminé à chaud,7208.10.00,Sidérurgie,1000,Acier électrique,"Minerai de fer, Charbon"
Ciment Portland,2523.29.00,Ciment,500,Voie sèche,"Calcaire, Argile"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_produits_cbam.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Template téléchargé avec succès!");
  };

  const processImport = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setIsProcessing(true);
    
    // Simulation du traitement du fichier
    setTimeout(() => {
      const mockProducts = [
        {
          id: Date.now().toString(),
          name: "Acier inoxydable 316L",
          cnCode: "7219.32.00",
          sector: "Sidérurgie",
          monthlyVolume: 800,
          productionType: "Acier électrique",
          rawMaterials: ["Ferraille", "Nickel", "Chrome"],
          scope1Emissions: 1.2,
          scope2Emissions: 0.8,
          scope3Emissions: 0.5,
          totalEmissions: 2.5,
          status: "En cours",
          lastUpdate: new Date().toISOString().split('T')[0]
        },
        {
          id: (Date.now() + 1).toString(),
          name: "Béton préfabriqué",
          cnCode: "6810.11.00",
          sector: "Ciment",
          monthlyVolume: 1200,
          productionType: "Préfabrication",
          rawMaterials: ["Ciment", "Granulats", "Eau"],
          scope1Emissions: 0.3,
          scope2Emissions: 0.2,
          scope3Emissions: 0.8,
          totalEmissions: 1.3,
          status: "Conforme",
          lastUpdate: new Date().toISOString().split('T')[0]
        }
      ];

      onImportProducts(mockProducts);
      setIsProcessing(false);
      setSelectedFile(null);
      onOpenChange(false);
      
      toast.success(`${mockProducts.length} produits importés avec succès!`);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import en Lot de Produits CBAM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <FileSpreadsheet className="h-8 w-8 text-green-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">1. Télécharger le Template</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Téléchargez notre template Excel pour structurer vos données produits selon les exigences CBAM.
                </p>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le Template
                </Button>
              </div>
            </div>
          </Card>

          {/* File Upload */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <Upload className="h-8 w-8 text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">2. Importer vos Données</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Sélectionnez votre fichier Excel complété avec les données de vos produits.
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="mb-3"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    {selectedFile.name}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Important</p>
              <p className="text-yellow-700">
                Assurez-vous que votre fichier respecte exactement la structure du template pour un import réussi.
                Les données incorrectes seront ignorées.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={processImport} 
              disabled={!selectedFile || isProcessing}
            >
              {isProcessing ? "Traitement..." : "Importer les Produits"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};