import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Coins, 
  Target, 
  MapPin, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  Leaf,
  Users,
  Building2
} from 'lucide-react';
import { RSEAction, RSEDashboardStats } from '@/lib/rse/types';
import { calculateCSRDProgress, countRegionalImpactActions, calculateBudgetStats } from '@/lib/rse/actionEngine';

interface RSEStrategicDashboardProps {
  actions: RSEAction[];
}

const CATEGORY_COLORS = {
  E: '#10b981',
  S: '#3b82f6',
  G: '#8b5cf6',
};

export function RSEStrategicDashboard({ actions }: RSEStrategicDashboardProps) {
  // Calculate stats
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'done').length;
  const inProgressActions = actions.filter(a => a.status === 'in_progress').length;
  const blockedActions = actions.filter(a => a.status === 'blocked').length;
  const regionalImpactActions = countRegionalImpactActions(actions);
  const csrdProgress = calculateCSRDProgress(actions);
  const { allocated, spent } = calculateBudgetStats(actions);

  // Budget by category
  const budgetByCategory = ['E', 'S', 'G'].map(cat => ({
    category: cat,
    name: cat === 'E' ? 'Environnement' : cat === 'S' ? 'Social' : 'Gouvernance',
    allocated: actions.filter(a => a.category === cat).reduce((sum, a) => sum + a.impactMetrics.costEstimated, 0),
    spent: actions.filter(a => a.category === cat && a.status === 'done').reduce((sum, a) => sum + a.impactMetrics.costEstimated, 0),
  }));

  // Status distribution
  const statusDistribution = [
    { name: 'Terminé', value: completedActions, color: '#10b981' },
    { name: 'En cours', value: inProgressActions, color: '#3b82f6' },
    { name: 'Bloqué', value: blockedActions, color: '#ef4444' },
    { name: 'À faire', value: actions.filter(a => a.status === 'todo').length, color: '#94a3b8' },
  ].filter(item => item.value > 0);

  // Regional vs Non-regional
  const regionalData = [
    { name: 'Impact régional', value: regionalImpactActions, color: '#10b981' },
    { name: 'Autres actions', value: totalActions - regionalImpactActions, color: '#64748b' },
  ].filter(item => item.value > 0);

  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de complétion</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Progress value={completionRate} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedActions}/{totalActions} actions terminées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progression CSRD</p>
                <p className="text-2xl font-bold">{csrdProgress}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={csrdProgress} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Plan de Transition CSRD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions Régionales</p>
                <p className="text-2xl font-bold">{regionalImpactActions}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Loi RSE 2018-35 - Développement local
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              {totalActions > 0 ? Math.round((regionalImpactActions / totalActions) * 100) : 0}% du portefeuille
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget RSE</p>
                <p className="text-2xl font-bold">{(spent / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={allocated > 0 ? (spent / allocated) * 100 : 0} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {(spent / 1000).toFixed(0)}K / {(allocated / 1000).toFixed(0)}K TND engagé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Budget RSE par Pilier
            </CardTitle>
            <CardDescription>Engagé vs Réalisé (en TND)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} TND`]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Bar dataKey="allocated" name="Engagé" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spent" name="Réalisé" radius={[0, 4, 4, 0]}>
                    {budgetByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Répartition des Actions
            </CardTitle>
            <CardDescription>Par statut et impact régional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[200px]">
                <p className="text-sm font-medium text-center mb-2">Par Statut</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[200px]">
                <p className="text-sm font-medium text-center mb-2">Impact Régional</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {regionalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {statusDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résumé par Pilier ESG</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['E', 'S', 'G'] as const).map(cat => {
              const catActions = actions.filter(a => a.category === cat);
              const catCompleted = catActions.filter(a => a.status === 'done').length;
              const catProgress = catActions.length > 0 ? Math.round((catCompleted / catActions.length) * 100) : 0;
              const config = {
                E: { label: 'Environnement', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                S: { label: 'Social', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                G: { label: 'Gouvernance', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
              }[cat];
              const Icon = config.icon;

              return (
                <div key={cat} className={`p-4 rounded-lg ${config.bg}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <span className="font-semibold">{config.label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Actions</span>
                      <span className="font-medium">{catActions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Terminées</span>
                      <span className="font-medium text-emerald-600">{catCompleted}</span>
                    </div>
                    <Progress value={catProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{catProgress}% complété</p>
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
