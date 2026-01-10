import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Trash2, RotateCcw, FileText } from "lucide-react";
import { CalculationDetail } from "@/hooks/useCalculationDetails";

interface CalculationDetailsSectionProps {
  title: string;
  icon: React.ReactNode;
  details: CalculationDetail[];
  sectionColor: "destructive" | "default" | "secondary";
  onRemoveDetail: (detailId: string) => void;
  onClearSection: () => void;
  className?: string;
}

export const CalculationDetailsSection: React.FC<CalculationDetailsSectionProps> = ({
  title,
  icon,
  details,
  sectionColor,
  onRemoveDetail,
  onClearSection,
  className = ""
}) => {
  const totalEmissions = details.reduce((sum, detail) => sum + detail.emissions, 0);
  
  // Convertir en tonnes CO₂e (diviser par 1000)
  const formatEmissions = (kgValue: number) => (kgValue / 1000).toFixed(2);

  if (details.length === 0) {
    return null;
  }

  return (
    <Card className={`${className} border-l-4 ${
      sectionColor === 'destructive' ? 'border-l-red-500' : 
      sectionColor === 'default' ? 'border-l-blue-500' : 
      'border-l-green-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
            <Badge variant={sectionColor} className="ml-2">
              {details.length} calcul{details.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Section</div>
              <div className="text-lg font-bold text-primary">
                {formatEmissions(totalEmissions)} tCO₂e
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSection}
              className="text-orange-600 hover:text-orange-700"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {details.map((detail, index) => (
            <div key={detail.id}>
              <div className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{detail.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {detail.type}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-4">
                      <span>Quantité: <strong>{detail.quantity} {detail.unit}</strong></span>
                      <span>Facteur: <strong>{detail.emissionFactor} kg CO₂e/{detail.unit}</strong></span>
                    </div>
                    <div className="font-mono text-xs bg-background p-2 rounded border">
                      {detail.formuleDetail}
                    </div>
                    <div className="text-xs opacity-75">
                      Calculé le: {detail.timestamp}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                      {formatEmissions(detail.emissions)} tCO₂e
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDetail(detail.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {index < details.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
        
        {details.length > 1 && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Total {title}</span>
              </div>
              <div className="text-lg font-bold text-primary">
                {formatEmissions(totalEmissions)} tCO₂e
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};