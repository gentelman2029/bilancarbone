import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ClipboardList,
  Download,
  Users,
  Car,
  Utensils,
  Plane,
  Calendar,
  CheckCircle2,
  Loader2,
  FileText,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityData, GHG_CATEGORIES } from '@/lib/dataCollection/types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface QuestionnairePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityData;
}

interface QuestionnaireData {
  id: string;
  period_start: string;
  period_end: string;
  ghg_category: string;
  quantity: number;
  unit: string;
  emission_factor_value: number | null;
  emission_factor_source: string | null;
  co2_equivalent_kg: number | null;
  source_reference: string | null;
  created_at: string;
  updated_at: string;
}

export function QuestionnairePreviewModal({ isOpen, onClose, activity }: QuestionnairePreviewModalProps) {
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && activity) {
      loadQuestionnaireData();
    }
  }, [isOpen, activity]);

  const loadQuestionnaireData = async () => {
    setIsLoading(true);
    try {
      // Load all questionnaire entries for the same category
      const { data, error } = await supabase
        .from('activity_data')
        .select('id, period_start, period_end, ghg_category, quantity, unit, emission_factor_value, emission_factor_source, co2_equivalent_kg, source_reference, created_at, updated_at')
        .eq('source_type', 'questionnaire')
        .eq('ghg_category', activity.ghg_category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestionnaireData(data || []);
    } catch (error) {
      console.error('Error loading questionnaire data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deplacements_domicile_travail':
        return <Car className="h-5 w-5 text-amber-500" />;
      case 'repas_salaries':
        return <Utensils className="h-5 w-5 text-amber-500" />;
      case 'voyages_affaires':
        return <Plane className="h-5 w-5 text-amber-500" />;
      default:
        return <ClipboardList className="h-5 w-5 text-amber-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const scope3Categories = GHG_CATEGORIES.scope3;
    const found = scope3Categories.find(c => c.id === category);
    if (found) return found.label;
    
    // Custom questionnaire categories
    switch (category) {
      case 'deplacements_domicile_travail':
        return 'Déplacements domicile-travail';
      case 'repas_salaries':
        return 'Repas des salariés';
      case 'voyages_affaires':
        return 'Voyages d\'affaires';
      default:
        return category;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Récapitulatif Enquête Carbone', margin, y);
    y += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Catégorie : ${getCategoryLabel(activity.ghg_category)}`, margin, y);
    y += 7;
    doc.text(`Généré le : ${formatDate(new Date().toISOString())}`, margin, y);
    y += 15;

    // Summary stats
    const totalCO2 = questionnaireData.reduce((sum, d) => sum + (d.co2_equivalent_kg || 0), 0);
    const totalQuantity = questionnaireData.reduce((sum, d) => sum + d.quantity, 0);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé consolidé', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`• Nombre de réponses : ${questionnaireData.length}`, margin + 5, y);
    y += 6;
    doc.text(`• Quantité totale : ${totalQuantity.toLocaleString('fr-FR')} ${activity.unit}`, margin + 5, y);
    y += 6;
    doc.text(`• Émissions totales : ${(totalCO2 / 1000).toFixed(2)} tCO₂e`, margin + 5, y);
    y += 12;

    // Detail table header
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des réponses', margin, y);
    y += 8;

    // Table
    doc.setFontSize(9);
    const colWidths = [40, 35, 30, 40, 30];
    const headers = ['Date soumission', 'Période', 'Quantité', 'Facteur émission', 'kgCO₂e'];
    
    doc.setFont('helvetica', 'bold');
    let x = margin;
    headers.forEach((header, i) => {
      doc.text(header, x, y);
      x += colWidths[i];
    });
    y += 6;

    doc.setFont('helvetica', 'normal');
    questionnaireData.forEach((row) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      x = margin;
      doc.text(formatDate(row.created_at), x, y);
      x += colWidths[0];
      doc.text(formatDate(row.period_start), x, y);
      x += colWidths[1];
      doc.text(`${row.quantity} ${row.unit}`, x, y);
      x += colWidths[2];
      doc.text(row.emission_factor_source || '—', x, y);
      x += colWidths[3];
      doc.text(row.co2_equivalent_kg?.toFixed(2) || '—', x, y);
      y += 5;
    });

    // Footer
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text('Document généré automatiquement pour audit de conformité carbone.', margin, y);

    doc.save(`enquete_${activity.ghg_category}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('Récapitulatif PDF téléchargé');
  };

  const handleDownloadExcel = () => {
    // Build CSV content for Excel
    const headers = [
      'Date soumission',
      'Période début',
      'Période fin',
      'Catégorie',
      'Quantité',
      'Unité',
      'Facteur émission',
      'Source facteur',
      'CO₂ (kg)',
    ];

    const rows = questionnaireData.map(row => [
      formatDate(row.created_at),
      row.period_start,
      row.period_end,
      getCategoryLabel(row.ghg_category),
      row.quantity,
      row.unit,
      row.emission_factor_value ?? '',
      row.emission_factor_source ?? '',
      row.co2_equivalent_kg?.toFixed(2) ?? '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enquete_${activity.ghg_category}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Fichier Excel/CSV téléchargé');
  };

  const totalCO2 = questionnaireData.reduce((sum, d) => sum + (d.co2_equivalent_kg || 0), 0);
  const totalQuantity = questionnaireData.reduce((sum, d) => sum + d.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getCategoryIcon(activity.ghg_category)}
            Réponses enquête : {getCategoryLabel(activity.ghg_category)}
          </DialogTitle>
          <DialogDescription>
            Données qualitatives collectées via questionnaire employés
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {questionnaireData.length} réponses
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {totalQuantity.toLocaleString('fr-FR')} {activity.unit}
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/30">
              {(totalCO2 / 1000).toFixed(2)} tCO₂e
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadExcel} size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button onClick={handleDownloadPDF} size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : questionnaireData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune réponse trouvée pour cette enquête</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 max-h-[50vh] pr-4">
            <div className="space-y-3">
              {questionnaireData.map((entry, index) => (
                <Card 
                  key={entry.id}
                  className={entry.id === activity.id ? 'border-primary/50 bg-primary/5' : ''}
                >
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Réponse #{questionnaireData.length - index}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDateTime(entry.created_at)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Période</p>
                        <p className="font-medium">{formatDate(entry.period_start)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Quantité déclarée</p>
                        <p className="font-medium">{entry.quantity.toLocaleString('fr-FR')} {entry.unit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Facteur émission</p>
                        <p className="font-medium text-xs">
                          {entry.emission_factor_value ? (
                            <>
                              {entry.emission_factor_value} kgCO₂/{entry.unit}
                              <span className="text-muted-foreground block">{entry.emission_factor_source}</span>
                            </>
                          ) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Émissions calculées</p>
                        <p className="font-medium text-primary">
                          {entry.co2_equivalent_kg ? `${entry.co2_equivalent_kg.toFixed(2)} kgCO₂e` : '—'}
                        </p>
                      </div>
                    </div>
                    {entry.source_reference && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Référence :</span> {entry.source_reference}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
