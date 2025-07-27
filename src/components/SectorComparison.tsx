import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, TrendingUp, TrendingDown, Minus, Award, Edit3 } from "lucide-react";

const SECTOR_BENCHMARKS = {
  manufacturing: {
    name: "Industrie manufacturière",
    average: 2.5,
    topPerformers: 1.2,
    threshold: 3.0,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD", "CBAM"],
    description: "Production industrielle, assemblage, transformation"
  },
  services: {
    name: "Services",
    average: 0.8,
    topPerformers: 0.4,
    threshold: 1.2,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD"],
    description: "Conseil, IT, finance, immobilier"
  },
  retail: {
    name: "Commerce de détail",
    average: 1.8,
    topPerformers: 0.9,
    threshold: 2.2,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD", "Loi AGEC"],
    description: "Vente au détail, distribution"
  },
  transport: {
    name: "Transport et logistique",
    average: 4.2,
    topPerformers: 2.8,
    threshold: 5.0,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD", "CBAM", "ZFE"],
    description: "Transport de marchandises et personnes"
  },
  construction: {
    name: "BTP",
    average: 3.8,
    topPerformers: 2.1,
    threshold: 4.5,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD", "RE2020"],
    description: "Construction, rénovation, travaux publics"
  },
  agriculture: {
    name: "Agriculture",
    average: 5.5,
    topPerformers: 3.2,
    threshold: 7.0,
    unit: "tCO2e/k€ CA",
    regulations: ["PAC verte", "CSRD"],
    description: "Production agricole, élevage"
  },
  technology: {
    name: "Technologies",
    average: 0.6,
    topPerformers: 0.2,
    threshold: 0.9,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD", "RGPD énergétique"],
    description: "Logiciels, télécommunications, digital"
  },
  energy: {
    name: "Énergie",
    average: 6.8,
    topPerformers: 3.5,
    threshold: 8.5,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD", "CBAM", "Taxonomie UE"],
    description: "Production et distribution d'énergie"
  },
  healthcare: {
    name: "Santé",
    average: 1.2,
    topPerformers: 0.7,
    threshold: 1.6,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD"],
    description: "Établissements de santé, pharmaceutique"
  },
  education: {
    name: "Éducation",
    average: 0.9,
    topPerformers: 0.5,
    threshold: 1.3,
    unit: "tCO2e/k€ CA",
    regulations: ["CSRD"],
    description: "Établissements d'enseignement, formation"
  }
};

interface SectorComparisonProps {
  totalEmissions: number; // en kg CO2e
  annualRevenue?: number; // en k€
}

export const SectorComparison: React.FC<SectorComparisonProps> = ({ 
  totalEmissions,
  annualRevenue = 1000 // Valeur par défaut si non fournie
}) => {
  const [editableRevenue, setEditableRevenue] = useState<number>(annualRevenue);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const emissionsTonnes = totalEmissions / 1000;
  const emissionsIntensity = emissionsTonnes / editableRevenue; // tCO2e/k€ CA

  const handleRevenueChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditableRevenue(numValue);
  };

  const getPerformanceVsSector = (sectorKey: string) => {
    const sector = SECTOR_BENCHMARKS[sectorKey as keyof typeof SECTOR_BENCHMARKS];
    const difference = emissionsIntensity - sector.average;
    const percentageDiff = ((difference / sector.average) * 100);
    
    let status: 'excellent' | 'good' | 'average' | 'poor';
    let icon;
    let color;
    
    if (emissionsIntensity <= sector.topPerformers) {
      status = 'excellent';
      icon = <Award className="w-4 h-4" />;
      color = 'text-green-600 bg-green-50 border-green-200';
    } else if (emissionsIntensity <= sector.average) {
      status = 'good';
      icon = <TrendingDown className="w-4 h-4" />;
      color = 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (emissionsIntensity <= sector.threshold) {
      status = 'average';
      icon = <Minus className="w-4 h-4" />;
      color = 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      status = 'poor';
      icon = <TrendingUp className="w-4 h-4" />;
      color = 'text-red-600 bg-red-50 border-red-200';
    }

    return { difference, percentageDiff, status, icon, color, sector };
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Building className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Comparaison Sectorielle</h3>
            <p className="text-sm text-muted-foreground">
              Performance carbone vs moyennes sectorielles
            </p>
          </div>
        </div>

        {/* Métriques clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-background">
            <div className="text-2xl font-bold text-primary">{emissionsTonnes.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Total tCO2e</div>
          </Card>
          <Card className="p-4 text-center bg-background">
            <div className="text-2xl font-bold text-primary">{emissionsIntensity.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">tCO2e/k€ CA</div>
          </Card>
          <Card className="p-4 bg-background">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="revenue-input" className="text-sm text-muted-foreground">
                Chiffre d'affaires
              </Label>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <Edit3 className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  id="revenue-input"
                  type="number"
                  value={editableRevenue}
                  onChange={(e) => handleRevenueChange(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                  className="text-center font-bold text-primary"
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">k€</span>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{editableRevenue.toLocaleString()}k€</div>
              </div>
            )}
          </Card>
        </div>

        {/* Comparaisons sectorielles */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-foreground">Positionnement par secteur</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(SECTOR_BENCHMARKS).map(([key, _]) => {
              const analysis = getPerformanceVsSector(key);
              
              return (
                <Card key={key} className={`p-4 border ${analysis.color}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {analysis.icon}
                      <div>
                        <h5 className="font-semibold text-sm">{analysis.sector.name}</h5>
                        <p className="text-xs text-muted-foreground">{analysis.sector.description}</p>
                      </div>
                    </div>
                    <Badge 
                      className={`text-xs ${analysis.color.split(' ')[0]} ${analysis.color.split(' ')[1]} border-current`}
                    >
                      {analysis.percentageDiff > 0 ? '+' : ''}{analysis.percentageDiff.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Votre performance</span>
                      <span className="font-semibold">{emissionsIntensity.toFixed(2)} {analysis.sector.unit}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Moyenne sectorielle</span>
                      <span>{analysis.sector.average.toFixed(2)} {analysis.sector.unit}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Top performers</span>
                      <span>{analysis.sector.topPerformers.toFixed(2)} {analysis.sector.unit}</span>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          analysis.status === 'excellent' ? 'bg-green-500' :
                          analysis.status === 'good' ? 'bg-blue-500' :
                          analysis.status === 'average' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, Math.max(10, (emissionsIntensity / analysis.sector.threshold) * 100))}%` 
                        }}
                      ></div>
                    </div>
                    
                    {/* Réglementations */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {analysis.sector.regulations.map((reg, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recommandations */}
        <Card className="p-4 bg-accent/10 border border-accent/20">
          <h4 className="font-semibold text-foreground mb-2">💡 Recommandations</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Comparez-vous aux secteurs les plus proches de votre activité</p>
            <p>• Fixez des objectifs basés sur les top performers de votre secteur</p>
            <p>• Consultez les réglementations spécifiques à votre secteur</p>
            <p>• Explorez les meilleures pratiques des secteurs performants</p>
          </div>
        </Card>
      </div>
    </Card>
  );
};