import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartDocumentUploader } from '@/components/data-collection/SmartDocumentUploader';
import { DocumentReviewList } from '@/components/data-collection/DocumentReviewList';
import { EnhancedActivityDataTable } from '@/components/data-collection/EnhancedActivityDataTable';
import { CSVAccountingImporter } from '@/components/data-collection/CSVAccountingImporter';
import { ScopeProgressBarsV2 } from '@/components/data-collection/ScopeProgressBarsV2';
import { Scope3Questionnaires } from '@/components/data-collection/Scope3Questionnaires';
import { CarbonSummaryDashboard } from '@/components/data-collection/CarbonSummaryDashboard';
import { ValidationWorkflow } from '@/components/data-collection/ValidationWorkflow';
import { ActivitiesPurgeButton } from '@/components/data-collection/ResetButtons';
import { Database, ShieldCheck, BarChart3, Upload, FileSpreadsheet, ClipboardList, Sparkles, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePendingDocumentsCount } from '@/hooks/useDataCollectionDocuments';
import { cn } from '@/lib/utils';

type CollectionSource = 'upload' | 'csv' | 'questionnaires' | null;

export default function DataCollectionOCR() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedSource, setSelectedSource] = useState<CollectionSource>(null);
  const { count: pendingCount, isLoading: isLoadingCount } = usePendingDocumentsCount(refreshTrigger);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const collectionSources = [
    {
      id: 'upload' as const,
      title: 'Upload IA',
      description: 'Téléchargez factures et documents pour extraction automatique OCR',
      icon: Upload,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'csv' as const,
      title: 'Import CSV',
      description: 'Importez vos écritures comptables depuis un export FEC ou CSV',
      icon: FileSpreadsheet,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
    },
    {
      id: 'questionnaires' as const,
      title: 'Enquêtes Scope 3',
      description: 'Renseignez manuellement les données qualitatives (trajets, repas, voyages)',
      icon: ClipboardList,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
    },
  ];

  const renderCollectionContent = () => {
    if (!selectedSource) {
      return (
        <div className="grid md:grid-cols-3 gap-4">
          {collectionSources.map((source) => (
            <Card
              key={source.id}
              className={cn(
                'cursor-pointer transition-all duration-200 border-2',
                source.bgColor,
                source.borderColor,
                'hover:scale-[1.02] hover:shadow-lg'
              )}
              onClick={() => setSelectedSource(source.id)}
            >
              <CardHeader className="pb-3">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-2', source.bgColor)}>
                  <source.icon className={cn('h-6 w-6', source.color)} />
                </div>
                <CardTitle className="text-lg">{source.title}</CardTitle>
                <CardDescription>{source.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-between group">
                  Commencer
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const currentSource = collectionSources.find(s => s.id === selectedSource);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSource(null)}
            className="text-muted-foreground"
          >
            ← Retour aux sources
          </Button>
          <Badge variant="outline" className={cn('font-medium', currentSource?.color)}>
            {currentSource?.title}
          </Badge>
        </div>

        {selectedSource === 'upload' && (
          <SmartDocumentUploader 
            key={`upload-${refreshTrigger}`}
            onUploadComplete={handleRefresh} 
          />
        )}
        {selectedSource === 'csv' && (
          <CSVAccountingImporter 
            key={`csv-${refreshTrigger}`}
            onImportComplete={handleRefresh} 
          />
        )}
        {selectedSource === 'questionnaires' && (
          <Scope3Questionnaires 
            key={`questionnaires-${refreshTrigger}`}
            onDataSubmitted={handleRefresh} 
          />
        )}
      </div>
    );
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

      {/* Barres de progression par Scope */}
      <ScopeProgressBarsV2 key={`progress-${refreshTrigger}`} refreshTrigger={refreshTrigger} />

      <Tabs defaultValue="collect" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3" role="tablist" aria-label="Étapes de collecte de données">
          <TabsTrigger 
            value="collect" 
            className="flex items-center gap-2"
            aria-label="Collecte - Sources de données"
          >
            <Database className="h-4 w-4" aria-hidden="true" />
            <span>Collecte</span>
          </TabsTrigger>
          <TabsTrigger 
            value="verify" 
            className="flex items-center gap-2 relative"
            aria-label={`Vérification - ${pendingCount} documents en attente`}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Vérification</span>
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
            value="analyze" 
            className="flex items-center gap-2"
            aria-label="Analyse - KPI et activités"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span>Analyse</span>
          </TabsTrigger>
        </TabsList>

        {/* Étape 1: Collecte */}
        <TabsContent value="collect" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Sources de données
              </CardTitle>
              <CardDescription>
                Choisissez une méthode d'importation pour collecter vos données d'activité carbone
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCollectionContent()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Étape 2: Vérification */}
        <TabsContent value="verify" className="space-y-6">
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="documents" className="relative">
                Documents
                {pendingCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 px-1.5 text-xs"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents">
              <DocumentReviewList 
                key={`review-${refreshTrigger}`}
                onDataValidated={handleRefresh} 
              />
            </TabsContent>
            
            <TabsContent value="pipeline">
              <ValidationWorkflow 
                key={`workflow-${refreshTrigger}`}
                refreshTrigger={refreshTrigger} 
                onValidationComplete={handleRefresh} 
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Étape 3: Analyse */}
        <TabsContent value="analyze" className="space-y-6">
          {/* Dashboard KPI */}
          <CarbonSummaryDashboard 
            key={`dashboard-${refreshTrigger}`}
            refreshTrigger={refreshTrigger} 
          />

          {/* Tableau d'activités */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Activités validées</CardTitle>
                <CardDescription>
                  Données d'activité avec calculs CO₂ finalisés après validation
                </CardDescription>
              </div>
              <ActivitiesPurgeButton onResetComplete={handleRefresh} />
            </CardHeader>
            <CardContent>
              <EnhancedActivityDataTable 
                key={`activities-${refreshTrigger}`}
                refreshTrigger={refreshTrigger} 
                onRecalculateComplete={handleRefresh} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
