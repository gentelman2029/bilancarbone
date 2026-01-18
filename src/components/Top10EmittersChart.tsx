import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmitterData {
  name: string;
  value: number;
  emissions: number;
  percentage: number;
  scope: "scope1" | "scope2" | "scope3";
  color: string;
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

  // Récupérer les données réelles du calculateur
  const getTop10Emitters = (): EmitterData[] => {
    const savedSectionDetails = localStorage.getItem('calculation-section-details');
    
    let allEmitters: { name: string; emissions: number; scope: "scope1" | "scope2" | "scope3" }[] = [];
    
    if (savedSectionDetails) {
      try {
        const sectionDetails = JSON.parse(savedSectionDetails);
        
        // Scope 1
        (sectionDetails.scope1 || []).forEach((detail: any) => {
          const sourceName = detail.description || 'Autre Scope 1';
          allEmitters.push({
            name: sourceName,
            emissions: detail.emissions || 0,
            scope: "scope1"
          });
        });
        
        // Scope 2
        (sectionDetails.scope2 || []).forEach((detail: any) => {
          const sourceName = detail.description || 'Autre Scope 2';
          allEmitters.push({
            name: sourceName,
            emissions: detail.emissions || 0,
            scope: "scope2"
          });
        });
        
        // Scope 3
        (sectionDetails.scope3 || []).forEach((detail: any) => {
          const sourceName = detail.description || 'Autre Scope 3';
          allEmitters.push({
            name: sourceName,
            emissions: detail.emissions || 0,
            scope: "scope3"
          });
        });
      } catch (e) {
        console.error('Erreur parsing sectionDetails:', e);
      }
    }

    // Si pas de données réelles, utiliser des exemples
    if (allEmitters.length === 0) {
      const total = totalEmissions > 0 ? totalEmissions : 168510; // Valeur par défaut
      allEmitters = [
        { name: "Essence véhicules", emissions: total * 0.686, scope: "scope1" },
        { name: "Électricité bureaux", emissions: total * 0.089, scope: "scope2" },
        { name: "Gaz naturel chauffage", emissions: total * 0.065, scope: "scope1" },
        { name: "Achats matières premières", emissions: total * 0.045, scope: "scope3" },
        { name: "Transport marchandises", emissions: total * 0.038, scope: "scope3" },
        { name: "Déplacements professionnels", emissions: total * 0.032, scope: "scope3" },
        { name: "Climatisation R-410A", emissions: total * 0.018, scope: "scope1" },
        { name: "Réseau de chaleur", emissions: total * 0.012, scope: "scope2" },
        { name: "Déchets production", emissions: total * 0.009, scope: "scope3" },
        { name: "Numérique & IT", emissions: total * 0.006, scope: "scope3" }
      ];
    }

    // Agréger par nom (au cas où il y aurait des doublons)
    const aggregated: { [key: string]: { emissions: number; scope: "scope1" | "scope2" | "scope3" } } = {};
    allEmitters.forEach(item => {
      if (!aggregated[item.name]) {
        aggregated[item.name] = { emissions: 0, scope: item.scope };
      }
      aggregated[item.name].emissions += item.emissions;
    });

    // Convertir et trier
    const sorted = Object.entries(aggregated)
      .map(([name, data]) => ({
        name,
        emissions: data.emissions,
        scope: data.scope
      }))
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 10);

    // Calculer le total pour les pourcentages
    const total = sorted.reduce((sum, item) => sum + item.emissions, 0);

    // Formater pour le graphique
    return sorted.map(item => ({
      name: item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name,
      fullName: item.name,
      value: item.emissions / 1000, // Convertir en tonnes
      emissions: item.emissions,
      percentage: total > 0 ? (item.emissions / total) * 100 : 0,
      scope: item.scope,
      color: SCOPE_COLORS[item.scope]
    })) as EmitterData[];
  };

  const data = getTop10Emitters();
  const totalTonnes = totalEmissions > 0 ? totalEmissions / 1000 : data.reduce((sum, item) => sum + item.value, 0);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentOfTotal = totalTonnes > 0 ? (item.value / totalTonnes) * 100 : 0;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{item.fullName || item.name}</p>
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
  const topPercentage = topEmitter ? (topEmitter.value / totalTonnes * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 10 des Postes les plus Émetteurs
          </CardTitle>
          <div className="flex gap-2">
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
                "{topEmitter.name}" représente {topPercentage.toFixed(1)}% des émissions totales.
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
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)}`}
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
                width={150}
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

        {/* Légende avec statistiques */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: SCOPE_COLORS.scope1 }}>
                {data.filter(d => d.scope === 'scope1').reduce((sum, d) => sum + d.value, 0).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e Scope 1</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: SCOPE_COLORS.scope2 }}>
                {data.filter(d => d.scope === 'scope2').reduce((sum, d) => sum + d.value, 0).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e Scope 2</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: SCOPE_COLORS.scope3 }}>
                {data.filter(d => d.scope === 'scope3').reduce((sum, d) => sum + d.value, 0).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e Scope 3</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
