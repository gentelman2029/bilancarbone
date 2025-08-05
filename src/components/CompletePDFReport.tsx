import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

interface CompletePDFReportProps {
  emissionsData: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
    reductionAnnuelle: number;
    intensiteCarbone: number;
  };
  emissionsByCategory: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    emissions: number;
  }>;
  categoryScopeData: Array<{
    category: string;
    scope1: number;
    scope2: number;
    scope3: number;
  }>;
  sbtTrajectory: Array<{
    year: string;
    target: number;
    actual: number;
    gap?: number;
  }>;
  sectorBenchmark: {
    average: number;
    leaders: number;
    company: number;
  };
}

export const CompletePDFReport: React.FC<CompletePDFReportProps> = ({
  emissionsData,
  emissionsByCategory,
  monthlyTrend,
  categoryScopeData,
  sbtTrajectory,
  sectorBenchmark
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCompletePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Page de couverture
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rapport Carbone Complet', pageWidth / 2, 50, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Dashboard Carbone Interactif', pageWidth / 2, 70, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 90, { align: 'center' });
      
      // Résumé exécutif
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résumé Exécutif', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const executiveSummary = [
        `Émissions totales: ${(emissionsData.total / 1000).toFixed(2)} tCO2e`,
        `Réduction annuelle: ${emissionsData.reductionAnnuelle.toFixed(1)}%`,
        `Intensité carbone: ${emissionsData.intensiteCarbone.toFixed(2)} kgCO2e/k€`,
        '',
        'Répartition par scope:',
        `• Scope 1 (émissions directes): ${(emissionsData.scope1 / 1000).toFixed(2)} tCO2e`,
        `• Scope 2 (énergétique indirecte): ${(emissionsData.scope2 / 1000).toFixed(2)} tCO2e`,
        `• Scope 3 (autres indirectes): ${(emissionsData.scope3 / 1000).toFixed(2)} tCO2e`,
        '',
        'Performance vs secteur:',
        `• Moyenne sectorielle: ${sectorBenchmark.average.toFixed(2)} tCO2e`,
        `• Leaders du secteur: ${sectorBenchmark.leaders.toFixed(2)} tCO2e`,
        `• Position de l'entreprise: ${sectorBenchmark.company.toFixed(2)} tCO2e`
      ];
      
      let yPos = 50;
      executiveSummary.forEach(line => {
        pdf.text(line, 20, yPos);
        yPos += 8;
      });

      // Capture des graphiques du DOM
      const reportElement = document.getElementById('complete-pdf-preview');
      if (reportElement) {
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Graphiques sur plusieurs pages si nécessaire
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analyse Graphique', 20, 30);
        
        let currentY = 40;
        const maxY = pageHeight - 40;
        
        if (currentY + imgHeight > maxY) {
          pdf.addPage();
          currentY = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, Math.min(imgHeight, maxY - currentY));
      }

      // Données détaillées
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Données Détaillées', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Tableau des émissions par catégorie
      yPos = 50;
      pdf.text('Émissions par catégorie:', 20, yPos);
      yPos += 10;
      
      emissionsByCategory.forEach(category => {
        const percentage = ((category.value / emissionsData.total) * 100).toFixed(1);
        pdf.text(`• ${category.name}: ${(category.value / 1000).toFixed(2)} tCO2e (${percentage}%)`, 25, yPos);
        yPos += 8;
      });

      // Trajectoire SBTi
      yPos += 10;
      pdf.text('Trajectoire SBTi:', 20, yPos);
      yPos += 10;
      
      sbtTrajectory.forEach(point => {
        const gap = point.gap ? `(Écart: ${point.gap.toFixed(1)}%)` : '';
        pdf.text(`• ${point.year}: Objectif ${point.target.toFixed(2)} - Réalisé ${point.actual.toFixed(2)} ${gap}`, 25, yPos);
        yPos += 8;
      });

      // Recommandations
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommandations', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const recommendations = [
        '1. Optimisation énergétique des bâtiments',
        '2. Transition vers les énergies renouvelables',
        '3. Amélioration de la mobilité durable',
        '4. Optimisation de la chaîne d\'approvisionnement',
        '5. Engagement des parties prenantes',
        '6. Mise en place d\'indicateurs de suivi renforcés'
      ];
      
      yPos = 50;
      recommendations.forEach(rec => {
        pdf.text(rec, 20, yPos);
        yPos += 12;
      });

      // Sauvegarde
      pdf.save(`rapport_carbone_complet_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Rapport PDF généré",
        description: "Le rapport complet a été téléchargé avec succès.",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const scopeData = [
    { name: 'Scope 1', value: emissionsData.scope1 / 1000, color: '#ff6b6b' },
    { name: 'Scope 2', value: emissionsData.scope2 / 1000, color: '#4ecdc4' },
    { name: 'Scope 3', value: emissionsData.scope3 / 1000, color: '#45b7d1' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Rapport PDF Complet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu du Rapport Carbone Complet</DialogTitle>
        </DialogHeader>
        
        <div id="complete-pdf-preview" className="space-y-6 p-4 bg-white">
          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Émissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(emissionsData.total / 1000).toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">tCO₂e</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Réduction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{emissionsData.reductionAnnuelle.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">annuelle</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Intensité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emissionsData.intensiteCarbone.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">kgCO₂e/k€</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {sectorBenchmark.company < sectorBenchmark.leaders ? 'Leader' : 'Standard'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Répartition par scope */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition par Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scopeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)} tCO₂e`}
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Émissions par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={emissionsByCategory.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${(value / 1000).toFixed(1)} tCO₂e`, 'Émissions']} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendance mensuelle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tendance Mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${(value / 1000).toFixed(1)} tCO₂e`, 'Émissions']} />
                    <Line type="monotone" dataKey="emissions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trajectoire SBTi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trajectoire SBTi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sbtTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="target" stroke="#ff7300" strokeWidth={2} name="Objectif" />
                    <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} name="Réalisé" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Benchmark sectoriel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benchmark Sectoriel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{sectorBenchmark.average.toFixed(1)} tCO₂e</div>
                  <div className="text-sm text-muted-foreground">Moyenne Secteur</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{sectorBenchmark.leaders.toFixed(1)} tCO₂e</div>
                  <div className="text-sm text-muted-foreground">Leaders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{sectorBenchmark.company.toFixed(1)} tCO₂e</div>
                  <div className="text-sm text-muted-foreground">Notre Entreprise</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={generateCompletePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};