import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Award, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SECTOR_BENCHMARKS = {
  manufacturing: {
    name: "Industrie manufacturière",
    benchmark: 2.5,
    topPerformers: 1.2,
    threshold: 3.0,
    regulations: ["CSRD", "CBAM"]
  },
  services: {
    name: "Services",
    benchmark: 0.8,
    topPerformers: 0.4,
    threshold: 1.2,
    regulations: ["CSRD"]
  },
  retail: {
    name: "Commerce de détail",
    benchmark: 1.8,
    topPerformers: 0.9,
    threshold: 2.2,
    regulations: ["CSRD", "Loi AGEC"]
  },
  transport: {
    name: "Transport et logistique",
    benchmark: 4.2,
    topPerformers: 2.8,
    threshold: 5.0,
    regulations: ["CSRD", "CBAM", "ZFE"]
  },
  construction: {
    name: "BTP",
    benchmark: 3.8,
    topPerformers: 2.1,
    threshold: 4.5,
    regulations: ["CSRD", "RE2020"]
  },
  agriculture: {
    name: "Agriculture",
    benchmark: 5.5,
    topPerformers: 3.2,
    threshold: 7.0,
    regulations: ["PAC verte", "CSRD"]
  },
  technology: {
    name: "Technologies",
    benchmark: 0.6,
    topPerformers: 0.2,
    threshold: 0.9,
    regulations: ["CSRD", "RGPD énergétique"]
  }
};

interface SectorBasedScoringProps {
  totalEmissions: number; // en kg CO2e
  sector?: string;
  onSectorChange?: (sector: string) => void;
}

export const SectorBasedScoring: React.FC<SectorBasedScoringProps> = ({ 
  totalEmissions, 
  sector = "services",
  onSectorChange 
}) => {
  const [selectedSector, setSelectedSector] = useState(sector);
  
  const sectorData = SECTOR_BENCHMARKS[selectedSector as keyof typeof SECTOR_BENCHMARKS];
  const emissionsTonnes = totalEmissions / 1000;
  
  const calculateESGScore = () => {
    const { benchmark, topPerformers } = sectorData;
    
    if (emissionsTonnes <= topPerformers) return { score: 95, grade: "A+", color: "text-green-600" };
    if (emissionsTonnes <= benchmark * 0.8) return { score: 85, grade: "A", color: "text-green-500" };
    if (emissionsTonnes <= benchmark) return { score: 70, grade: "B+", color: "text-blue-500" };
    if (emissionsTonnes <= benchmark * 1.2) return { score: 60, grade: "B", color: "text-orange-500" };
    if (emissionsTonnes <= benchmark * 1.5) return { score: 45, grade: "C", color: "text-orange-600" };
    return { score: 25, grade: "D", color: "text-red-600" };
  };
  
  const esgResult = calculateESGScore();
  
  const handleSectorChange = (newSector: string) => {
    setSelectedSector(newSector);
    onSectorChange?.(newSector);
  };
  
  return (
    <Card className="p-6 bg-gradient-to-br from-accent/5 to-secondary/10 border border-accent/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Building className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Scoring ESG Sectoriel</h3>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Info className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Comprendre le Score ESG</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Le score ESG (Environnemental, Social, Gouvernance) évalue votre performance environnementale 
                par rapport aux entreprises de votre secteur d'activité.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Grilles de notation :</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">A+ (90-100)</span>
                      <span>Excellence environnementale</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-500 font-medium">B+ (70-89)</span>
                      <span>Performance supérieure</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500 font-medium">C (50-69)</span>
                      <span>Performance moyenne</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600 font-medium">D (&lt;50)</span>
                      <span>Amélioration requise</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Réglementations applicables :</h4>
                  <div className="space-y-1">
                    {sectorData.regulations.map((reg, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reg}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Méthodologie :</h4>
                <p className="text-sm text-muted-foreground">
                  Le score est calculé en comparant vos émissions aux moyennes sectorielles établies par l'ADEME 
                  et les standards internationaux (GRI, TCFD). Il prend en compte les spécificités de votre activité.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Secteur d'activité
          </label>
          <Select value={selectedSector} onValueChange={handleSectorChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SECTOR_BENCHMARKS).map(([key, sector]) => (
                <SelectItem key={key} value={key}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-background/50">
            <div className="flex items-center space-x-3">
              <Award className={`w-8 h-8 ${esgResult.color}`} />
              <div>
                <div className={`text-3xl font-bold ${esgResult.color}`}>
                  {esgResult.grade}
                </div>
                <div className="text-sm text-muted-foreground">Score ESG</div>
                <div className="text-xs text-muted-foreground">
                  {esgResult.score}/100
                </div>
              </div>
            </div>
          </Card>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vos émissions</span>
              <span className="font-medium">{emissionsTonnes.toFixed(2)} tCO2e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Moyenne sectorielle</span>
              <span className="font-medium">{sectorData.benchmark} tCO2e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Top 10%</span>
              <span className="font-medium">{sectorData.topPerformers} tCO2e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Seuil critique</span>
              <span className="font-medium text-destructive">{sectorData.threshold} tCO2e</span>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Réglementations applicables :</h4>
          <div className="flex flex-wrap gap-2">
            {sectorData.regulations.map((regulation, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {regulation}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};