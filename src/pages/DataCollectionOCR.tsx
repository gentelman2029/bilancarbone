import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartDocumentUploader } from '@/components/data-collection/SmartDocumentUploader';
import { DocumentReviewList } from '@/components/data-collection/DocumentReviewList';
import { EnhancedActivityDataTable } from '@/components/data-collection/EnhancedActivityDataTable';
import { CSVAccountingImporter } from '@/components/data-collection/CSVAccountingImporter';
import { ScopeProgressBarsV2 } from '@/components/data-collection/ScopeProgressBarsV2';
import { Scope3Questionnaires } from '@/components/data-collection/Scope3Questionnaires';
import { CarbonSummaryDashboard } from '@/components/data-collection/CarbonSummaryDashboard';
import { ValidationWorkflow } from '@/components/data-collection/ValidationWorkflow';
import { Upload, FileCheck, Activity, Sparkles, FileSpreadsheet, ClipboardList, BarChart3, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePendingDocumentsCount } from '@/hooks/useDataCollectionDocuments';

export default function DataCollectionOCR() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { count: pendingCount, isLoading: isLoadingCount } = usePendingDocumentsCount(refreshTrigger);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
          Collecte Carbone Automatisée
        </h1>
        <p className="text-muted-foreground mt-1">
          Bilan carbone complet : Scopes 1, 2 et 3 avec traçabilité audit et calculs automatisés
        </p>
      </div>

      {/* Dashboard KPI */}
      <CarbonSummaryDashboard refreshTrigger={refreshTrigger} />

      {/* Barres de progression par Scope */}
      <ScopeProgressBarsV2 refreshTrigger={refreshTrigger} />

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-7" role="tablist" aria-label="Onglets de collecte de données">
          <TabsTrigger 
            value="upload" 
            className="flex items-center gap-2"
            aria-label="Upload IA - Télécharger des documents"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger 
            value="csv" 
            className="flex items-center gap-2"
            aria-label="Import CSV - Importer des écritures comptables"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">CSV</span>
          </TabsTrigger>
          <TabsTrigger 
            value="questionnaires" 
            className="flex items-center gap-2"
            aria-label="Questionnaires - Collecte Scope 3 qualitative"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Enquêtes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="review" 
            className="flex items-center gap-2 relative"
            aria-label={`Validation - ${pendingCount} documents en attente`}
          >
            <FileCheck className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Validation</span>
            {isLoadingCount ? (
              <Skeleton className="absolute -top-2 -right-2 h-5 w-5 rounded-full" />
            ) : pendingCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                aria-label={`${pendingCount} documents en attente de validation`}
              >
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="workflow" 
            className="flex items-center gap-2"
            aria-label="Pipeline - Workflow de validation"
          >
            <GitBranch className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Pipeline</span>
          </TabsTrigger>
          <TabsTrigger 
            value="data" 
            className="flex items-center gap-2"
            aria-label="Activités - Données d'activité collectées"
          >
            <Activity className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Activités</span>
          </TabsTrigger>
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2"
            aria-label="Dashboard - KPI Carbone"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">KPI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <SmartDocumentUploader onUploadComplete={handleRefresh} />
        </TabsContent>

        <TabsContent value="csv" className="space-y-6">
          <CSVAccountingImporter onImportComplete={handleRefresh} />
        </TabsContent>

        <TabsContent value="questionnaires" className="space-y-6">
          <Scope3Questionnaires onDataSubmitted={handleRefresh} />
        </TabsContent>

        <TabsContent value="review">
          <DocumentReviewList onDataValidated={handleRefresh} />
        </TabsContent>

        <TabsContent value="workflow">
          <ValidationWorkflow refreshTrigger={refreshTrigger} onValidationComplete={handleRefresh} />
        </TabsContent>

        <TabsContent value="data">
          <EnhancedActivityDataTable refreshTrigger={refreshTrigger} onRecalculateComplete={handleRefresh} />
        </TabsContent>

        <TabsContent value="dashboard">
          <CarbonSummaryDashboard refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
