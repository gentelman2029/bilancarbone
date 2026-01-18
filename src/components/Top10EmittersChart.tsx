import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

interface EmitterData {
  name: string;
  fullName: string;
  value: number;
  emissions: number;
  percentage: number;
  scope: "scope1" | "scope2" | "scope3";
  color: string;
}

interface ScopeTotals {
  scope1: number;
  scope2: number;
  scope3: number;
}

interface Top10EmittersChartProps {
  totalEmissions: number; // Total en kg CO2e
}

// Couleurs par scope
const SCOPE_COLORS = {
  scope1: "#ef4444", // Rouge
  scope2: "#f97316", // Orange  
  scope3: "#3b82f6"  // Bleu
};

const SCOPE_LABELS = {
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3: "Scope 3"
};

export const Top10EmittersChart = ({ totalEmissions }: Top10EmittersChartProps) => {
  const { t } = useTranslation();

  // Récupérer toutes les données du calculateur (Scope 1, 2, 3 et module avancé Scope 3)
  const { data, scopeTotals, actualTotalEmissions } = useMemo(() => {
    let allEmitters: { name: string; emissions: number; scope: "scope1" | "scope2" | "scope3" }[] = [];
    
    // 1. Récupérer les données de calculation-section-details (Scope 1, 2, 3 basique)
    const savedSectionDetails = localStorage.getItem('calculation-section-details');
    
    if (savedSectionDetails) {
      try {
        const sectionDetails = JSON.parse(savedSectionDetails);
        
        // Scope 1 - Émissions directes
        (sectionDetails.scope1 || []).forEach((detail: any) => {
          const sourceName = detail.description || detail.type || 'Source Scope 1';
          if (detail.emissions && detail.emissions > 0) {
            allEmitters.push({
              name: sourceName,
              emissions: detail.emissions,
              scope: "scope1"
            });
          }
        });
        
        // Scope 2 - Émissions indirectes énergie
        (sectionDetails.scope2 || []).forEach((detail: any) => {
          const sourceName = detail.description || detail.type || 'Source Scope 2';
          if (detail.emissions && detail.emissions > 0) {
            allEmitters.push({
              name: sourceName,
              emissions: detail.emissions,
              scope: "scope2"
            });
          }
        });
        
        // Scope 3 basique (hors module avancé)
        (sectionDetails.scope3 || []).forEach((detail: any) => {
          const sourceName = detail.description || detail.type || 'Source Scope 3';
          if (detail.emissions && detail.emissions > 0) {
            allEmitters.push({
              name: sourceName,
              emissions: detail.emissions,
              scope: "scope3"
            });
          }
        });
      } catch (e) {
        console.error('Erreur parsing calculation-section-details:', e);
      }
    }

    // 2. Récupérer les données du module avancé Scope 3 (15 catégories GHG Protocol)
    const isAdvancedMode = localStorage.getItem('calculator-advanced-mode');
    const advancedModeEnabled = isAdvancedMode ? JSON.parse(isAdvancedMode) : false;
    
    if (advancedModeEnabled) {
      const scope3Advanced = localStorage.getItem('scope3-advanced-calculations');
      if (scope3Advanced) {
        try {
          const advCalcs = JSON.parse(scope3Advanced);
          advCalcs.forEach((calc: any) => {
            // Utiliser le nom de catégorie ou subcatégorie pour l'affichage
            const categoryName = calc.categoryName || calc.subcategoryName || calc.description || 'Catégorie Scope 3';
            if (calc.emissions && calc.emissions > 0) {
              allEmitters.push({
                name: categoryName,
                emissions: calc.emissions,
                scope: "scope3"
              });
            }
          });
        } catch (e) {
          console.error('Erreur parsing scope3-advanced-calculations:', e);
        }
      }
    }

    // Si pas de données réelles, utiliser des exemples pour la démo
    if (allEmitters.length === 0) {
      const total = totalEmissions > 0 ? totalEmissions : 168510;
      allEmitters = [
        { name: "Essence", emissions: total * 0.686, scope: "scope1" },
        { name: "Électricité", emissions: total * 0.089, scope: "scope2" },
        { name: "Gaz naturel", emissions: total * 0.065, scope: "scope1" },
        { name: "Achats de biens et services", emissions: total * 0.045, scope: "scope3" },
        { name: "Transport amont", emissions: total * 0.038, scope: "scope3" },
        { name: "Déplacements professionnels", emissions: total * 0.032, scope: "scope3" },
        { name: "Fluides frigorigènes", emissions: total * 0.018, scope: "scope1" },
        { name: "Réseau de chaleur", emissions: total * 0.012, scope: "scope2" },
        { name: "Déchets générés", emissions: total * 0.009, scope: "scope3" },
        { name: "Déplacements domicile-travail", emissions: total * 0.006, scope: "scope3" }
      ];
    }

    // Agréger par nom (au cas où il y aurait des doublons)
    const aggregated: { [key: string]: { emissions: number; scope: "scope1" | "scope2" | "scope3" } } = {};
    allEmitters.forEach(item => {
      const key = `${item.name}_${item.scope}`; // Clé unique par nom ET scope
      if (!aggregated[key]) {
        aggregated[key] = { emissions: 0, scope: item.scope };
      }
      aggregated[key].emissions += item.emissions;
    });

    // Convertir et trier - Top 10
    const sorted = Object.entries(aggregated)
      .map(([key, data]) => {
        const name = key.replace(/_scope[123]$/, '');
        return {
          name,
          emissions: data.emissions,
          scope: data.scope
        };
      })
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 10);

    // Calculer les totaux RÉELS par scope (pas seulement du Top 10)
    const scopeTotals: ScopeTotals = { scope1: 0, scope2: 0, scope3: 0 };
    allEmitters.forEach(item => {
      scopeTotals[item.scope] += item.emissions;
    });

    // Total réel des émissions
    const actualTotal = scopeTotals.scope1 + scopeTotals.scope2 + scopeTotals.scope3;

    // Formater pour le graphique
    const formattedData: EmitterData[] = sorted.map(item => ({
      name: item.name.length > 28 ? item.name.substring(0, 25) + '...' : item.name,
      fullName: item.name,
      value: item.emissions / 1000, // Convertir en tonnes
      emissions: item.emissions,
      percentage: actualTotal > 0 ? (item.emissions / actualTotal) * 100 : 0,
      scope: item.scope,
      color: SCOPE_COLORS[item.scope]
    }));

    return { 
      data: formattedData, 
      scopeTotals,
      actualTotalEmissions: actualTotal
    };
  }, [totalEmissions]);

  const totalTonnes = actualTotalEmissions > 0 ? actualTotalEmissions / 1000 : 0;

  // Calculer le domaine dynamique de l'axe X
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 10;
  const xAxisDomain = [0, Math.ceil(maxValue * 1.1)]; // +10% de marge

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentOfTotal = totalTonnes > 0 ? (item.value / totalTonnes) * 100 : 0;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{item.fullName}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{SCOPE_LABELS[item.scope as keyof typeof SCOPE_LABELS]}</span>
            </div>
            <p className="font-medium">
              <span className="text-foreground">{item.value.toFixed(2)} tCO₂e</span>
            </p>
            <p className="text-muted-foreground">
              {percentOfTotal.toFixed(1)}% du total ({totalTonnes.toFixed(2)} tCO₂e)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Trouver le poste le plus émetteur pour le message d'alerte
  const topEmitter = data[0];
  const topPercentage = topEmitter && totalTonnes > 0 ? (topEmitter.value / totalTonnes * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 10 des Postes les plus Émetteurs
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs flex items-center gap-1" style={{ borderColor: SCOPE_COLORS.scope1, color: SCOPE_COLORS.scope1 }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SCOPE_COLORS.scope1 }} />
              Scope 1
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1" style={{ borderColor: SCOPE_COLORS.scope2, color: SCOPE_COLORS.scope2 }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SCOPE_COLORS.scope2 }} />
              Scope 2
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1" style={{ borderColor: SCOPE_COLORS.scope3, color: SCOPE_COLORS.scope3 }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SCOPE_COLORS.scope3 }} />
              Scope 3
            </Badge>
          </div>
        </div>
        
        {/* Alerte sur le poste prioritaire */}
        {topEmitter && topPercentage > 30 && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-destructive">Priorité d'intervention :</span>
              <span className="text-foreground ml-1">
                "{topEmitter.fullName}" représente {topPercentage.toFixed(1)}% des émissions totales.
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={xAxisDomain}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value >= 100 ? `${value.toFixed(0)}` : `${value.toFixed(1)}`}
                label={{ 
                  value: 'tCO₂e', 
                  position: 'insideBottomRight', 
                  offset: -5,
                  fontSize: 11
                }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                width={160}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Légende avec TOTAUX RÉELS par scope (pas seulement Top 10) */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: SCOPE_COLORS.scope1 }}>
                {(scopeTotals.scope1 / 1000).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e Scope 1</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: SCOPE_COLORS.scope2 }}>
                {(scopeTotals.scope2 / 1000).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e Scope 2</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: SCOPE_COLORS.scope3 }}>
                {(scopeTotals.scope3 / 1000).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e Scope 3</div>
            </div>
          </div>
          
          {/* Total général */}
          <div className="mt-3 pt-3 border-t border-border/50 text-center">
            <div className="text-lg font-semibold text-foreground">
              Total : {totalTonnes.toFixed(2)} tCO₂e
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
