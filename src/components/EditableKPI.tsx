import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Check, X } from "lucide-react";

interface EditableKPIProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  isEditable?: boolean;
  onUpdate?: (newValue: number) => void;
  color?: string;
}

export const EditableKPI: React.FC<EditableKPIProps> = ({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendValue,
  isEditable = false,
  onUpdate,
  color = 'text-primary'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && onUpdate) {
      onUpdate(numValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="relative group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${color}`} />
          {isEditable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-2xl font-bold h-8"
                type="number"
                step="0.01"
              />
              <span className="text-sm text-muted-foreground">{unit}</span>
              <Button size="sm" onClick={handleSave} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-baseline space-x-1">
              <div className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString('fr-FR', {
                  minimumFractionDigits: value < 10 ? 1 : 0,
                  maximumFractionDigits: value < 10 ? 1 : 0
                }) : value}
              </div>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          )}
          
          {trend && trendValue !== undefined && (
            <p className={`text-xs ${getTrendColor()} flex items-center`}>
              <span className="mr-1">{getTrendIcon()}</span>
              {Math.abs(trendValue)}% par rapport à l'année dernière
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};