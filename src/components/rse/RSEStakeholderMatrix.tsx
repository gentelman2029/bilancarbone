import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { Stakeholder, STAKEHOLDER_CATEGORIES, DEFAULT_STAKEHOLDERS, StakeholderCategory } from '@/lib/rse/types';
import { Plus, Users, Search, Download, RefreshCw } from 'lucide-react';
import { StakeholderEditPanel } from './StakeholderEditPanel';
import { StakeholderDialogueTable } from './StakeholderDialogueTable';
import { ISO26000Helper } from './ISO26000Helper';
import { toast } from 'sonner';

interface RSEStakeholderMatrixProps {
  stakeholders?: Stakeholder[];
  onAddStakeholder?: () => void;
}

const ENGAGEMENT_LABELS = {
  inform: 'Informer',
  consult: 'Consulter',
  involve: 'Impliquer',
  collaborate: 'Collaborer',
};

export function RSEStakeholderMatrix({ onAddStakeholder }: RSEStakeholderMatrixProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load stakeholders from localStorage or use defaults
  useEffect(() => {
    const saved = localStorage.getItem('rse_stakeholders');
    if (saved) {
      try {
        setStakeholders(JSON.parse(saved));
      } catch {
        setStakeholders(DEFAULT_STAKEHOLDERS);
      }
    } else {
      setStakeholders(DEFAULT_STAKEHOLDERS);
    }
  }, []);

  // Save stakeholders to localStorage
  useEffect(() => {
    if (stakeholders.length > 0) {
      localStorage.setItem('rse_stakeholders', JSON.stringify(stakeholders));
    }
  }, [stakeholders]);

  // Filter stakeholders
  const filteredStakeholders = useMemo(() => {
    let result = stakeholders;
    
    if (selectedCategory) {
      result = result.filter(s => s.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [stakeholders, selectedCategory, searchQuery]);

  const chartData = filteredStakeholders.map(s => ({
    x: s.power,
    y: s.interest,
    name: s.name,
    category: s.category,
    engagement: s.engagement,
    description: s.description,
    id: s.id,
  }));

  const getQuadrant = (power: number, interest: number): string => {
    if (power >= 50 && interest >= 50) return 'Collaborer étroitement';
    if (power >= 50 && interest < 50) return 'Satisfaire';
    if (power < 50 && interest >= 50) return 'Tenir informé';
    return 'Surveiller';
  };

  const handleStakeholderClick = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setIsEditPanelOpen(true);
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload;
      const stakeholder = stakeholders.find(s => s.id === clickedData.id);
      if (stakeholder) {
        handleStakeholderClick(stakeholder);
      }
    }
  };

  const handleSaveStakeholder = (updatedStakeholder: Stakeholder) => {
    setStakeholders(prev => 
      prev.map(s => s.id === updatedStakeholder.id ? updatedStakeholder : s)
    );
    toast.success('Partie prenante mise à jour');
  };

  const handleDeleteStakeholder = (id: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== id));
    toast.success('Partie prenante supprimée');
  };

  const handleResetToDefault = () => {
    setStakeholders(DEFAULT_STAKEHOLDERS);
    localStorage.removeItem('rse_stakeholders');
    toast.success('Liste réinitialisée avec les valeurs par défaut');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const categoryInfo = STAKEHOLDER_CATEGORIES[data.category as StakeholderCategory];
      
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
          <p className="text-xs text-primary mt-2 font-medium">Cliquez pour modifier</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Matrice Pouvoir / Intérêt
              </CardTitle>
              <CardDescription>
                Cartographie des parties prenantes selon ISO 26000 et CSRD
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <ISO26000Helper />
              <Button variant="outline" size="sm" onClick={handleResetToDefault}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une partie prenante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Tous ({stakeholders.length})
            </Badge>
            {Object.entries(STAKEHOLDER_CATEGORIES).map(([key, { label, color }]) => {
              const count = stakeholders.filter(s => s.category === key).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  style={{ 
                    backgroundColor: selectedCategory === key ? color : 'transparent',
                    borderColor: color,
                    color: selectedCategory === key ? 'white' : color,
                  }}
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                >
                  {label} ({count})
                </Badge>
              );
            })}
          </div>

          {/* Matrix Chart */}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart 
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                onClick={handleChartClick}
              >
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
                
                <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={chartData} fill="#8884d8" style={{ cursor: 'pointer' }}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STAKEHOLDER_CATEGORIES[entry.category as StakeholderCategory]?.color || '#64748b'}
                      r={10}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Quadrant Labels */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-emerald-500">
              <p className="font-medium text-muted-foreground">Quadrant Haut-Droit</p>
              <p className="text-emerald-600 font-semibold">Collaborer étroitement</p>
              <p className="text-xs text-muted-foreground">Pouvoir élevé + Intérêt élevé</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-amber-500">
              <p className="font-medium text-muted-foreground">Quadrant Bas-Droit</p>
              <p className="text-amber-600 font-semibold">Satisfaire</p>
              <p className="text-xs text-muted-foreground">Pouvoir élevé + Intérêt faible</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-blue-500">
              <p className="font-medium text-muted-foreground">Quadrant Haut-Gauche</p>
              <p className="text-blue-600 font-semibold">Tenir informé</p>
              <p className="text-xs text-muted-foreground">Pouvoir faible + Intérêt élevé</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-slate-500">
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
          <CardTitle className="text-lg">Liste des parties prenantes ({filteredStakeholders.length})</CardTitle>
          <CardDescription>Cliquez sur une partie prenante pour modifier ses scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStakeholders.map(stakeholder => {
              const catInfo = STAKEHOLDER_CATEGORIES[stakeholder.category];
              return (
                <div 
                  key={stakeholder.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleStakeholderClick(stakeholder)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: catInfo?.color }}
                    />
                    <div>
                      <p className="font-medium">{stakeholder.name}</p>
                      <p className="text-xs text-muted-foreground">{stakeholder.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                      <span>P: {stakeholder.power}</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>I: {stakeholder.interest}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs hidden md:inline-flex"
                      style={{ borderColor: catInfo?.color, color: catInfo?.color }}
                    >
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

      {/* Dialogue Table */}
      <StakeholderDialogueTable 
        stakeholders={filteredStakeholders}
        onUpdateStakeholder={handleSaveStakeholder}
      />

      {/* Edit Panel */}
      <StakeholderEditPanel
        stakeholder={selectedStakeholder}
        open={isEditPanelOpen}
        onClose={() => {
          setIsEditPanelOpen(false);
          setSelectedStakeholder(null);
        }}
        onSave={handleSaveStakeholder}
        onDelete={handleDeleteStakeholder}
      />
    </div>
  );
}
