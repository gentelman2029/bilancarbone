import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Treemap } from "recharts";
import { Filter, RotateCcw, Eye, EyeOff } from "lucide-react";

interface EmissionsByPostData {
  name: string;
  value: number;
  percentage: number;
  scope: string;
  color: string;
  category: string;
}

interface InteractiveEmissionsChartProps {
  data: EmissionsByPostData[];
  onPostClick?: (post: string) => void;
  selectedPost?: string | null;
}

export const InteractiveEmissionsChart = ({ 
  data, 
  onPostClick, 
  selectedPost 
}: InteractiveEmissionsChartProps) => {
  const [viewMode, setViewMode] = useState<'donut' | 'treemap'>('donut');
  const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());

  const filteredData = data.filter(item => !hiddenPosts.has(item.name));
  const totalVisible = filteredData.reduce((sum, item) => sum + item.value, 0);

  const togglePostVisibility = (postName: string) => {
    const newHidden = new Set(hiddenPosts);
    if (newHidden.has(postName)) {
      newHidden.delete(postName);
    } else {
      newHidden.add(postName);
    }
    setHiddenPosts(newHidden);
  };

  const resetFilters = () => {
    setHiddenPosts(new Set());
    if (onPostClick) onPostClick('');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">Scope: {data.scope}</p>
          <p className="text-sm">
            <span className="font-medium">{data.value.toFixed(1)} tCO₂e</span>
            <span className="text-muted-foreground ml-2">({data.percentage.toFixed(1)}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const TreemapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">Catégorie: {data.category}</p>
          <p className="text-sm">
            <span className="font-medium">{data.value} tCO₂e</span>
            <span className="text-muted-foreground ml-2">({((data.value / totalVisible) * 100).toFixed(1)}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (entry: any) => {
    if (onPostClick) {
      onPostClick(selectedPost === entry.name ? '' : entry.name);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Répartition des Émissions par Poste
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'donut' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('donut')}
            >
              Donut
            </Button>
            <Button
              variant={viewMode === 'treemap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('treemap')}
            >
              Treemap
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Légende interactive */}
        <div className="mb-4 flex flex-wrap gap-2">
          {data.map((item) => (
            <Badge
              key={item.name}
              variant={hiddenPosts.has(item.name) ? "outline" : "default"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedPost === item.name ? 'ring-2 ring-primary' : ''
              }`}
              style={{ 
                backgroundColor: hiddenPosts.has(item.name) ? 'transparent' : item.color,
                borderColor: item.color,
                color: hiddenPosts.has(item.name) ? item.color : 'white'
              }}
              onClick={() => {
                togglePostVisibility(item.name);
                handleClick(item);
              }}
            >
              {hiddenPosts.has(item.name) ? (
                <EyeOff className="w-3 h-3 mr-1" />
              ) : (
                <Eye className="w-3 h-3 mr-1" />
              )}
              {item.name}
              <span className="ml-1 text-xs">
                ({item.percentage.toFixed(1)}%)
              </span>
            </Badge>
          ))}
        </div>

        {/* Graphique principal */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'donut' ? (
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={handleClick}
                  className="cursor-pointer"
                >
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={selectedPost === entry.name ? "#000" : "none"}
                      strokeWidth={selectedPost === entry.name ? 2 : 0}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={() => (
                    <div className="text-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        Total visible: <span className="font-semibold">{totalVisible.toFixed(1)} tCO₂e</span>
                      </p>
                      {selectedPost && (
                        <p className="text-xs text-primary mt-1">
                          Poste sélectionné: {selectedPost}
                        </p>
                      )}
                    </div>
                  )}
                />
              </PieChart>
            ) : (
              <Treemap
                data={filteredData}
                dataKey="value"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#8884d8"
                onClick={handleClick}
                className="cursor-pointer"
              >
                <Tooltip content={<TreemapTooltip />} />
              </Treemap>
            )}
          </ResponsiveContainer>
        </div>

        {/* Statistiques détaillées */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Postes visibles</p>
              <p className="font-semibold">{filteredData.length}/{data.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total visible</p>
              <p className="font-semibold">{totalVisible.toFixed(1)} tCO₂e</p>
            </div>
            <div>
              <p className="text-muted-foreground">Poste principal</p>
              <p className="font-semibold">
                {filteredData.length > 0 
                  ? filteredData.reduce((max, item) => item.value > max.value ? item : max).name
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Concentration</p>
              <p className="font-semibold">
                {filteredData.length > 0 
                  ? `${((filteredData.reduce((max, item) => item.value > max.value ? item : max).value / totalVisible) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};