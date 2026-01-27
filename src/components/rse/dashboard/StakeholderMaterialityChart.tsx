import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label
} from 'recharts';
import { Users, Filter } from 'lucide-react';
import { Stakeholder, STAKEHOLDER_CATEGORIES, StakeholderCategory, DIALOGUE_MODES } from '@/lib/rse/types';

interface StakeholderMaterialityChartProps {
  stakeholders: Stakeholder[];
}

const CATEGORY_FILTERS: { value: StakeholderCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'regulators', label: 'Régulateurs' },
  { value: 'export_clients', label: 'Clients' },
  { value: 'employees', label: 'Collaborateurs' },
  { value: 'investors', label: 'Investisseurs' },
  { value: 'civil_society', label: 'Société civile' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: Stakeholder }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const stakeholder = payload[0].payload;
  const categoryInfo = STAKEHOLDER_CATEGORIES[stakeholder.category];

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: categoryInfo.color }}
        />
        <span className="font-semibold">{stakeholder.name}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{stakeholder.description}</p>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pouvoir (Influence)</span>
          <span className="font-medium">{stakeholder.power}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Intérêt</span>
          <span className="font-medium">{stakeholder.interest}%</span>
        </div>
        {stakeholder.dialogueMode && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode de dialogue</span>
            <span className="font-medium">{DIALOGUE_MODES[stakeholder.dialogueMode]}</span>
          </div>
        )}
      </div>

      {stakeholder.keyExpectations && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Attentes clés</p>
          <p className="text-sm">{stakeholder.keyExpectations}</p>
        </div>
      )}

      {/* Engagement Strategy Badge */}
      <div className="mt-3">
        <Badge 
          variant="outline" 
          className={
            stakeholder.power >= 50 && stakeholder.interest >= 50
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : stakeholder.power >= 50
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : stakeholder.interest >= 50
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }
        >
          {stakeholder.power >= 50 && stakeholder.interest >= 50
            ? 'Collaborer étroitement'
            : stakeholder.power >= 50
            ? 'Satisfaire'
            : stakeholder.interest >= 50
            ? 'Informer régulièrement'
            : 'Surveiller'}
        </Badge>
      </div>
    </div>
  );
}

export function StakeholderMaterialityChart({ stakeholders }: StakeholderMaterialityChartProps) {
  const [activeFilter, setActiveFilter] = useState<StakeholderCategory | 'all'>('all');

  const filteredStakeholders = activeFilter === 'all' 
    ? stakeholders 
    : stakeholders.filter(s => s.category === activeFilter);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Cartographie des parties prenantes
            </CardTitle>
            <CardDescription className="mt-1">
              Matrice Pouvoir / Intérêt selon ISO 26000
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground mr-1" />
            {CATEGORY_FILTERS.map(filter => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className="text-xs h-7 px-2"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              
              <XAxis 
                type="number" 
                dataKey="interest" 
                domain={[0, 100]} 
                name="Intérêt"
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11 }}
              >
                <Label value="Intérêt →" position="bottom" offset={10} className="fill-muted-foreground text-xs" />
              </XAxis>
              
              <YAxis 
                type="number" 
                dataKey="power" 
                domain={[0, 100]} 
                name="Pouvoir"
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11 }}
              >
                <Label value="Pouvoir (Influence) →" angle={-90} position="left" offset={25} className="fill-muted-foreground text-xs" />
              </YAxis>

              {/* Quadrant Reference Lines */}
              <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" opacity={0.4} />
              <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" opacity={0.4} />

              <Tooltip content={<CustomTooltip />} />

              <Scatter 
                name="Parties prenantes" 
                data={filteredStakeholders}
                fill="hsl(var(--primary))"
              >
                {filteredStakeholders.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STAKEHOLDER_CATEGORIES[entry.category].color}
                    className="cursor-pointer transition-all hover:opacity-80"
                    r={8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Quadrant Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-border/50">
          <div className="text-center p-2 rounded-lg bg-emerald-50/50">
            <p className="text-xs font-semibold text-emerald-700">Collaborer</p>
            <p className="text-[10px] text-muted-foreground">Pouvoir + Intérêt élevés</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50/50">
            <p className="text-xs font-semibold text-amber-700">Satisfaire</p>
            <p className="text-[10px] text-muted-foreground">Pouvoir élevé</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50/50">
            <p className="text-xs font-semibold text-blue-700">Informer</p>
            <p className="text-[10px] text-muted-foreground">Intérêt élevé</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-600">Surveiller</p>
            <p className="text-[10px] text-muted-foreground">Priorité basse</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
