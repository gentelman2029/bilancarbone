import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUploadCard } from '@/components/data-collection/DocumentUploadCard';
import { DocumentReviewList } from '@/components/data-collection/DocumentReviewList';
import { ActivityDataTable } from '@/components/data-collection/ActivityDataTable';
import { Upload, FileCheck, Activity } from 'lucide-react';

export default function DataCollectionOCR() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Collecte automatisée</h1>
        <p className="text-muted-foreground mt-1">
          Automatisez la collecte de vos consommations via OCR ou API ERP
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
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
          <DocumentUploadCard onUploadComplete={handleRefresh} />
          <DocumentReviewList onDataValidated={handleRefresh} />
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
