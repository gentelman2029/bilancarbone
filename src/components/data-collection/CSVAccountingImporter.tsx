import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle, Calculator, Euro, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  parseAccountingCSV, 
  processAccountingEntries, 
  AccountingEntry,
  MonetaryEmissionFactor 
} from '@/lib/dataCollection/monetaryRatios';
import { activityDataService } from '@/lib/dataCollection/activityService';

interface CSVAccountingImporterProps {
  onImportComplete?: () => void;
}

interface ProcessedEntry {
  entry: AccountingEntry;
  factor: MonetaryEmissionFactor;
  co2_kg: number;
  uncertainty_percent: number;
  selected: boolean;
}

export function CSVAccountingImporter({ onImportComplete }: CSVAccountingImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedEntries, setProcessedEntries] = useState<ProcessedEntry[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setFileName(file.name);
    setIsProcessing(true);

    try {
      const content = await file.text();
      const entries = parseAccountingCSV(content);
      
      if (entries.length === 0) {
        toast.error('Fichier CSV invalide', {
          description: 'Aucune entrée comptable valide trouvée. Vérifiez le format du fichier.'
        });
        setIsProcessing(false);
        return;
      }

      const processed = processAccountingEntries(entries);
      setProcessedEntries(processed.map(p => ({ ...p, selected: true })));
      
      toast.success(`${entries.length} entrées analysées`, {
        description: 'Vérifiez les ratios appliqués avant import.'
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Erreur de traitement', {
        description: 'Impossible de lire le fichier CSV.'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: isProcessing || processedEntries.length > 0
  });

  const toggleEntry = (index: number) => {
    setProcessedEntries(prev => 
      prev.map((e, i) => i === index ? { ...e, selected: !e.selected } : e)
    );
  };

  const toggleAll = () => {
    const allSelected = processedEntries.every(e => e.selected);
    setProcessedEntries(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const handleImport = async () => {
    const selectedEntries = processedEntries.filter(e => e.selected);
    if (selectedEntries.length === 0) {
      toast.error('Aucune entrée sélectionnée');
      return;
    }

    setIsImporting(true);

    try {
      for (const { entry, factor, co2_kg, uncertainty_percent } of selectedEntries) {
        await activityDataService.createManual({
          organization_id: undefined,
          source_type: 'import_csv',
          source_document_id: undefined,
          source_reference: `CSV Import - ${fileName}`,
          period_start: entry.date,
          period_end: entry.date,
          ghg_scope: 'scope3',
          ghg_category: factor.ghg_category,
          ghg_subcategory: factor.subcategory,
          quantity: entry.amount_ht,
          unit: 'EUR',
          amount_ht: entry.amount_ht,
          amount_ttc: entry.amount_ttc,
          currency_code: entry.currency,
          supplier_name: entry.supplier_name,
          supplier_country: undefined,
          emission_factor_value: factor.factor_value,
          emission_factor_unit: 'kgCO2e/€',
          emission_factor_source: factor.source,
          co2_equivalent_kg: co2_kg,
          calculation_metadata_id: undefined
        } as any);
      }

      toast.success(`${selectedEntries.length} entrées importées`, {
        description: `${selectedEntries.reduce((sum, e) => sum + e.co2_kg, 0).toFixed(1)} kg CO₂e ajoutés au Scope 3`
      });

      setProcessedEntries([]);
      setFileName(null);
      onImportComplete?.();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setProcessedEntries([]);
    setFileName(null);
  };

  // Stats
  const selectedCount = processedEntries.filter(e => e.selected).length;
  const totalCO2 = processedEntries.filter(e => e.selected).reduce((sum, e) => sum + e.co2_kg, 0);
  const totalAmount = processedEntries.filter(e => e.selected).reduce((sum, e) => sum + e.entry.amount_ht, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import CSV - Écritures Comptables
        </CardTitle>
        <CardDescription>
          Importez vos achats et services pour calculer le Scope 3 via les ratios monétaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {processedEntries.length === 0 ? (
          <div
            {...getRootProps()}
            className={`
              p-8 text-center border-2 border-dashed rounded-lg transition-all cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${isProcessing ? 'opacity-60 cursor-wait' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-muted'}`}>
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold">
                  {isProcessing ? 'Analyse en cours...' : 'Déposez votre fichier CSV'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Format attendu: Date, Description, Montant HT, Devise, Fournisseur
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Services informatiques: 0.28 kgCO2e/€</Badge>
                <Badge variant="outline">Conseil: 0.12 kgCO2e/€</Badge>
                <Badge variant="outline">Fournitures: 0.45 kgCO2e/€</Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Entrées sélectionnées</p>
                <p className="text-2xl font-bold">{selectedCount}/{processedEntries.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Euro className="h-5 w-5" />
                  {totalAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <p className="text-sm text-muted-foreground">Émissions estimées</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalCO2.toFixed(1)} kg CO₂e
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={processedEntries.every(e => e.selected)}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant HT</TableHead>
                    <TableHead>Catégorie détectée</TableHead>
                    <TableHead>Ratio</TableHead>
                    <TableHead>CO₂e</TableHead>
                    <TableHead>Incertitude</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedEntries.map((item, index) => (
                    <TableRow key={index} className={!item.selected ? 'opacity-50' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={item.selected}
                          onCheckedChange={() => toggleEntry(index)}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {item.entry.description}
                      </TableCell>
                      <TableCell>
                        {item.entry.amount_ht.toLocaleString('fr-FR')} {item.entry.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.factor.subcategory}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.factor.factor_value} kgCO2e/€
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {item.co2_kg.toFixed(2)} kg
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                          ±{item.uncertainty_percent}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Annuler
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || selectedCount === 0}
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Importer {selectedCount} entrées
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
