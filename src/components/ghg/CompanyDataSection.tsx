import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";

interface CompanyData {
  chiffreAffaires: number;
  nombrePersonnels: number;
  emissionsAnneePrecedente: number;
  objectifSBTI: number;
  objectifsSBTParAnnee: Record<string, number>;
  emissionsReelles: number;
  moyenneSectorielle: number;
  leadersSecteur: number;
  positionClassement: number;
  benchmarkSectorName: string;
  benchmarkSectorAverage: number;
  benchmarkSectorTop10: number;
  benchmarkSectorCritical: number;
}

interface CompanyDataSectionProps {
  data: CompanyData;
  totalGlobal: number;
  onChange: (updates: Partial<CompanyData>) => void;
}

export const CompanyDataSection: React.FC<CompanyDataSectionProps> = ({ data, totalGlobal, onChange }) => {
  const sbtYears = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div>
      {/* Données d'entreprise */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="text-center space-y-2">
            <div className="text-lg text-muted-foreground mb-2">Nombre de personnels</div>
            <div className="flex items-center justify-center gap-2">
              <Input
                type="number"
                min="1"
                value={data.nombrePersonnels}
                onChange={(e) => onChange({ nombrePersonnels: Math.max(1, Number(e.target.value) || 1) })}
                className="w-24 text-center text-2xl font-bold"
              />
              <span className="text-lg font-medium">pers.</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center space-y-2">
            <div className="text-lg text-muted-foreground mb-2">Émissions année précédente (2024)</div>
            <div className="flex items-center justify-center gap-2">
              <Input
                type="number"
                min="0"
                value={data.emissionsAnneePrecedente}
                onChange={(e) => onChange({ emissionsAnneePrecedente: Math.max(0, Number(e.target.value) || 0) })}
                className="w-24 text-center text-2xl font-bold"
                step="0.1"
              />
              <span className="text-lg font-medium">tCO2e</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center space-y-2">
            <div className="text-lg text-muted-foreground mb-2">Émissions Réelles (2025)</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-primary">
                {(totalGlobal / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-lg font-medium">tCO₂e</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Calculé automatiquement (Scope 1 + 2 + 3)
            </p>
          </div>
        </Card>
      </div>

      {/* Objectifs SBT par année */}
      <Card className="p-6 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Objectifs Science Based Targets (SBT) par année</CardTitle>
          <CardDescription>
            Définissez vos objectifs de réduction d'émissions alignés SBT pour chaque année
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sbtYears.map(year => (
              <div key={year} className="text-center space-y-1">
                <Label className="text-sm font-medium">{year}</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    value={data.objectifsSBTParAnnee[year] || ''}
                    onChange={(e) => {
                      const newObjectifs = { ...data.objectifsSBTParAnnee };
                      if (e.target.value === '') {
                        delete newObjectifs[year];
                      } else {
                        newObjectifs[year] = Math.max(0, Number(e.target.value) || 0);
                      }
                      onChange({ objectifsSBTParAnnee: newObjectifs });
                    }}
                    className="text-center"
                    step="0.1"
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">tCO2e</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benchmarks Sectoriels (ESG) */}
      <Card className="p-6 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Benchmarks Sectoriels (ESG)</CardTitle>
          <CardDescription>
            Valeurs de référence par employé pour le widget "Benchmark Sectoriel"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Moyenne sectorielle</div>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={data.moyenneSectorielle}
                  onChange={(e) => onChange({ moyenneSectorielle: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-24 text-center text-xl font-bold"
                  step="0.1"
                  placeholder="0.0"
                />
                <span className="text-lg font-medium">tCO2e/employé</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Leaders du secteur</div>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={data.leadersSecteur}
                  onChange={(e) => onChange({ leadersSecteur: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-24 text-center text-xl font-bold"
                  step="0.1"
                  placeholder="0.0"
                />
                <span className="text-lg font-medium">tCO2e/employé</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Position (classement)</div>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={data.positionClassement}
                  onChange={(e) => onChange({ positionClassement: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-24 text-center text-xl font-bold"
                  placeholder="0"
                />
                <span className="text-lg font-medium">ème</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyse Comparative Sectorielle */}
      <Card className="p-6 mb-6 border-primary/30 bg-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Benchmarks pour l'Analyse Comparative Sectorielle
          </CardTitle>
          <CardDescription>
            Ces valeurs alimentent le graphique "Analyse Comparative Sectorielle" du Tableau de Bord (intensité carbone en tCO₂e/k€)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Secteur d'activité</Label>
            <Input
              type="text"
              value={data.benchmarkSectorName}
              onChange={(e) => onChange({ benchmarkSectorName: e.target.value })}
              className="max-w-md"
              placeholder="Ex: Services, Industrie manufacturière, Transport..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Moyenne sectorielle</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={data.benchmarkSectorAverage || ''}
                  onChange={(e) => onChange({ benchmarkSectorAverage: Math.max(0, Number(e.target.value) || 0) })}
                  className="text-center text-lg font-bold"
                  step="0.1"
                  placeholder="12.5"
                />
                <span className="text-sm font-medium whitespace-nowrap">tCO₂e/k€</span>
              </div>
              <p className="text-xs text-muted-foreground">Intensité carbone moyenne du secteur</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Seuil Top 10 (Best-in-class)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={data.benchmarkSectorTop10 || ''}
                  onChange={(e) => onChange({ benchmarkSectorTop10: Math.max(0, Number(e.target.value) || 0) })}
                  className="text-center text-lg font-bold"
                  step="0.1"
                  placeholder="6.2"
                />
                <span className="text-sm font-medium whitespace-nowrap">tCO₂e/k€</span>
              </div>
              <p className="text-xs text-muted-foreground">Objectif d'excellence sectorielle</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Seuil critique</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={data.benchmarkSectorCritical || ''}
                  onChange={(e) => onChange({ benchmarkSectorCritical: Math.max(0, Number(e.target.value) || 0) })}
                  className="text-center text-lg font-bold"
                  step="0.1"
                  placeholder="20.0"
                />
                <span className="text-sm font-medium whitespace-nowrap">tCO₂e/k€</span>
              </div>
              <p className="text-xs text-muted-foreground">Au-delà : performance critique</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
