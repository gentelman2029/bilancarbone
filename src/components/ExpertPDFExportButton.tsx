import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmissions } from '@/contexts/EmissionsContext';
import { useActions } from '@/contexts/ActionsContext';
import { downloadExpertPDF } from './ExpertPDFReport';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export const ExpertPDFExportButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState('GreenInsight Enterprise');
  const { toast } = useToast();
  const { emissions, hasEmissions } = useEmissions();
  const { actions } = useActions();

  const handleExport = async () => {
    if (!hasEmissions) {
      toast({
        title: "Données insuffisantes",
        description: "Veuillez d'abord effectuer un calcul d'émissions dans le Calculateur Avancé.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Load section details from localStorage
      const sectionDetailsRaw = localStorage.getItem('calculation-section-details');
      const sectionDetails = sectionDetailsRaw ? JSON.parse(sectionDetailsRaw) : null;
      
      await downloadExpertPDF({
        companyName,
        emissions: {
          scope1: emissions.scope1,
          scope2: emissions.scope2,
          scope3: emissions.scope3,
          total: emissions.total,
        },
        previousYearEmissions: (emissions.emissionsAnneePrecedente || 0) * 1000,
        nombrePersonnels: emissions.nombrePersonnels || 50,
        chiffreAffaires: emissions.chiffreAffaires || 1000,
        benchmarkSectorName: emissions.benchmarkSectorName || 'Industrie manufacturière',
        moyenneSectorielle: emissions.moyenneSectorielle || 40,
        objectifsSBTParAnnee: emissions.objectifsSBTParAnnee || {},
        actions: actions.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          status: a.status,
          priority: a.priority,
          estimatedReduction: a.estimatedReduction,
          deadline: a.deadline,
        })),
        sectionDetails,
      });

      toast({
        title: "Rapport PDF généré",
        description: "Le rapport expert a été téléchargé avec succès.",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erreur de génération",
        description: "Une erreur s'est produite lors de la génération du PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
        >
          <FileText className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">Rapport Expert PDF</span>
          <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700 text-xs">
            GHG/CSRD
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Générer le Rapport Expert
          </DialogTitle>
          <DialogDescription>
            Rapport multipages conforme aux standards GHG Protocol et CSRD, avec texte vectoriel sélectionnable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Entrez le nom de votre entreprise"
            />
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Contenu du rapport (5 pages)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-muted-foreground">Page de garde</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-muted-foreground">Synthèse exécutive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-muted-foreground">Analyse par Scope</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-muted-foreground">Trajectoire SBTi</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">5</span>
                <span className="text-muted-foreground">Plan d'action stratégique</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              ✓ Texte sélectionnable
            </Badge>
            <Badge variant="outline" className="text-xs">
              ✓ Graphiques vectoriels
            </Badge>
            <Badge variant="outline" className="text-xs">
              ✓ Données temps réel
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isGenerating || !hasEmissions}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Télécharger PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpertPDFExportButton;
