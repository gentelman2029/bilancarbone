import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartDocumentUploader } from '@/components/data-collection/SmartDocumentUploader';
import { DocumentReviewList } from '@/components/data-collection/DocumentReviewList';
import { ActivityDataTable } from '@/components/data-collection/ActivityDataTable';
import { Upload, FileCheck, Activity, Sparkles } from 'lucide-react';

export default function DataCollectionOCR() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Extraction IA Automatisée
        </h1>
        <p className="text-muted-foreground mt-1">
          Téléchargez vos factures et laissez l'IA Vision extraire automatiquement les données carbone
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload IA</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Validation</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activités</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <SmartDocumentUploader onUploadComplete={handleRefresh} />
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