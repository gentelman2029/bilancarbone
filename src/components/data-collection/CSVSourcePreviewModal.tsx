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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileSpreadsheet, Calendar, Building2, Hash, Euro, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityData } from '@/lib/dataCollection/types';
import { toast } from 'sonner';

interface CSVSourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityData;
}

interface CSVRowData {
  id: string;
  period_start: string;
  period_end: string;
  ghg_category: string;
  quantity: number;
  unit: string;
  amount_ht: number | null;
  supplier_name: string | null;
  emission_factor_value: number | null;
  emission_factor_source: string | null;
  co2_equivalent_kg: number | null;
}

export function CSVSourcePreviewModal({ isOpen, onClose, activity }: CSVSourcePreviewModalProps) {
  const [csvData, setCSVData] = useState<CSVRowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importBatchId, setImportBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activity) {
      loadRelatedCSVData();
    }
  }, [isOpen, activity]);

  const loadRelatedCSVData = async () => {
    setIsLoading(true);
    try {
      // Find all CSV-imported activities from the same batch (same source_reference pattern)
      const sourceRef = activity.source_reference || '';
      // Extract the batch identifier (filename) from source_reference
      const batchPattern = sourceRef.includes(' - ') 
        ? sourceRef.split(' - ')[0].trim()
        : sourceRef.trim();
      
      setImportBatchId(batchPattern);
      
      // Fetch ALL rows without any limit to ensure complete audit trail
      const { data, error, count } = await supabase
        .from('activity_data')
        .select('id, period_start, period_end, ghg_category, quantity, unit, amount_ht, supplier_name, emission_factor_value, emission_factor_source, co2_equivalent_kg', { count: 'exact' })
        .eq('source_type', 'csv')
        .ilike('source_reference', `${batchPattern}%`)
        .order('period_start', { ascending: false });

      if (error) throw error;
      
      console.log(`CSV Preview: Found ${count} rows for batch "${batchPattern}"`);
      setCSVData(data || []);
    } catch (error) {
      console.error('Error loading CSV data:', error);
      toast.error('Erreur lors du chargement des données CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (csvData.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    // Build CSV content
    const headers = [
      'Date début',
      'Date fin',
      'Catégorie GHG',
      'Quantité',
      'Unité',
      'Montant HT (TND)',
      'Fournisseur',
      'Facteur émission',
      'Source facteur',
      'CO₂ (kg)',
    ];

    const rows = csvData.map(row => [
      row.period_start,
      row.period_end,
      row.ghg_category,
      row.quantity,
      row.unit,
      row.amount_ht ?? '',
      row.supplier_name ?? '',
      row.emission_factor_value ?? '',
      row.emission_factor_source ?? '',
      row.co2_equivalent_kg?.toFixed(2) ?? '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    // Create and trigger download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_source_${importBatchId || 'data'}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Fichier CSV téléchargé');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric' 
    });
  };

  const totalCO2 = csvData.reduce((sum, row) => sum + (row.co2_equivalent_kg || 0), 0);
  const totalAmount = csvData.reduce((sum, row) => sum + (row.amount_ht || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            Aperçu du fichier source CSV
          </DialogTitle>
          <DialogDescription>
            Données importées depuis : <span className="font-medium text-foreground">{importBatchId || 'Import CSV'}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {csvData.length} lignes
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Euro className="h-3 w-3" />
              {totalAmount.toLocaleString('fr-FR')} TND
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/30 flex items-center gap-1">
              {(totalCO2 / 1000).toFixed(2)} tCO₂e
            </Badge>
          </div>
          <Button onClick={handleDownloadCSV} size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Télécharger le fichier source .csv
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : csvData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée CSV associée trouvée</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[55vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="sticky top-0 z-10 bg-muted">Période</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted">Catégorie</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted">Fournisseur</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted text-right">Quantité</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted text-right">Montant HT</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted">Facteur émission</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted text-right">kgCO₂e</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, index) => (
                    <TableRow 
                      key={row.id}
                      className={row.id === activity.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                    >
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(row.period_start)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{row.ghg_category}</TableCell>
                      <TableCell>
                        {row.supplier_name ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">{row.supplier_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.quantity.toLocaleString('fr-FR')} {row.unit}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.amount_ht ? `${row.amount_ht.toLocaleString('fr-FR')} TND` : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.emission_factor_value ? (
                          <span>{row.emission_factor_value} • {row.emission_factor_source}</span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-primary">
                        {row.co2_equivalent_kg ? row.co2_equivalent_kg.toFixed(2) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Footer showing total count for verification */}
              <div className="py-2 px-4 text-xs text-muted-foreground border-t bg-muted/30">
                Affichage de {csvData.length} ligne{csvData.length > 1 ? 's' : ''} sur {csvData.length}
              </div>
            </ScrollArea>
          </div>
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
