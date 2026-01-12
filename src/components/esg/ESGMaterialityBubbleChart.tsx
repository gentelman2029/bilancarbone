import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, ReferenceLine, Label } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Target, AlertTriangle } from 'lucide-react';
import { MaterialityIssue } from './ESGMaterialityTable';

interface ESGMaterialityBubbleChartProps {
  issues: MaterialityIssue[];
}

const CATEGORY_COLORS: Record<string, string> = {
  E: 'hsl(152, 69%, 41%)',
  S: 'hsl(217, 91%, 60%)',
  G: 'hsl(271, 91%, 65%)',
};

const getRiskLabel = (score: number): string => {
  if (score >= 15) return 'Critique';
  if (score >= 8) return 'Modéré';
  return 'Faible';
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            style={{ borderColor: CATEGORY_COLORS[data.category], color: CATEGORY_COLORS[data.category] }}
          >
            {data.category === 'E' ? 'Environnement' : data.category === 'S' ? 'Social' : 'Gouvernance'}
          </Badge>
          <span className="font-medium text-sm">{data.issueName}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Gravité:</span>
            <span className="ml-1 font-medium">{data.severity}/5</span>
          </div>
          <div>
            <span className="text-muted-foreground">Probabilité:</span>
            <span className="ml-1 font-medium">{data.probability}/5</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Score de Risque:</span>
            <span className="ml-1 font-bold">{data.riskScore}/25 ({getRiskLabel(data.riskScore)})</span>
          </div>
        </div>
        {data.opportunity && (
          <div className="mt-2 pt-2 border-t text-xs">
            <span className="text-muted-foreground">Opportunité: </span>
            <span>{data.opportunity}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ESGMaterialityBubbleChart: React.FC<ESGMaterialityBubbleChartProps> = ({ issues }) => {
  // Transform data for scatter chart
  const chartData = issues.map(issue => ({
    ...issue,
    x: issue.severity,
    y: issue.probability,
    z: issue.riskScore * 20, // Scale for bubble size
  }));

  // Identify critical issues (score >= 15)
  const criticalIssues = issues.filter(i => i.riskScore >= 15);

  if (issues.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Graphique de Matérialité (Bubble Chart)
          </CardTitle>
          <CardDescription>
            Ajoutez des enjeux dans le tableau ci-dessus pour visualiser la matrice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune donnée à afficher</p>
              <p className="text-sm">Les bulles apparaîtront ici</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Matrice de Risque (Bubble Chart)
        </CardTitle>
        <CardDescription>
          La taille des bulles représente le score de risque (Gravité × Probabilité)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="x" 
                domain={[0, 6]} 
                name="Gravité"
                tick={{ fontSize: 12 }}
                ticks={[1, 2, 3, 4, 5]}
              >
                <Label 
                  value="Gravité →" 
                  position="bottom" 
                  offset={20} 
                  style={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="y" 
                domain={[0, 6]} 
                name="Probabilité"
                tick={{ fontSize: 12 }}
                ticks={[1, 2, 3, 4, 5]}
              >
                <Label 
                  value="Probabilité →" 
                  angle={-90} 
                  position="left" 
                  offset={20} 
                  style={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
              </YAxis>
              <ZAxis type="number" dataKey="z" range={[100, 1000]} />
              
              {/* Reference lines for risk zones */}
              <ReferenceLine x={3} stroke="hsl(var(--destructive))" strokeDasharray="5 5" opacity={0.3} />
              <ReferenceLine y={3} stroke="hsl(var(--destructive))" strokeDasharray="5 5" opacity={0.3} />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Scatter data={chartData}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.category]}
                    opacity={entry.riskScore >= 15 ? 0.9 : 0.6}
                    stroke={entry.riskScore >= 15 ? 'hsl(var(--destructive))' : 'transparent'}
                    strokeWidth={entry.riskScore >= 15 ? 2 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.E }} />
              <span>Environnement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.S }} />
              <span>Social</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.G }} />
              <span>Gouvernance</span>
            </div>
          </div>

          {/* Risk zone explanation */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20" />
              <span>Faible (&lt;8)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-amber-500/30" />
              <span>Modéré (8-14)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-destructive/40 border-2 border-destructive" />
              <span>Critique (≥15)</span>
            </div>
          </div>

          {/* Critical Issues Summary */}
          {criticalIssues.length > 0 && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Enjeux Critiques ({criticalIssues.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {criticalIssues.map(issue => (
                  <Badge key={issue.id} variant="destructive" className="text-xs">
                    {issue.issueName} (Score: {issue.riskScore})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
