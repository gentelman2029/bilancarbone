// RSE Report Charts - Interactive Visualizations
// Recharts-based graphs for ESG scores, actions, and benchmarks

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from 'recharts';
import { RSEReportData } from '@/hooks/useRSEReport';

interface RSEReportChartsProps {
  reportData: RSEReportData;
}

const COLORS = {
  E: '#10B981', // emerald
  S: '#3B82F6', // blue
  G: '#8B5CF6', // purple
  primary: '#0ea5e9',
  completed: '#10B981',
  inProgress: '#3B82F6',
  todo: '#94a3b8',
  blocked: '#ef4444',
};

export function RSEReportCharts({ reportData }: RSEReportChartsProps) {
  // ESG Score Distribution Data
  const esgPieData = [
    { name: 'Environnement', value: reportData.esgScores.categoryScores.E || 0, color: COLORS.E },
    { name: 'Social', value: reportData.esgScores.categoryScores.S || 0, color: COLORS.S },
    { name: 'Gouvernance', value: reportData.esgScores.categoryScores.G || 0, color: COLORS.G },
  ];

  // Action Status Distribution
  const actionStatusData = [
    { name: 'Terminées', value: reportData.actionStats.completed, color: COLORS.completed },
    { name: 'En cours', value: reportData.actionStats.inProgress, color: COLORS.inProgress },
    { name: 'À faire', value: reportData.actionStats.todo, color: COLORS.todo },
    { name: 'Bloquées', value: reportData.actionStats.blocked, color: COLORS.blocked },
  ];

  // Actions by Category
  const actionsByCategoryData = [
    { 
      name: 'Environnement', 
      total: reportData.actionStats.byCategory.E.count,
      completed: reportData.actionStats.byCategory.E.completed,
      fill: COLORS.E,
    },
    { 
      name: 'Social', 
      total: reportData.actionStats.byCategory.S.count,
      completed: reportData.actionStats.byCategory.S.completed,
      fill: COLORS.S,
    },
    { 
      name: 'Gouvernance', 
      total: reportData.actionStats.byCategory.G.count,
      completed: reportData.actionStats.byCategory.G.completed,
      fill: COLORS.G,
    },
  ];

  // Benchmark Comparison Data
  const benchmarkData = [
    { 
      name: 'Environnement', 
      'Votre score': reportData.esgScores.categoryScores.E || 0,
      'Moyenne secteur': reportData.benchmark.eScore,
      'Top 10%': reportData.benchmark.topScore,
    },
    { 
      name: 'Social', 
      'Votre score': reportData.esgScores.categoryScores.S || 0,
      'Moyenne secteur': reportData.benchmark.sScore,
      'Top 10%': reportData.benchmark.topScore,
    },
    { 
      name: 'Gouvernance', 
      'Votre score': reportData.esgScores.categoryScores.G || 0,
      'Moyenne secteur': reportData.benchmark.gScore,
      'Top 10%': reportData.benchmark.topScore,
    },
  ];

  // Radial Score Gauge Data
  const scoreGaugeData = [
    {
      name: 'Global',
      value: reportData.esgScores.totalScore,
      fill: COLORS.primary,
    },
    {
      name: 'Environnement',
      value: reportData.esgScores.categoryScores.E || 0,
      fill: COLORS.E,
    },
    {
      name: 'Social',
      value: reportData.esgScores.categoryScores.S || 0,
      fill: COLORS.S,
    },
    {
      name: 'Gouvernance',
      value: reportData.esgScores.categoryScores.G || 0,
      fill: COLORS.G,
    },
  ];

  // Budget Allocation Data
  const budgetData = [
    { name: 'Consommé', value: reportData.budgetStats.spent, fill: COLORS.completed },
    { name: 'Restant', value: reportData.budgetStats.remaining, fill: '#e2e8f0' },
  ];

  // Score Evolution (simulated trajectory)
  const trajectoryData = [
    { year: reportData.fiscalYear - 3, score: Math.max(20, reportData.esgScores.totalScore - 25), target: 50 },
    { year: reportData.fiscalYear - 2, score: Math.max(30, reportData.esgScores.totalScore - 18), target: 55 },
    { year: reportData.fiscalYear - 1, score: Math.max(40, reportData.esgScores.totalScore - 10), target: 60 },
    { year: reportData.fiscalYear, score: reportData.esgScores.totalScore, target: 65 },
    { year: reportData.fiscalYear + 1, score: null, target: 70, projected: Math.min(100, reportData.esgScores.totalScore + 8) },
    { year: reportData.fiscalYear + 2, score: null, target: 75, projected: Math.min(100, reportData.esgScores.totalScore + 15) },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ESG Score Distribution Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Répartition des Scores ESG</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={esgPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(0)}`}
              >
                {esgPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {esgPieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Statut du Plan d'Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={actionStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {actionStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Benchmark Comparison Bar Chart */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comparaison au Benchmark Sectoriel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={benchmarkData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Votre score" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Moyenne secteur" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Top 10%" fill={COLORS.E} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actions by Category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actions par Pilier ESG</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={actionsByCategoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="completed" name="Terminées" stackId="a" fill={COLORS.completed} />
              <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Evolution Trajectory */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trajectoire ESG</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={trajectoryData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="target" 
                name="Objectif" 
                fill="#10B98120" 
                stroke="#10B981" 
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Score réel" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                dot={{ r: 5 }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                name="Projection" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radial Score Gauge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vue Radiale des Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              barSize={15}
              data={scoreGaugeData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background
                dataKey="value"
                cornerRadius={5}
              />
              <Legend 
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Utilization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Utilisation Budgétaire RSE</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${value.toLocaleString('fr-FR')} TND`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-6">
            <p className="text-2xl font-bold">{reportData.budgetStats.utilizationRate}%</p>
            <p className="text-sm text-muted-foreground">Budget utilisé</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RSEReportCharts;
