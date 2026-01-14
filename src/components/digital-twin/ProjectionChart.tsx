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
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
      <p className="text-slate-200 font-semibold mb-2">Année {label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">
            {entry.name === 'cashFlow' ? 'Cash Flow Net' : 'Économies Cumulées'}:
          </span>
          <span className="text-slate-100 font-medium">
            {entry.value.toLocaleString('fr-FR')} kTND
          </span>
        </div>
      ))}
      {payload[0]?.payload?.degradation !== undefined && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <span className="text-xs text-slate-500">
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
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-64 bg-slate-700" />
          <Skeleton className="h-4 w-48 bg-slate-700 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
              <p className="text-slate-400">Calcul des projections...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find break-even year
  const breakEvenYear = data.find(d => d.cumulative >= 0 && d.year !== "2026")?.year;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100">Flux de Trésorerie & Économies Projetées</CardTitle>
        <CardDescription className="text-slate-400">
          Projection sur 10 ans (2026-2036) 
          {breakEvenYear && (
            <span className="ml-2 text-emerald-400">
              • Seuil de rentabilité: {breakEvenYear}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `${value}k`}
                label={{ 
                  value: 'TND (milliers)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#64748b', fontSize: 11 }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-slate-300">
                    {value === 'cashFlow' ? 'Cash Flow Net' : 'Économies Cumulées'}
                  </span>
                )}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar 
                dataKey="cashFlow" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="cashFlow"
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2 }}
                name="cumulative"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
