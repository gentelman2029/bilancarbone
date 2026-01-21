// Enhanced Activity Data Table with tCO₂e calculations
import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Calculator, 
  Loader2, 
  FileCheck, 
  AlertTriangle, 
  Eye,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { activityDataService } from '@/lib/dataCollection/activityService';
import { emissionsCalculator } from '@/lib/dataCollection/emissionsCalculator';
import { ActivityData, GHG_CATEGORIES } from '@/lib/dataCollection/types';
import { DocumentPreviewButton } from './DocumentPreviewButton';
import { useNotifications, createNotification } from '@/hooks/useNotifications';

interface EnhancedActivityDataTableProps {
  refreshTrigger?: number;
  onRecalculateComplete?: () => void;
  showOnlyValidated?: boolean;
}

interface EnhancedActivity extends ActivityData {
  isSelected?: boolean;
  isRecalculating?: boolean;
  co2_tonnes?: number;
  methodology?: string;
  confidence_score?: number;
}

export function EnhancedActivityDataTable({ refreshTrigger, onRecalculateComplete, showOnlyValidated = false }: EnhancedActivityDataTableProps) {
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterScope, setFilterScope] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  
  const { addNotification } = useNotifications();

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await activityDataService.getActivityData();
      if (result.error) throw new Error(result.error);
      
      const enhanced: EnhancedActivity[] = (result.data || []).map(activity => ({
        ...activity,
        co2_tonnes: activity.co2_equivalent_kg ? activity.co2_equivalent_kg / 1000 : undefined,
      }));
      
      setActivities(enhanced);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Erreur lors du chargement des activités');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [refreshTrigger, loadActivities]);

  // Calculate single activity
  const handleCalculate = async (activity: EnhancedActivity) => {
    setProcessingIds(prev => new Set(prev).add(activity.id));
    
    try {
      // Use enhanced calculator
      const result = await emissionsCalculator.calculate({
        activity_type: activity.ghg_category,
        quantity: activity.quantity,
        unit: activity.unit,
        ghg_scope: activity.ghg_scope as any,
        ghg_category: activity.ghg_category,
        amount_eur: activity.amount_ht || undefined,
      });
      
      // Update in database
      await activityDataService.updateActivityData(activity.id, {
        co2_equivalent_kg: result.co2_equivalent_kg,
        emission_factor_value: result.emission_factor.factor_value,
        emission_factor_unit: result.emission_factor.factor_unit,
        emission_factor_source: result.emission_factor.source,
        uncertainty_percent: result.emission_factor.uncertainty_percent,
      });
      
      // Update local state
      setActivities(prev => prev.map(a => 
        a.id === activity.id 
          ? { 
              ...a, 
              co2_equivalent_kg: result.co2_equivalent_kg,
              co2_tonnes: result.co2_equivalent_tonnes,
              emission_factor_value: result.emission_factor.factor_value,
              emission_factor_source: result.emission_factor.source,
              methodology: result.methodology,
              confidence_score: result.confidence_score,
            }
          : a
      ));
      
      toast.success('Calcul effectué', {
        description: `${result.co2_equivalent_kg.toFixed(2)} kgCO₂e (${result.methodology})`
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Erreur lors du calcul');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
    }
  };

  // Batch recalculate
  const handleBatchRecalculate = async () => {
    const toRecalculate = selectedIds.size > 0 
      ? activities.filter(a => selectedIds.has(a.id))
      : activities.filter(a => !a.co2_equivalent_kg);
    
    if (toRecalculate.length === 0) {
      toast.info('Aucune activité à recalculer');
      return;
    }
    
    setIsBatchProcessing(true);
    let successCount = 0;
    let errorCount = 0;
    
    for (const activity of toRecalculate) {
      try {
        await handleCalculate(activity);
        successCount++;
      } catch {
        errorCount++;
      }
    }
    
    setIsBatchProcessing(false);
    setSelectedIds(new Set());
    
    addNotification(createNotification.calculationComplete(
      activities.reduce((sum, a) => sum + (a.co2_equivalent_kg || 0), 0),
      successCount
    ));
    
    onRecalculateComplete?.();
  };

  // Validate activity
  const handleValidate = async (activity: EnhancedActivity) => {
    setProcessingIds(prev => new Set(prev).add(activity.id));
    try {
      await activityDataService.updateActivityData(activity.id, { status: 'validated' });
      setActivities(prev => prev.map(a => 
        a.id === activity.id ? { ...a, status: 'validated' } : a
      ));
      toast.success('Activité validée');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredActivities.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredActivities.map(a => a.id)));
    }
  };

  // Filter activities - respect showOnlyValidated prop for Analysis tab
  const filteredActivities = activities.filter(a => {
    // When showOnlyValidated is true, only show validated or integrated activities
    if (showOnlyValidated && a.status !== 'validated' && a.status !== 'integrated') return false;
    if (filterScope !== 'all' && a.ghg_scope !== filterScope) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  // Scope badge
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

  // Status badge
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

  // Uncertainty badge
  const getUncertaintyBadge = (activity: EnhancedActivity) => {
    const uncertainty = (activity as any).uncertainty_percent;
    if (!uncertainty) return null;
    
    const color = uncertainty <= 10 ? 'text-green-600 border-green-500/30' :
                  uncertainty <= 20 ? 'text-amber-600 border-amber-500/30' :
                  'text-red-600 border-red-500/30';
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`text-xs ${color}`}>
              ±{uncertainty}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Incertitude: {uncertainty}%</p>
            <p className="text-xs text-muted-foreground">
              {uncertainty <= 10 ? 'Donnée réelle (facture)' :
               uncertainty <= 20 ? 'Donnée technique' :
               'Ratio monétaire (estimation)'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Category label
  const getCategoryLabel = (scope: string, category: string) => {
    const scopeCategories = GHG_CATEGORIES[scope as keyof typeof GHG_CATEGORIES] || [];
    const found = scopeCategories.find(c => c.id === category);
    return found?.label || category;
  };

  // Stats
  const totalEmissions = activities.reduce((sum, a) => sum + (a.co2_equivalent_kg || 0), 0);
  const validatedCount = activities.filter(a => a.status === 'validated' || a.status === 'integrated').length;
  const pendingCalculations = activities.filter(a => !a.co2_equivalent_kg).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
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
              {(totalEmissions / 1000).toFixed(2)} tCO₂e
            </span>
            <Badge variant="secondary">{validatedCount}/{activities.length} validées</Badge>
            {pendingCalculations > 0 && (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                {pendingCalculations} à calculer
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center justify-between">
            <span>Consommations collectées avec calculs carbone automatisés</span>
            <div className="flex items-center gap-2">
              {/* Filters */}
              <Select value={filterScope} onValueChange={setFilterScope}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous scopes</SelectItem>
                  <SelectItem value="scope1">Scope 1</SelectItem>
                  <SelectItem value="scope2">Scope 2</SelectItem>
                  <SelectItem value="scope3">Scope 3</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="validated">Validé</SelectItem>
                  <SelectItem value="integrated">Intégré</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Batch actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isBatchProcessing}>
                    {isBatchProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBatchRecalculate}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recalculer {selectedIds.size > 0 ? `(${selectedIds.size})` : 'tout'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={loadActivities}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">
              {showOnlyValidated 
                ? 'Aucune donnée validée'
                : 'Aucune donnée d\'activité'}
            </p>
            <p className="text-sm">
              {showOnlyValidated 
                ? 'Validez les documents dans l\'onglet "Vérification" pour les voir ici'
                : 'Téléchargez des documents pour commencer'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedIds.size === filteredActivities.length && filteredActivities.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      tCO₂e
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Tonnes de CO₂ équivalent calculées
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead>Incertitude</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id} className={selectedIds.has(activity.id) ? 'bg-accent/50' : ''}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(activity.id)}
                        onCheckedChange={() => toggleSelect(activity.id)}
                      />
                    </TableCell>
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
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-primary">
                            {(activity.co2_equivalent_kg / 1000).toFixed(3)}
                          </span>
                          {/* Badge IA - À vérifier pour les données non validées */}
                          {activity.status === 'draft' && (
                            <Badge 
                              variant="outline" 
                              className="text-[10px] px-1 py-0 border-amber-500/50 text-amber-600 bg-amber-500/10"
                            >
                              IA - À vérifier
                            </Badge>
                          )}
                          {activity.status !== 'draft' && activity.confidence_score && activity.confidence_score >= 0.8 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Sparkles className="h-3 w-3 text-green-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Haute confiance ({Math.round(activity.confidence_score * 100)}%)
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getUncertaintyBadge(activity) || (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-500/30">
                          ±5%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DocumentPreviewButton 
                        documentId={activity.source_document_id}
                        compact
                      />
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!activity.co2_equivalent_kg && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleCalculate(activity)}
                                  disabled={processingIds.has(activity.id)}
                                >
                                  {processingIds.has(activity.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Calculator className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Calculer les émissions</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {activity.status === 'draft' && activity.co2_equivalent_kg && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleValidate(activity)}
                                  disabled={processingIds.has(activity.id)}
                                >
                                  {processingIds.has(activity.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <FileCheck className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Valider l'activité</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
