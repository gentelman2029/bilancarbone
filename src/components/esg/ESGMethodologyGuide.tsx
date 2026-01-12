import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Calculator, 
  Scale, 
  Award,
  Leaf,
  Users,
  Building2,
  Info,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { BVMT_ESG_SCHEMA, ESG_GRADES } from '@/lib/esg/types';

// KPI Dictionary with legal references and descriptions
const KPI_DICTIONARY = [
  // Environment
  { id: 'E1', name: 'Consommation totale d\'énergie', reference: 'Guide BVMT Art. 3.1', unit: 'kWh', importance: 'Mesure la dépendance énergétique et le potentiel de transition vers les renouvelables.' },
  { id: 'E2', name: 'Intensité énergétique', reference: 'Guide BVMT Art. 3.2 / CSRD E1', unit: 'kWh/TND', importance: 'Indicateur clé d\'efficacité énergétique par unité de production économique.' },
  { id: 'E3', name: 'Part des énergies renouvelables', reference: 'Loi RSE 2018-35 Art. 12', unit: '%', importance: 'Évalue l\'engagement dans la transition énergétique tunisienne.' },
  { id: 'E4', name: 'Consommation totale d\'eau', reference: 'Plan National Eau 2050', unit: 'm³', importance: 'Critique en Tunisie face au stress hydrique. Priorité nationale.' },
  { id: 'E5', name: 'Taux de recyclage de l\'eau', reference: 'Loi RSE 2018-35 Art. 14', unit: '%', importance: 'Mesure l\'économie circulaire de l\'eau, essentiel en contexte de pénurie.' },
  { id: 'E6', name: 'Émissions Scope 1 (Directes)', reference: 'MACF / GHG Protocol', unit: 'tCO₂e', importance: 'Émissions directes soumises à la taxe carbone européenne (MACF).' },
  { id: 'E7', name: 'Émissions Scope 2 (Indirectes)', reference: 'MACF / GHG Protocol', unit: 'tCO₂e', importance: 'Émissions liées à l\'électricité achetée, impact indirect sur le climat.' },
  { id: 'E8', name: 'Intensité Carbone', reference: 'CSRD E1 / IFRS S2', unit: 'tCO₂e/M TND', importance: 'Indicateur d\'efficacité carbone exigé par les importateurs européens.' },
  { id: 'E9', name: 'Production totale de déchets', reference: 'Loi RSE 2018-35 Art. 16', unit: 'tonnes', importance: 'Évalue l\'impact environnemental et le potentiel de valorisation.' },
  { id: 'E10', name: 'Taux de valorisation des déchets', reference: 'Guide BVMT Art. 3.8', unit: '%', importance: 'Mesure l\'engagement dans l\'économie circulaire.' },
  { id: 'E11', name: 'Investissements Verts', reference: 'Circulaire BCT 2023-08', unit: 'TND', importance: 'Requis pour l\'accès aux crédits verts de la BCT.' },
  // Social
  { id: 'S1', name: 'Effectif total', reference: 'Loi RSE 2018-35 Art. 2', unit: 'employés', importance: 'Définit le périmètre d\'application de la loi RSE (>100 employés).' },
  { id: 'S2', name: 'Taux de féminisation', reference: 'Guide BVMT Art. 4.2', unit: '%', importance: 'Indicateur d\'égalité professionnelle et de diversité.' },
  { id: 'S3', name: 'Écart salarial H/F', reference: 'CSRD S1 / Code du Travail TN', unit: '%', importance: 'Mesure l\'équité de rémunération entre les genres.' },
  { id: 'S4', name: 'Taux de rotation (Turnover)', reference: 'Guide BVMT Art. 4.4', unit: '%', importance: 'Indicateur de stabilité de l\'emploi et de climat social.' },
  { id: 'S5', name: 'Taux d\'absentéisme', reference: 'Guide BVMT Art. 4.5', unit: '%', importance: 'Reflète la qualité de vie au travail et l\'engagement.' },
  { id: 'S6', name: 'Taux de fréquence accidents', reference: 'Code du Travail TN Art. 152', unit: 'ratio', importance: 'Mesure la sécurité au travail, obligation légale.' },
  { id: 'S7', name: 'Heures de formation par employé', reference: 'Loi RSE 2018-35 Art. 8', unit: 'heures', importance: 'Évalue l\'investissement dans le capital humain.' },
  { id: 'S8', name: 'Emploi personnes handicapées', reference: 'Loi 2005-83 Art. 30', unit: '%', importance: 'Obligation légale : 1% minimum pour >100 employés.' },
  { id: 'S9', name: 'Réunions partenaires sociaux', reference: 'Code du Travail TN', unit: 'nombre', importance: 'Qualité du dialogue social et gouvernance participative.' },
  { id: 'S10', name: 'Plaintes protection données', reference: 'Loi 2004-63 (INPDP)', unit: 'nombre', importance: 'Conformité à la protection des données personnelles.' },
  { id: 'S11', name: 'Fournisseurs charte éthique', reference: 'Guide BVMT Art. 4.11', unit: '%', importance: 'Responsabilité étendue à la chaîne d\'approvisionnement.' },
  { id: 'S12', name: 'Dépenses mécénat/RSE local', reference: 'Loi RSE 2018-35 Art. 20', unit: 'TND', importance: 'Contribution au développement local et à la communauté.' },
  // Governance
  { id: 'G1', name: 'Femmes au CA', reference: 'Guide BVMT Art. 5.1 / CMF', unit: '%', importance: 'Diversité au plus haut niveau de gouvernance.' },
  { id: 'G2', name: 'Administrateurs Indépendants', reference: 'Code Gouvernance BVMT', unit: '%', importance: 'Garantie d\'indépendance et de contrôle du CA.' },
  { id: 'G3', name: 'Dissociation Président/DG', reference: 'Code Gouvernance BVMT', unit: 'Oui/Non', importance: 'Best practice de séparation des pouvoirs.' },
  { id: 'G4', name: 'Comité RSE', reference: 'Loi RSE 2018-35 Art. 6', unit: 'Oui/Non', importance: 'Structure dédiée au pilotage de la stratégie RSE.' },
  { id: 'G5', name: 'Code Anti-corruption', reference: 'Loi 2017-10 Anti-corruption', unit: 'Oui/Non', importance: 'Obligation légale de prévention de la corruption.' },
  { id: 'G6', name: 'Impôts payés en Tunisie', reference: 'Code Fiscal TN', unit: 'TND', importance: 'Contribution fiscale et transparence financière.' },
  { id: 'G7', name: 'Politique rémunération publiée', reference: 'CSRD G1', unit: 'Oui/Non', importance: 'Transparence sur les rémunérations des dirigeants.' },
  { id: 'G8', name: 'Dispositif d\'alerte', reference: 'Loi 2017-10 Art. 38', unit: 'Oui/Non', importance: 'Protection des lanceurs d\'alerte, obligation légale.' },
  { id: 'G9', name: 'Fournisseurs locaux', reference: 'Guide BVMT Art. 5.9', unit: '%', importance: 'Soutien à l\'économie tunisienne et circuits courts.' },
];

