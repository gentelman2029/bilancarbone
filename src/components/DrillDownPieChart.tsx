import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { ChevronRight, Home, ZoomIn } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DrillDownData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  children?: DrillDownData[];
}

interface DrillDownPieChartProps {
  data: DrillDownData[];
  title: string;
  onDrillDown?: (item: DrillDownData) => void;
}

// Custom active shape for hover effect
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300 ease-out"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        className="transition-all duration-300 ease-out"
      />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        className="text-sm font-semibold"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 15}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export const DrillDownPieChart = ({ data, title, onDrillDown }: DrillDownPieChartProps) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [drillPath, setDrillPath] = useState<DrillDownData[]>([]);
  const [currentData, setCurrentData] = useState<DrillDownData[]>(data);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset when data changes externally
  useEffect(() => {
    if (drillPath.length === 0) {
      setCurrentData(data);
    }
  }, [data, drillPath.length]);

  const handlePieClick = (entry: DrillDownData, index: number) => {
    if (entry.children && entry.children.length > 0) {
      setIsAnimating(true);
      
      // Animation out
      setTimeout(() => {
        setDrillPath([...drillPath, entry]);
        setCurrentData(entry.children!);
        setActiveIndex(undefined);
        
        // Animation in
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
        // Return to root
        setDrillPath([]);
        setCurrentData(data);
      } else {
        // Navigate to specific level
        const newPath = drillPath.slice(0, index + 1);
        setDrillPath(newPath);
        if (index >= 0 && drillPath[index]?.children) {
          setCurrentData(drillPath[index].children!);
        }
      }
      setActiveIndex(undefined);
      
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
      setActiveIndex(undefined);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 200);
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg animate-fade-in">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value.toFixed(2)} tCO₂e ({item.percentage.toFixed(1)}%)
          </p>
          {item.children && item.children.length > 0 && (
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <ZoomIn className="w-3 h-3" />
              Cliquez pour voir le détail
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const totalVisible = currentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="ml-auto text-xs">
            {t("dashboard.clickable")}
          </Badge>
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
                  {item.name}
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
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={(_, index) => handlePieClick(currentData[index], index)}
                className="cursor-pointer"
                animationBegin={0}
                animationDuration={500}
                animationEasing="ease-out"
              >
                {currentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-all duration-200 hover:opacity-90"
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                      cursor: entry.children && entry.children.length > 0 ? 'pointer' : 'default'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with drill-down indicators */}
        <div className={`flex flex-wrap gap-2 mt-4 transition-all duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}>
          {currentData.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-2 p-1.5 rounded-md transition-all duration-200 ${
                item.children && item.children.length > 0 
                  ? 'cursor-pointer hover:bg-muted' 
                  : ''
              }`}
              onClick={() => item.children && item.children.length > 0 && handlePieClick(item, index)}
            >
              <div 
                className="w-3 h-3 rounded-full transition-transform duration-200" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">
                {item.name}: {item.percentage.toFixed(1)}%
              </span>
              {item.children && item.children.length > 0 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className={`mt-4 p-3 bg-muted/50 rounded-lg transition-all duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {drillPath.length > 0 ? `Niveau: ${drillPath.length + 1}` : 'Vue globale'}
            </span>
            <span className="font-medium">
              Total: {totalVisible.toFixed(1)} tCO₂e
            </span>
          </div>
          {drillPath.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleReset}
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à la vue globale
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
