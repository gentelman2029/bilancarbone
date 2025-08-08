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
    toast({ title: 'Génération du PDF…', description: 'Préparation du rapport complet' });
    
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

      // Capture des graphiques du DOM (avec fallback si l'extraction échoue)
      const reportElement = document.getElementById('complete-pdf-preview');
      if (reportElement) {
        try {
          const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
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
        } catch (e) {
          // Fallback: on continue sans les graphiques mais on laisse une note
          pdf.addPage();
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Analyse Graphique', 20, 30);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text("Les graphiques n'ont pas pu être intégrés au PDF. Les analyses textuelles détaillées sont toutefois incluses.", 20, 50, { maxWidth: pageWidth - 40 });
        }
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

      // Analyses écrites
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analyses écrites', 20, 30);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      const s1p = (emissionsData.scope1 / emissionsData.total) * 100;
      const s2p = (emissionsData.scope2 / emissionsData.total) * 100;
      const s3p = (emissionsData.scope3 / emissionsData.total) * 100;
      const dominantScope = (() => {
        const pairs = [
          { key: 'Scope 1', v: s1p },
          { key: 'Scope 2', v: s2p },
          { key: 'Scope 3', v: s3p },
        ];
        return pairs.sort((a, b) => b.v - a.v)[0];
      })();

      let trendLine = 'Tendance mensuelle: données insuffisantes';
      if (monthlyTrend && monthlyTrend.length > 1) {
        const first = monthlyTrend[0].emissions;
        const last = monthlyTrend[monthlyTrend.length - 1].emissions;
        const pct = first === 0 ? 0 : ((last - first) / first) * 100;
        const arrow = pct >= 0 ? '↑' : '↓';
        trendLine = `Tendance mensuelle: ${arrow} ${Math.abs(pct).toFixed(1)}% (${(first/1000).toFixed(1)} → ${(last/1000).toFixed(1)} tCO₂e)`;
      }

      const benchDiffPct = sectorBenchmark.average === 0
        ? 0
        : ((sectorBenchmark.company - sectorBenchmark.average) / sectorBenchmark.average) * 100;
      const benchLine = `Benchmark: ${benchDiffPct >= 0 ? 'au-dessus' : 'en dessous'} de la moyenne sectorielle de ${Math.abs(benchDiffPct).toFixed(1)}%`;

      const lastSbt = sbtTrajectory && sbtTrajectory.length > 0 ? sbtTrajectory[sbtTrajectory.length - 1] : undefined;
      const sbtGapPct = lastSbt ? ((lastSbt.actual - lastSbt.target) / (lastSbt.target || 1)) * 100 : 0;
      const sbtLine = lastSbt
        ? `Trajectoire SBTi: écart ${sbtGapPct >= 0 ? 'défavorable' : 'favorable'} de ${Math.abs(sbtGapPct).toFixed(1)}% en ${lastSbt.year}`
        : 'Trajectoire SBTi: données insuffisantes';

      const recLine = (() => {
        if (dominantScope.key === 'Scope 3') return 'Priorités: achats responsables, transport amont/aval, circularité, engagement fournisseurs.';
        if (dominantScope.key === 'Scope 2') return 'Priorités: efficacité énergétique, contrats d’électricité verte (PPA/GO), pilotage des usages.';
        return 'Priorités: carburants/combustibles, parc véhicules, fuites F-Gaz, maintenance et process.';
      })();

      const analysisLines = [
        `Répartition par scope: S1 ${s1p.toFixed(1)}% • S2 ${s2p.toFixed(1)}% • S3 ${s3p.toFixed(1)}%`,
        `Scope dominant: ${dominantScope.key} (${dominantScope.v.toFixed(1)}%)`,
        recLine,
        trendLine,
        benchLine,
        sbtLine,
      ];

      let yText = 50;
      analysisLines.forEach(line => {
        pdf.text(line, 20, yText, { maxWidth: pageWidth - 40 });
        yText += 10;
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
      try {
        pdf.save(`rapport_carbone_complet_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (e) {
        // Fallback ouverture dans un nouvel onglet si le téléchargement est bloqué
        const blobUrl = (pdf as any).output('bloburl');
        window.open(blobUrl, '_blank');
      }
      
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
                      innerRadius={50}
                      outerRadius={90}
                      labelLine={false}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(1)}%`}
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)} tCO₂e`, 'Émissions']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  {scopeData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
                        <span>{s.name}</span>
                      </div>
                      <span className="text-muted-foreground">{s.value.toFixed(1)} tCO₂e</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Répartition par scope par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition Scope par Catégorie (Top 6)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryScopeData.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${(Number(value) / 1000).toFixed(1)} tCO₂e`, 'Émissions']} />
                    <Bar dataKey="scope1" stackId="a" fill="#ff6b6b" name="Scope 1" />
                    <Bar dataKey="scope2" stackId="a" fill="#4ecdc4" name="Scope 2" />
                    <Bar dataKey="scope3" stackId="a" fill="#45b7d1" name="Scope 3" />
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