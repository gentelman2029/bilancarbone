import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { MaterialityPoint } from '@/lib/esg/types';

interface ESGMaterialityMatrixProps {
  data: MaterialityPoint[];
}

const CATEGORY_COLORS = {
  E: 'hsl(152, 69%, 41%)',
  S: 'hsl(217, 91%, 60%)',
  G: 'hsl(271, 91%, 65%)',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MaterialityPoint;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            style={{ borderColor: CATEGORY_COLORS[data.category], color: CATEGORY_COLORS[data.category] }}
          >
            {data.id}
          </Badge>
          <span className="font-medium text-sm">{data.label}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Impact Environnemental:</span>
            <span className="ml-1 font-medium">{data.environmentalImpact}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Risque Financier:</span>
            <span className="ml-1 font-medium">{data.financialRisk}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ESGMaterialityMatrix: React.FC<ESGMaterialityMatrixProps> = ({ data }) => {
  // Identify high priority items (both dimensions > 60)
  const highPriority = data.filter(d => d.environmentalImpact > 60 && d.financialRisk > 60);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Matrice de Double Matérialité
        </CardTitle>
        <CardDescription>
          Analyse CSRD : Impact environnemental vs Risque financier pour l'entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="financialRisk" 
                domain={[0, 100]} 
                name="Risque Financier"
                tick={{ fontSize: 12 }}
              >
                <Label value="Risque Financier pour l'Entreprise →" position="bottom" offset={20} style={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="environmentalImpact" 
                domain={[0, 100]} 
                name="Impact Environnemental"
                tick={{ fontSize: 12 }}
              >
                <Label value="Impact sur l'Environnement →" angle={-90} position="left" offset={20} style={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              </YAxis>
              <ReferenceLine x={60} stroke="hsl(var(--destructive))" strokeDasharray="5 5" opacity={0.5} />
              <ReferenceLine y={60} stroke="hsl(var(--destructive))" strokeDasharray="5 5" opacity={0.5} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={data} fill="hsl(var(--primary))">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.category]}
                    opacity={entry.environmentalImpact > 60 && entry.financialRisk > 60 ? 1 : 0.6}
                    r={entry.environmentalImpact > 60 && entry.financialRisk > 60 ? 8 : 6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Priority Items */}
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

          {highPriority.length > 0 && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <span className="text-sm font-medium text-destructive">
                Enjeux Prioritaires (Double Matérialité) :
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {highPriority.map(item => (
                  <Badge key={item.id} variant="destructive" className="text-xs">
                    {item.id}: {item.label}
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
