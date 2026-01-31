import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import type { ProjectionDataPoint } from "@/hooks/useDigitalTwin";

interface ProjectionChartProps {
  data: ProjectionDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover border border-border rounded-lg p-4 shadow-xl">
      <p className="text-foreground font-semibold mb-2">Année {label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.name === 'cashFlow' ? 'Cash Flow Net' : 'Économies Cumulées'}:
          </span>
          <span className="text-foreground font-medium">
            {entry.value.toLocaleString('fr-FR')} kTND
          </span>
        </div>
      ))}
      {payload[0]?.payload?.degradation !== undefined && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Performance panneaux: {payload[0].payload.degradation}%
          </span>
        </div>
      )}
    </div>
  );
};

export const ProjectionChart = ({ data, isLoading = false }: ProjectionChartProps) => {
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-64 bg-muted" />
          <Skeleton className="h-4 w-48 bg-muted mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Calcul des projections...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find break-even year
  const breakEvenYear = data.find(d => d.cumulative >= 0 && d.year !== "2026")?.year;

  return (
    <Card className="bg-card border-border" data-tour="projection-chart">
      <CardHeader>
        <CardTitle className="text-foreground">Flux de Trésorerie & Économies Projetées</CardTitle>
        <CardDescription className="text-muted-foreground">
          Projection sur 10 ans (2026-2036) 
          {breakEvenYear && (
            <span className="ml-2 text-primary">
              • Seuil de rentabilité: {breakEvenYear}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="year" 
                className="text-muted-foreground"
                tick={{ className: 'fill-muted-foreground text-xs' }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ className: 'fill-muted-foreground text-xs' }}
                tickFormatter={(value) => `${value}k`}
                label={{ 
                  value: 'TND (milliers)', 
                  angle: -90, 
                  position: 'insideLeft',
                  className: 'fill-muted-foreground text-xs'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-foreground">
                    {value === 'cashFlow' ? 'Cash Flow Net' : 'Économies Cumulées'}
                  </span>
                )}
              />
              <ReferenceLine y={0} className="stroke-border" strokeDasharray="3 3" />
              <Bar 
                dataKey="cashFlow" 
                fill="hsl(152, 82%, 42%)" 
                radius={[4, 4, 0, 0]}
                name="cashFlow"
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="hsl(38, 92%, 50%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(38, 92%, 50%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(45, 93%, 47%)', strokeWidth: 2 }}
                name="cumulative"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
