import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartDocumentUploader } from '@/components/data-collection/SmartDocumentUploader';
import { DocumentReviewList } from '@/components/data-collection/DocumentReviewList';
import { ActivityDataTable } from '@/components/data-collection/ActivityDataTable';
import { CSVAccountingImporter } from '@/components/data-collection/CSVAccountingImporter';
import { ScopeProgressBars } from '@/components/data-collection/ScopeProgressBars';
import { Upload, FileCheck, Activity, Sparkles, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function DataCollectionOCR() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Charger le nombre de documents en attente
  useEffect(() => {
    const loadPendingCount = async () => {
      const { count } = await supabase
        .from('data_collection_documents')
        .select('*', { count: 'exact', head: true })
        .eq('ocr_status', 'processed')
        .eq('validation_status', 'pending');
      
      setPendingCount(count || 0);
    };

    loadPendingCount();
  }, [refreshTrigger]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Collecte Carbone Automatisée
        </h1>
        <p className="text-muted-foreground mt-1">
          Bilan carbone complet : Scopes 1, 2 et 3 avec traçabilité audit
        </p>
      </div>

      {/* Barres de progression par Scope */}
      <ScopeProgressBars refreshTrigger={refreshTrigger} />

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload IA</span>
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Import CSV</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2 relative">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Validation</span>
            {pendingCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activités</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <SmartDocumentUploader onUploadComplete={handleRefresh} />
        </TabsContent>

        <TabsContent value="csv" className="space-y-6">
          <CSVAccountingImporter onImportComplete={handleRefresh} />
        </TabsContent>

        <TabsContent value="review">
          <DocumentReviewList onDataValidated={handleRefresh} />
        </TabsContent>

        <TabsContent value="data">
          <ActivityDataTable refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
