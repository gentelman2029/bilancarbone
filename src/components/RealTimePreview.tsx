import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Activity, Zap } from "lucide-react";
import { useEmissions } from '@/contexts/EmissionsContext';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface RealTimePreviewProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const RealTimePreview: React.FC<RealTimePreviewProps> = ({
  isEnabled,
  onToggle
}) => {
  const { emissions, hasEmissions } = useEmissions();
  const [history, setHistory] = useState<Array<{
    time: string;
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
  }>>([]);

  useEffect(() => {
    if (isEnabled && hasEmissions) {
      const newDataPoint = {
        time: new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        total: emissions.total / 1000,
        scope1: emissions.scope1 / 1000,
        scope2: emissions.scope2 / 1000,
        scope3: emissions.scope3 / 1000
      };

      setHistory(prev => {
        const updated = [...prev, newDataPoint];
        // Garder seulement les 20 derniers points
        return updated.slice(-20);
      });
    }
  }, [emissions, isEnabled, hasEmissions]);

  if (!isEnabled) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <EyeOff className="w-5 h-5 mr-2 text-muted-foreground" />
              Aperçu Temps Réel
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Activer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Activez l'aperçu temps réel pour voir vos émissions évoluer pendant la saisie
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600 animate-pulse" />
            Aperçu Temps Réel
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              <Zap className="w-3 h-3 mr-1" />
              Actif
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="text-xs"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Désactiver
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasEmissions ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Commencez à saisir vos données dans le calculateur pour voir l'aperçu temps réel
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Métriques actuelles */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(emissions.total / 1000).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Total tCO₂e</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-500">
                  {(emissions.scope1 / 1000).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Scope 1</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-500">
                  {(emissions.scope2 / 1000).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Scope 2</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-500">
                  {(emissions.scope3 / 1000).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Scope 3</div>
              </div>
            </div>

            {/* Graphique d'évolution */}
            {history.length > 1 && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} tCO₂e`, 'Total']}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-xs text-center text-muted-foreground">
              Les données se mettent à jour automatiquement à chaque modification
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};