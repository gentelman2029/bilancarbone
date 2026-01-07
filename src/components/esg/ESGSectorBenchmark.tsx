import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getSectorBenchmarks } from '@/lib/esg/scoringEngine';
import { TUNISIAN_SECTORS } from '@/lib/esg/types';

interface ESGSectorBenchmarkProps {
  sector: string;
  userScore: number;
  categoryScores: Record<string, number>;
}

export const ESGSectorBenchmark: React.FC<ESGSectorBenchmarkProps> = ({
  sector,
  userScore,
  categoryScores,
}) => {
  const benchmarks = getSectorBenchmarks();
  const sectorBenchmark = benchmarks[sector];
  const sectorLabel = TUNISIAN_SECTORS.find(s => s.value === sector)?.label || sector;

  if (!sectorBenchmark) return null;

  const comparison = userScore - sectorBenchmark.avgScore;
  const isAboveAvg = comparison > 0;

  const chartData = [
    {
      name: 'Environnement',
      'Votre Score': categoryScores.E || 0,
      'Moyenne Secteur': sectorBenchmark.eScore,
    },
    {
      name: 'Social',
      'Votre Score': categoryScores.S || 0,
      'Moyenne Secteur': sectorBenchmark.sScore,
    },
    {
      name: 'Gouvernance',
      'Votre Score': categoryScores.G || 0,
      'Moyenne Secteur': sectorBenchmark.gScore,
    },
  ];

  const overallData = [
    {
      name: 'Votre Score',
      value: userScore,
      fill: 'hsl(var(--primary))',
    },
    {
      name: 'Moyenne Secteur',
      value: sectorBenchmark.avgScore,
      fill: 'hsl(var(--muted-foreground))',
    },
    {
      name: 'Top 10% Secteur',
      value: sectorBenchmark.topScore,
      fill: 'hsl(152, 69%, 41%)',
    },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Benchmark Sectoriel - {sectorLabel}</span>
          <Badge 
            variant={isAboveAvg ? 'default' : 'secondary'}
            className={`flex items-center gap-1 ${isAboveAvg ? 'bg-emerald-500' : ''}`}
          >
            {isAboveAvg ? (
              <TrendingUp className="h-3 w-3" />
            ) : comparison < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {comparison > 0 ? '+' : ''}{comparison.toFixed(1)} pts vs moyenne
          </Badge>
        </CardTitle>
        <CardDescription>
          Comparaison avec les entreprises tunisiennes du même secteur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Comparison */}
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overallData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}/100`, 'Score']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {overallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Comparison */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}/100`, '']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Votre Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Moyenne Secteur" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          {['E', 'S', 'G'].map((cat) => {
            const userCatScore = categoryScores[cat] || 0;
            const benchmarkScore = cat === 'E' ? sectorBenchmark.eScore : cat === 'S' ? sectorBenchmark.sScore : sectorBenchmark.gScore;
            const diff = userCatScore - benchmarkScore;
            return (
              <div key={cat} className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">
                  {cat === 'E' ? 'Environnement' : cat === 'S' ? 'Social' : 'Gouvernance'}
                </div>
                <div className={`text-lg font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">vs secteur</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
