import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { Stakeholder, STAKEHOLDER_CATEGORIES, DEFAULT_STAKEHOLDERS } from '@/lib/rse/types';
import { Plus, Users } from 'lucide-react';

interface RSEStakeholderMatrixProps {
  stakeholders?: Stakeholder[];
  onAddStakeholder?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  regulators: '#10b981',
  local_authorities: '#3b82f6',
  civil_society: '#f59e0b',
  export_clients: '#8b5cf6',
  employees: '#ec4899',
  suppliers: '#06b6d4',
  investors: '#64748b',
};

const ENGAGEMENT_LABELS = {
  inform: 'Informer',
  consult: 'Consulter',
  involve: 'Impliquer',
  collaborate: 'Collaborer',
};

export function RSEStakeholderMatrix({ stakeholders = DEFAULT_STAKEHOLDERS, onAddStakeholder }: RSEStakeholderMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredStakeholders = selectedCategory 
    ? stakeholders.filter(s => s.category === selectedCategory)
    : stakeholders;

  const chartData = filteredStakeholders.map(s => ({
    x: s.power,
    y: s.interest,
    name: s.name,
    category: s.category,
    engagement: s.engagement,
    description: s.description,
  }));

  // Determine engagement strategy based on position
  const getQuadrant = (power: number, interest: number): string => {
    if (power >= 50 && interest >= 50) return 'Collaborer étroitement';
    if (power >= 50 && interest < 50) return 'Satisfaire';
    if (power < 50 && interest >= 50) return 'Tenir informé';
    return 'Surveiller';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const categoryInfo = STAKEHOLDER_CATEGORIES[data.category as keyof typeof STAKEHOLDER_CATEGORIES];
      
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
          <p className="font-semibold">{data.name}</p>
          <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
          <div className="space-y-1 text-xs">
            <p><span className="text-muted-foreground">Catégorie:</span> {categoryInfo?.label}</p>
            <p><span className="text-muted-foreground">Pouvoir:</span> {data.x}/100</p>
            <p><span className="text-muted-foreground">Intérêt:</span> {data.y}/100</p>
            <p><span className="text-muted-foreground">Stratégie:</span> {getQuadrant(data.x, data.y)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Matrice Pouvoir / Intérêt
              </CardTitle>
              <CardDescription>
                Cartographie des parties prenantes selon ISO 26000 et CSRD
              </CardDescription>
            </div>
            {onAddStakeholder && (
              <Button onClick={onAddStakeholder} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Tous
            </Badge>
            {Object.entries(STAKEHOLDER_CATEGORIES).map(([key, { label }]) => (
              <Badge
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                className="cursor-pointer"
                style={{ 
                  backgroundColor: selectedCategory === key ? CATEGORY_COLORS[key] : undefined,
                  borderColor: CATEGORY_COLORS[key],
                }}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* Matrix Chart */}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[0, 100]} 
                  name="Pouvoir"
                  tick={{ fontSize: 12 }}
                >
                  <Label value="Pouvoir →" offset={-10} position="insideBottom" style={{ fontSize: 12 }} />
                </XAxis>
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  domain={[0, 100]} 
                  name="Intérêt"
                  tick={{ fontSize: 12 }}
                >
                  <Label value="Intérêt →" angle={-90} position="insideLeft" style={{ fontSize: 12 }} />
                </YAxis>
                
                {/* Quadrant lines */}
                <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={chartData} fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.category]}
                      r={8}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Quadrant Labels */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-muted-foreground">Quadrant Haut-Droit</p>
              <p className="text-emerald-600 font-semibold">Collaborer étroitement</p>
              <p className="text-xs text-muted-foreground">Pouvoir élevé + Intérêt élevé</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-muted-foreground">Quadrant Bas-Droit</p>
              <p className="text-amber-600 font-semibold">Satisfaire</p>
              <p className="text-xs text-muted-foreground">Pouvoir élevé + Intérêt faible</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-muted-foreground">Quadrant Haut-Gauche</p>
              <p className="text-blue-600 font-semibold">Tenir informé</p>
              <p className="text-xs text-muted-foreground">Pouvoir faible + Intérêt élevé</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-muted-foreground">Quadrant Bas-Gauche</p>
              <p className="text-slate-600 font-semibold">Surveiller</p>
              <p className="text-xs text-muted-foreground">Pouvoir faible + Intérêt faible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des parties prenantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStakeholders.map(stakeholder => {
              const catInfo = STAKEHOLDER_CATEGORIES[stakeholder.category];
              return (
                <div 
                  key={stakeholder.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CATEGORY_COLORS[stakeholder.category] }}
                    />
                    <div>
                      <p className="font-medium">{stakeholder.name}</p>
                      <p className="text-xs text-muted-foreground">{stakeholder.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {catInfo?.label}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {ENGAGEMENT_LABELS[stakeholder.engagement]}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
