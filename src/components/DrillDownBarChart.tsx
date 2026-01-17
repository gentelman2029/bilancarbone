import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChevronRight, Home, ZoomIn, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DrillDownBarData {
  name: string;
  category: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  color?: string;
  children?: DrillDownBarData[];
}

interface DrillDownBarChartProps {
  data: DrillDownBarData[];
  title: string;
  onDrillDown?: (item: DrillDownBarData) => void;
}

export const DrillDownBarChart = ({ data, title, onDrillDown }: DrillDownBarChartProps) => {
  const { t } = useTranslation();
  const [drillPath, setDrillPath] = useState<DrillDownBarData[]>([]);
  const [currentData, setCurrentData] = useState<DrillDownBarData[]>(data);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Reset when data changes externally
  useEffect(() => {
    if (drillPath.length === 0) {
      setCurrentData(data);
    }
  }, [data, drillPath.length]);

  const handleBarClick = (entry: DrillDownBarData) => {
    if (entry.children && entry.children.length > 0) {
      setIsAnimating(true);
      
      setTimeout(() => {
        setDrillPath([...drillPath, entry]);
        setCurrentData(entry.children!);
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 200);
      
      if (onDrillDown) {
        onDrillDown(entry);
      }
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setIsAnimating(true);
    
    setTimeout(() => {
      if (index === -1) {
        setDrillPath([]);
        setCurrentData(data);
      } else {
        const newPath = drillPath.slice(0, index + 1);
        setDrillPath(newPath);
        if (index >= 0 && drillPath[index]?.children) {
          setCurrentData(drillPath[index].children!);
        }
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 200);
  };

  const handleReset = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      setDrillPath([]);
      setCurrentData(data);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 200);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const entry = currentData.find(d => d.category === label);
      const hasChildren = entry?.children && entry.children.length > 0;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg animate-fade-in">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
              <span className="font-medium">{item.value.toFixed(2)} tCO₂e</span>
            </p>
          ))}
          <p className="text-sm font-medium mt-2 pt-2 border-t border-border">
            Total: {payload.reduce((sum: number, item: any) => sum + item.value, 0).toFixed(2)} tCO₂e
          </p>
          {hasChildren && (
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <ZoomIn className="w-3 h-3" />
              Cliquez pour voir le détail
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, fill, payload } = props;
    const hasChildren = payload?.children && payload.children.length > 0;
    const isHovered = hoveredBar === payload?.category;
    
    return (
      <g 
        className={`transition-all duration-200 ${hasChildren ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => setHoveredBar(payload?.category)}
        onMouseLeave={() => setHoveredBar(null)}
        onClick={() => hasChildren && handleBarClick(payload)}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={2}
          className={`transition-all duration-200 ${isHovered ? 'brightness-110' : ''}`}
          style={{
            transform: isHovered ? 'scaleX(1.02)' : 'scaleX(1)',
            transformOrigin: 'center'
          }}
        />
        {hasChildren && isHovered && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            className="text-xs font-medium pointer-events-none"
          >
            ▶
          </text>
        )}
      </g>
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {title}
          <div className="flex gap-1 ml-auto">
            <Badge variant="destructive" className="text-xs">Scope 1</Badge>
            <Badge variant="secondary" className="text-xs">Scope 2</Badge>
            <Badge variant="outline" className="text-xs">Scope 3</Badge>
          </div>
        </CardTitle>
        
        {/* Breadcrumb Navigation */}
        {drillPath.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-2 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs hover:bg-muted"
              onClick={() => handleBreadcrumbClick(-1)}
            >
              <Home className="w-3 h-3 mr-1" />
              Vue globale
            </Button>
            {drillPath.map((item, index) => (
              <div key={index} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs hover:bg-muted ${
                    index === drillPath.length - 1 ? 'font-semibold text-primary' : ''
                  }`}
                  onClick={() => handleBreadcrumbClick(index)}
                  disabled={index === drillPath.length - 1}
                >
                  {item.category}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Chart Container with Animation */}
        <div 
          className={`h-80 transition-all duration-300 ease-out ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={currentData}
              onClick={(data) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  const entry = currentData.find(d => d.category === data.activeLabel);
                  if (entry && entry.children && entry.children.length > 0) {
                    handleBarClick(entry);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="scope1" 
                stackId="a" 
                fill="#ef4444" 
                name="Scope 1 - Émissions directes"
                animationDuration={500}
                animationEasing="ease-out"
              >
                {currentData.map((entry, index) => (
                  <Cell 
                    key={`cell-scope1-${index}`}
                    className={`transition-all duration-200 ${
                      entry.children && entry.children.length > 0 ? 'cursor-pointer' : ''
                    } ${hoveredBar === entry.category ? 'brightness-110' : ''}`}
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="scope2" 
                stackId="a" 
                fill="#f97316" 
                name="Scope 2 - Énergie indirecte"
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey="scope3" 
                stackId="a" 
                fill="#3b82f6" 
                name="Scope 3 - Autres indirectes"
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Legend with drill-down hints */}
        <div className={`flex flex-wrap gap-2 mt-4 transition-all duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}>
          {currentData.map((item, index) => (
            <Badge
              key={index}
              variant={item.children && item.children.length > 0 ? "default" : "secondary"}
              className={`text-xs ${
                item.children && item.children.length > 0 
                  ? 'cursor-pointer hover:scale-105 transition-transform' 
                  : ''
              }`}
              onClick={() => item.children && item.children.length > 0 && handleBarClick(item)}
            >
              {item.category}
              {item.children && item.children.length > 0 && (
                <ChevronRight className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>

        {/* Summary & Reset */}
        {drillPath.length > 0 && (
          <div className={`mt-4 p-3 bg-muted/50 rounded-lg transition-all duration-300 animate-fade-in ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Niveau: {drillPath.length + 1} • {currentData.length} sous-catégories
              </span>
              <span className="font-medium">
                Total: {currentData.reduce((sum, d) => sum + d.scope1 + d.scope2 + d.scope3, 0).toFixed(1)} tCO₂e
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleReset}
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à la vue globale
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
