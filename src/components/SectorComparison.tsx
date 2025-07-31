import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, TrendingUp, TrendingDown, Minus, Award, Edit3, BarChart3, Filter, AlertTriangle, Target, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  
  // États pour les filtres
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedScope, setSelectedScope] = useState<string>("total");
  const [selectedSize, setSelectedSize] = useState<string>("toutes");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [showChart, setShowChart] = useState<boolean>(true);
  
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

  // Filtrer les secteurs selon la sélection
  const getFilteredSectors = () => {
    if (selectedSector === 'all') {
      return Object.entries(SECTOR_BENCHMARKS);
    }
    return Object.entries(SECTOR_BENCHMARKS).filter(([key]) => key === selectedSector);
  };

  // Générer les données pour le graphique
  const getChartData = () => {
    const sectors = selectedSector === 'all' ? Object.entries(SECTOR_BENCHMARKS).slice(0, 5) : getFilteredSectors();
    
    return sectors.map(([key, sector]) => ({
      name: sector.name.replace(/\s+/g, '\n'),
      votre_performance: emissionsIntensity,
      moyenne_sectorielle: sector.average,
      top_10_percent: sector.topPerformers,
      seuil_critique: sector.threshold
    }));
  };

  // Interprétation dynamique
  const getDynamicInterpretation = () => {
    const allSectors = Object.values(SECTOR_BENCHMARKS);
    const excellentCount = allSectors.filter(s => emissionsIntensity <= s.topPerformers).length;
    const goodCount = allSectors.filter(s => emissionsIntensity <= s.average && emissionsIntensity > s.topPerformers).length;
    const averageCount = allSectors.filter(s => emissionsIntensity <= s.threshold && emissionsIntensity > s.average).length;
    const poorCount = allSectors.filter(s => emissionsIntensity > s.threshold).length;

    if (excellentCount >= 7) {
      return {
        level: 'excellent',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        title: 'Performance Exceptionnelle',
        message: 'Félicitations ! Votre performance carbone place votre entreprise parmi les leaders dans la plupart des secteurs. Maintenez ces excellents résultats et partagez vos bonnes pratiques.',
        color: 'border-green-200 bg-green-50'
      };
    } else if (goodCount >= 5) {
      return {
        level: 'good',
        icon: <Target className="w-5 h-5 text-blue-600" />,
        title: 'Bonne Performance',
        message: 'Votre entreprise montre une performance carbone solide. Identifiez les secteurs où vous pourriez encore améliorer vos résultats pour atteindre l\'excellence.',
        color: 'border-blue-200 bg-blue-50'
      };
    } else if (averageCount >= 4) {
      return {
        level: 'average',
        icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
        title: 'Performance Moyenne - À Améliorer',
        message: 'Il y a des opportunités significatives d\'amélioration. Concentrez-vous sur les secteurs les plus proches de votre activité et établissez un plan d\'action prioritaire.',
        color: 'border-orange-200 bg-orange-50'
      };
    } else {
      return {
        level: 'critical',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        title: 'Situation Critique - Action Urgente Requise',
        message: 'Votre empreinte carbone dépasse largement les moyennes sectorielles. Il est urgent de mettre en place un plan de réduction ambitieux. Nous recommandons un audit énergétique complet.',
        color: 'border-red-200 bg-red-50'
      };
    }
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

        {/* Filtres de comparaison */}
        <Card className="p-4 bg-background border border-muted">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-foreground">Filtres d'analyse</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Année</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Périmètre</Label>
              <Select value={selectedScope} onValueChange={setSelectedScope}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Scopes 1+2+3</SelectItem>
                  <SelectItem value="scope1">Scope 1 uniquement</SelectItem>
                  <SelectItem value="scope2">Scope 2 uniquement</SelectItem>
                  <SelectItem value="scope3">Scope 3 uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Taille entreprise</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toutes">Toutes tailles</SelectItem>
                  <SelectItem value="tpe">TPE (&lt;10 sal.)</SelectItem>
                  <SelectItem value="pme">PME (10-250 sal.)</SelectItem>
                  <SelectItem value="eti">ETI (250-5000 sal.)</SelectItem>
                  <SelectItem value="ge">GE (&gt;5000 sal.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Secteur</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous secteurs</SelectItem>
                  {Object.entries(SECTOR_BENCHMARKS).map(([key, sector]) => (
                    <SelectItem key={key} value={key}>{sector.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Interprétation dynamique des émissions */}
        <Alert className={`p-4 ${getDynamicInterpretation().color}`}>
          <div className="flex items-start gap-3">
            {getDynamicInterpretation().icon}
            <div>
              <AlertDescription>
                <h4 className="font-semibold mb-2">{getDynamicInterpretation().title}</h4>
                <p className="text-sm">{getDynamicInterpretation().message}</p>
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Toggle entre graphique et tableau */}
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-foreground">Analyse comparative</h4>
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            {showChart ? 'Afficher tableau' : 'Afficher graphique'}
          </button>
        </div>

        {/* Graphique interactif */}
        {showChart ? (
          <Card className="p-6 bg-background">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis 
                    label={{ value: 'tCO2e/k€ CA', angle: -90, position: 'insideLeft' }}
                    fontSize={12}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-foreground mb-2">{label?.replace('\n', ' ')}</p>
                            {payload.map((entry, index) => (
                              <p key={index} className="text-sm" style={{ color: entry.color }}>
                                {entry.name === 'votre_performance' ? 'Votre performance' :
                                 entry.name === 'moyenne_sectorielle' ? 'Moyenne sectorielle' :
                                 entry.name === 'top_10_percent' ? 'Top 10%' : 'Seuil critique'}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} tCO2e/k€
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="votre_performance" fill="#ef4444" name="Votre performance" />
                  <Bar dataKey="moyenne_sectorielle" fill="#3b82f6" name="Moyenne sectorielle" />
                  <Bar dataKey="top_10_percent" fill="#10b981" name="Top 10%" />
                  <Bar dataKey="seuil_critique" fill="#f59e0b" name="Seuil critique" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          /* Vue tableau détaillée */
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {getFilteredSectors().map(([key, _]) => {
                const analysis = getPerformanceVsSector(key);
                
                return (
                  <Card key={key} className={`p-4 border ${analysis.color} hover:shadow-lg transition-shadow`}>
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
                        <span>Top 10%</span>
                        <span>{analysis.sector.topPerformers.toFixed(2)} {analysis.sector.unit}</span>
                      </div>
                      
                      {/* Barre de progression améliorée */}
                      <div className="relative w-full bg-gray-200 rounded-full h-3 mt-2">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            analysis.status === 'excellent' ? 'bg-green-500' :
                            analysis.status === 'good' ? 'bg-blue-500' :
                            analysis.status === 'average' ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, Math.max(10, (emissionsIntensity / analysis.sector.threshold) * 100))}%` 
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white mix-blend-difference">
                            {Math.round((emissionsIntensity / analysis.sector.threshold) * 100)}%
                          </span>
                        </div>
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
        )}

        {/* Recommandations personnalisées */}
        <Card className="p-4 bg-accent/10 border border-accent/20">
          <h4 className="font-semibold text-foreground mb-2">💡 Recommandations personnalisées</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            {getDynamicInterpretation().level === 'excellent' ? (
              <>
                <p>✅ Votre performance est exemplaire ! Maintenez ces excellents résultats</p>
                <p>🎯 Partagez vos bonnes pratiques avec d'autres entreprises de votre secteur</p>
                <p>📈 Explorez des objectifs de neutralité carbone avancés</p>
              </>
            ) : getDynamicInterpretation().level === 'good' ? (
              <>
                <p>👍 Bonne performance, continuez sur cette voie</p>
                <p>🎯 Identifiez les secteurs où vous pourriez atteindre le niveau "excellent"</p>
                <p>📊 Établissez des objectifs de réduction de 15-25% supplémentaires</p>
              </>
            ) : getDynamicInterpretation().level === 'average' ? (
              <>
                <p>⚠️ Des améliorations sont nécessaires pour être compétitif</p>
                <p>🎯 Concentrez-vous sur les secteurs les plus proches de votre activité</p>
                <p>📋 Établissez un plan d'action prioritaire avec objectifs chiffrés</p>
              </>
            ) : (
              <>
                <p>🚨 Situation critique nécessitant une action immédiate</p>
                <p>🔍 Audit énergétique complet recommandé</p>
                <p>📞 Contactez un expert en transition énergétique</p>
              </>
            )}
          </div>
        </Card>
      </div>
    </Card>
  );
};