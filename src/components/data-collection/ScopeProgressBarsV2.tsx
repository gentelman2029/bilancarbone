// Refactored Scope Progress Bars with skeleton loading and error handling
import { Flame, Zap, Globe, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScopeProgress } from '@/hooks/useScopeProgress';

interface ScopeProgressBarsV2Props {
  refreshTrigger?: number;
}

const SCOPE_ICONS: Record<string, React.ReactNode> = {
  flame: <Flame className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  globe: <Globe className="h-4 w-4" />
};

export function ScopeProgressBarsV2({ refreshTrigger }: ScopeProgressBarsV2Props) {
  const { stats, isLoading, error, totalCO2, totalActivities } = useScopeProgress(refreshTrigger);

  // Skeleton loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des stats: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No data state
  if (totalActivities === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            Progression du Bilan Carbone
          </h3>
          <span className="text-sm font-medium" aria-label={`Total: ${(totalCO2 / 1000).toFixed(2)} tonnes CO2 équivalent`}>
            Total: {(totalCO2 / 1000).toFixed(2)} t CO₂e
          </span>
        </div>

        <div className="space-y-4" role="list" aria-label="Progression par scope">
          {stats.map((stat) => (
            <div 
              key={stat.scope} 
              className="space-y-1" 
              role="listitem"
              aria-label={`${stat.label}: ${stat.completionPercent}% complété`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span 
                    className={`p-1 rounded ${stat.colorClass}/10`}
                    aria-hidden="true"
                  >
                    {SCOPE_ICONS[stat.icon]}
                  </span>
                  <span className="font-medium">{stat.label}</span>
                </span>
                <span className="text-muted-foreground">
                  <span aria-label={`${stat.validatedCount} sur ${stat.totalActivities} validées`}>
                    {stat.validatedCount}/{stat.totalActivities} validées
                  </span>
                  {' • '}
                  <span className="ml-1 font-medium text-foreground" aria-label={`${(stat.totalCO2Kg / 1000).toFixed(2)} tonnes`}>
                    {(stat.totalCO2Kg / 1000).toFixed(2)} t
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={stat.completionPercent}
                  className={`h-2 flex-1 [&>div]:${stat.colorClass}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={stat.completionPercent}
                  aria-label={`${stat.label} progression`}
                />
                <span
                  className={`text-xs font-bold min-w-[3rem] text-right ${
                    stat.completionPercent >= 80
                      ? 'text-green-600'
                      : stat.completionPercent >= 50
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stat.completionPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