// Formulas for calculated KPIs
const CALCULATED_KPI_FORMULAS = {
  E2: {
    name: 'Intensité Énergétique',
    formula: 'E1 / Chiffre d\'Affaires',
    explanation: 'Mesure l\'efficacité énergétique. Énergie consommée (kWh) divisée par le CA (TND). Un ratio plus bas indique une meilleure efficacité.',
    example: 'Si E1 = 500 000 kWh et CA = 10 000 000 TND → E2 = 0,05 kWh/TND'
  },
  E8: {
    name: 'Intensité Carbone',
    formula: '(E6 + E7) / (Chiffre d\'Affaires / 1 000 000)',
    explanation: 'Émissions totales (Scope 1 + Scope 2) par million de TND de CA. Indicateur clé pour le MACF européen.',
    example: 'Si E6 = 200 tCO₂e, E7 = 300 tCO₂e et CA = 10 M TND → E8 = 50 tCO₂e/M TND'
  }
};

export const ESGMethodologyGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Scoring Formula */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            Formule du Score Global ESG
          </CardTitle>
          <CardDescription>
            Méthodologie conforme au Guide BVMT et aux standards CSRD/IFRS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Formula */}
          <div className="p-6 bg-muted/50 rounded-lg border">
            <p className="text-center text-lg font-mono font-semibold mb-4">
              Score Global = (E × Poids_E) + (S × Poids_S) + (G × Poids_G)
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Où E = Score Environnement, S = Score Social, G = Score Gouvernance
            </p>
          </div>

          {/* Weighting Configuration Modes */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Configuration des Pondérations (3 Modes)
            </h4>

            {/* Mode Standard */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-emerald-600">Mode Standard</Badge>
                <span className="font-medium">Équipondéré</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Applique automatiquement une répartition égale entre les trois piliers :
              </p>
              <div className="p-3 bg-background rounded border font-mono text-sm">
                E = 33% | S = 33% | G = 33%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Usage :</strong> Recommandé pour les organisations débutant leur démarche ESG ou sans contrainte sectorielle spécifique.
              </p>
            </div>

            {/* Mode Sectoriel */}
            <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600">Mode Sectoriel</Badge>
                <span className="font-medium">Presets SASB/GRI</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Pondérations pré-configurées selon les enjeux de matérialité propres à chaque secteur d'activité :
              </p>
              <div className="grid gap-2">
                <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                  <span className="font-medium">🏦 Banque / Finance</span>
                  <span className="font-mono text-xs">E: 20% | S: 30% | G: 50%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                  <span className="font-medium">🏭 Industrie / Manufacturier</span>
                  <span className="font-mono text-xs">E: 50% | S: 30% | G: 20%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                  <span className="font-medium">👔 Textile / Habillement</span>
                  <span className="font-mono text-xs">E: 40% | S: 45% | G: 15%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                  <span className="font-medium">🌾 Agroalimentaire</span>
                  <span className="font-mono text-xs">E: 45% | S: 35% | G: 20%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Basé sur les standards SASB Materiality Map et GRI Sector Standards.
              </p>
            </div>

            {/* Mode Expert */}
            <div className="p-4 rounded-lg border bg-purple-500/10 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-600">Mode Expert</Badge>
                <span className="font-medium">Personnalisé</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Configuration libre via curseurs ou champs numériques pour adapter les pondérations à votre matrice de matérialité interne.
              </p>
              <div className="p-3 bg-background rounded border text-sm">
                <p className="mb-2"><strong>Contrainte technique :</strong> Le total des trois pondérations doit obligatoirement être égal à <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded text-red-700 dark:text-red-400">100%</span></p>
                <p className="text-xs text-muted-foreground">
                  Une alerte s'affiche en temps réel si le total est différent de 100%.
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Usage :</strong> Pour les entreprises ayant réalisé une analyse de double matérialité CSRD ou disposant d'études internes.
              </p>
            </div>
          </div>

          <Separator />

          {/* Pillar Description */}
          <div className="grid gap-4">
            <h4 className="font-medium flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Description des Piliers
            </h4>
            
            {/* Environment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-500/10">
                  <Leaf className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="font-medium">Environnement (E)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Énergie, eau, émissions carbone, déchets, investissements verts. Priorité renforcée pour le contexte tunisien (stress hydrique) et les exigences MACF.
              </p>
            </div>

            {/* Social */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-medium">Social (S)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Emploi, formation, santé-sécurité, égalité H/F, dialogue social. Conforme à la Loi RSE 2018-35 et au Code du Travail tunisien.
              </p>
            </div>

            {/* Governance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-purple-500/10">
                  <Building2 className="h-4 w-4 text-purple-500" />
                </div>
                <span className="font-medium">Gouvernance (G)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Composition du CA, éthique, anti-corruption, transparence fiscale. Aligné sur le Code de Gouvernance BVMT.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculated KPIs Formulas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Formules des KPIs Calculés
          </CardTitle>
          <CardDescription>
            Ces indicateurs sont calculés automatiquement à partir de vos données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(CALCULATED_KPI_FORMULAS).map(([id, kpi]) => (
            <div key={id} className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{id}</Badge>
                <span className="font-medium">{kpi.name}</span>
              </div>
              <div className="p-3 bg-background rounded border font-mono text-sm mb-2">
                {kpi.formula}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{kpi.explanation}</p>
              <p className="text-xs text-primary">
                <strong>Exemple :</strong> {kpi.example}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Grade Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Échelle des Grades ESG
          </CardTitle>
          <CardDescription>
            Correspondance entre les scores et les niveaux de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {/* Grade A (75-100) */}
            <div className="flex items-center gap-4 p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30">
              <div className="flex items-center gap-2 min-w-[120px]">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Grade A</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">75 - 100 points</span>
                  <Badge className="bg-emerald-600">Excellence</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Conforme aux standards d'exportation UE. Éligible aux crédits verts BCT et aux financements durables.
                </p>
              </div>
            </div>

            {/* Grade B (50-74) */}
            <div className="flex items-center gap-4 p-3 rounded-lg border bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-2 min-w-[120px]">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="font-bold text-amber-700 dark:text-amber-400">Grade B</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">50 - 74 points</span>
                  <Badge className="bg-amber-600">En transition</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Performance solide mais des améliorations sont nécessaires pour atteindre l'excellence.
                </p>
              </div>
            </div>

            {/* Grade C (<50) */}
            <div className="flex items-center gap-4 p-3 rounded-lg border bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-2 min-w-[120px]">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-bold text-red-700 dark:text-red-400">Grade C</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">&lt; 50 points</span>
                  <Badge variant="destructive">Action requise</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Risque de conformité élevé. Plan d'action urgent recommandé pour éviter les pénalités MACF.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Detailed grades */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {ESG_GRADES.map((g) => (
              <div 
                key={g.grade} 
                className="text-center p-2 rounded border"
                style={{ backgroundColor: `${g.color}20`, borderColor: `${g.color}40` }}
              >
                <div className="font-bold text-lg" style={{ color: g.color }}>{g.grade}</div>
                <div className="text-xs text-muted-foreground">{g.min}+</div>
                <div className="text-xs font-medium">{g.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Dictionary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Dictionnaire des 32 Indicateurs BVMT
          </CardTitle>
          <CardDescription>
            Référentiel complet avec les bases légales tunisiennes et internationales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {KPI_DICTIONARY.map((kpi, index) => {
                const category = kpi.id.charAt(0);
                const categoryColor = category === 'E' ? 'emerald' : category === 'S' ? 'blue' : 'purple';
                
                return (
                  <div 
                    key={kpi.id} 
                    className={`p-3 rounded-lg border bg-${categoryColor}-500/5 border-${categoryColor}-500/20`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-${categoryColor}-600 border-${categoryColor}-500/50`}
                        >
                          {kpi.id}
                        </Badge>
                        <span className="font-medium text-sm">{kpi.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {kpi.unit}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{kpi.reference}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {kpi.importance}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
