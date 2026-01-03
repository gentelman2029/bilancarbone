import { useState, useEffect } from 'react';
import { Flame, Zap, Globe, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface ScopeStats {
  scope: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  totalActivities: number;
  validatedCount: number;
  completionPercent: number;
  totalCO2Kg: number;
}

interface ScopeProgressBarsProps {
  refreshTrigger?: number;
}

export function ScopeProgressBars({ refreshTrigger }: ScopeProgressBarsProps) {
  const [stats, setStats] = useState<ScopeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      // Récupérer les stats depuis la vue ou calculer directement
      const { data, error } = await supabase
        .from('activity_data')
        .select('ghg_scope, status, co2_equivalent_kg');

      if (error) throw error;

      // Calculer les stats par scope
      const scopeMap = new Map<string, { total: number; validated: number; co2: number }>();
      
      for (const activity of data || []) {
        const scope = activity.ghg_scope;
        if (!scopeMap.has(scope)) {
          scopeMap.set(scope, { total: 0, validated: 0, co2: 0 });
        }
        const current = scopeMap.get(scope)!;
        current.total++;
        if (activity.status === 'validated' || activity.status === 'integrated') {
          current.validated++;
        }
        current.co2 += activity.co2_equivalent_kg || 0;
      }

      const scopeConfigs = [
        { scope: 'scope1', label: 'Scope 1 - Émissions directes', icon: <Flame className="h-4 w-4" />, color: 'bg-red-500' },
        { scope: 'scope2', label: 'Scope 2 - Énergie indirecte', icon: <Zap className="h-4 w-4" />, color: 'bg-amber-500' },
        { scope: 'scope3', label: 'Scope 3 - Autres indirectes', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500' }
      ];

      const statsData: ScopeStats[] = scopeConfigs.map(config => {
        const data = scopeMap.get(config.scope) || { total: 0, validated: 0, co2: 0 };
        return {
          ...config,
          totalActivities: data.total,
          validatedCount: data.validated,
          completionPercent: data.total > 0 ? Math.round((data.validated / data.total) * 100) : 0,
          totalCO2Kg: data.co2
        };
      });

      setStats(statsData);
    } catch (error) {
      console.error('Error loading scope stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || stats.length === 0) {
    return null;
  }

  const totalCO2 = stats.reduce((sum, s) => sum + s.totalCO2Kg, 0);
  const totalActivities = stats.reduce((sum, s) => sum + s.totalActivities, 0);

  if (totalActivities === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Progression du Bilan Carbone
          </h3>
          <span className="text-sm font-medium">
            Total: {(totalCO2 / 1000).toFixed(2)} t CO₂e
          </span>
        </div>
        
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.scope} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`p-1 rounded ${stat.color.replace('bg-', 'bg-')}/10`}>
                    {stat.icon}
                  </span>
                  <span className="font-medium">{stat.label}</span>
                </span>
                <span className="text-muted-foreground">
                  {stat.validatedCount}/{stat.totalActivities} validées • 
                  <span className="ml-1 font-medium text-foreground">
                    {(stat.totalCO2Kg / 1000).toFixed(2)} t
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={stat.completionPercent} 
                  className={`h-2 flex-1 [&>div]:${stat.color}`}
                />
                <span className={`text-xs font-bold min-w-[3rem] text-right ${
                  stat.completionPercent >= 80 ? 'text-green-600' :
                  stat.completionPercent >= 50 ? 'text-amber-600' :
                  'text-muted-foreground'
                }`}>
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
