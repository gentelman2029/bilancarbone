import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Calculator, Loader2, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { activityDataService } from '@/lib/dataCollection/activityService';
import { ActivityData, GHG_CATEGORIES } from '@/lib/dataCollection/types';

interface ActivityDataTableProps {
  refreshTrigger?: number;
}

export function ActivityDataTable({ refreshTrigger }: ActivityDataTableProps) {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadActivities = async () => {
    try {
      const result = await activityDataService.getActivityData();
      if (result.error) throw new Error(result.error);
      setActivities(result.data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Erreur lors du chargement des activités');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [refreshTrigger]);

  const handleCalculate = async (activity: ActivityData) => {
    setProcessingId(activity.id);
    try {
      const result = await activityDataService.validateAndCalculate(activity.id);
      if (result.error) throw new Error(result.error);
      
      toast.success('Calcul effectué', {
        description: `${result.data?.co2_equivalent_kg?.toFixed(2) || 0} kg CO₂e`
      });
      loadActivities();
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Erreur lors du calcul');
    } finally {
      setProcessingId(null);
    }
  };

  const handleValidate = async (activity: ActivityData) => {
    setProcessingId(activity.id);
    try {
      await activityDataService.updateActivityData(activity.id, { status: 'validated' });
      toast.success('Activité validée');
      loadActivities();
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setProcessingId(null);
    }
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'scope1':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Scope 1</Badge>;
      case 'scope2':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Scope 2</Badge>;
      case 'scope3':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Scope 3</Badge>;
      default:
        return <Badge variant="secondary">{scope}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'validated':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Validé</Badge>;
      case 'integrated':
        return <Badge className="bg-primary/10 text-primary border-primary/30">Intégré</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryLabel = (scope: string, category: string) => {
    const scopeCategories = GHG_CATEGORIES[scope as keyof typeof GHG_CATEGORIES] || [];
    const found = scopeCategories.find(c => c.id === category);
    return found?.label || category;
  };

  // Stats
  const totalEmissions = activities.reduce((sum, a) => sum + (a.co2_equivalent_kg || 0), 0);
  const validatedCount = activities.filter(a => a.status === 'validated' || a.status === 'integrated').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Données d'activité
          </span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              {(totalEmissions / 1000).toFixed(2)} t CO₂e
            </span>
            <Badge variant="secondary">{validatedCount}/{activities.length} validées</Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Consommations collectées et leurs émissions calculées
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune donnée d'activité. Téléchargez des documents pour commencer.
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Émissions</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-sm">
                      {new Date(activity.period_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>{getScopeBadge(activity.ghg_scope)}</TableCell>
                    <TableCell className="font-medium">
                      {getCategoryLabel(activity.ghg_scope, activity.ghg_category)}
                    </TableCell>
                    <TableCell>
                      {activity.quantity.toLocaleString('fr-FR')} {activity.unit}
                    </TableCell>
                    <TableCell>
                      {activity.co2_equivalent_kg ? (
                        <span className="font-medium text-primary">
                          {activity.co2_equivalent_kg.toFixed(2)} kg
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {activity.source_type === 'ocr' ? 'OCR' : 
                         activity.source_type === 'manual' ? 'Manuel' : 
                         activity.source_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!activity.co2_equivalent_kg && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCalculate(activity)}
                            disabled={processingId === activity.id}
                          >
                            {processingId === activity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Calculator className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {activity.status === 'draft' && activity.co2_equivalent_kg && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleValidate(activity)}
                            disabled={processingId === activity.id}
                          >
                            {processingId === activity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileCheck className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
