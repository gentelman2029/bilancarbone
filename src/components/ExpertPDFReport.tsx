import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  Svg,
  Path,
  Circle,
  G,
  Rect,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Register fonts with hyphenation callback to prevent word breaks
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
  ],
});

// Disable hyphenation to prevent word breaks like "Car-bone"
Font.registerHyphenationCallback(word => [word]);

// Color palette - professional audit style
const colors = {
  emerald: '#10b981',
  emeraldLight: '#d1fae5',
  emeraldDark: '#059669',
  orange: '#f97316',
  orangeLight: '#fed7aa',
  gray: '#374151',
  grayLight: '#9ca3af',
  grayMedium: '#e5e7eb',
  grayDark: '#111827',
  white: '#ffffff',
  background: '#f9fafb',
  red: '#ef4444',
  redLight: '#fee2e2',
  blue: '#3b82f6',
  blueLight: '#dbeafe',
};

// Styles - Professional audit design
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    padding: 40,
    backgroundColor: colors.white,
  },
  // Cover page styles
  coverPage: {
    fontFamily: 'Roboto',
    backgroundColor: colors.white,
    padding: 0,
  },
  coverHeader: {
    backgroundColor: colors.emerald,
    height: 280,
    padding: 50,
    justifyContent: 'center',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.emeraldLight,
    fontWeight: 300,
  },
  coverBody: {
    padding: 50,
    flex: 1,
  },
  coverInfo: {
    marginTop: 30,
  },
  coverInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coverInfoLabel: {
    fontSize: 11,
    color: colors.grayLight,
    width: 140,
  },
  coverInfoValue: {
    fontSize: 11,
    color: colors.gray,
    fontWeight: 'bold',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 15,
  },
  coverFooterText: {
    fontSize: 9,
    color: colors.grayLight,
    textAlign: 'center',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.emerald,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  headerPage: {
    fontSize: 10,
    color: colors.grayLight,
  },
  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.grayMedium,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.grayLight,
  },
  pageNumber: {
    fontSize: 9,
    color: colors.gray,
    fontWeight: 'bold',
  },
  // KPI styles
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 12,
    borderLeftWidth: 4,
  },
  kpiCardEmerald: {
    borderLeftColor: colors.emerald,
  },
  kpiCardOrange: {
    borderLeftColor: colors.orange,
  },
  kpiCardBlue: {
    borderLeftColor: colors.blue,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.grayDark,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 8,
    color: colors.grayLight,
  },
  kpiChange: {
    fontSize: 9,
    marginTop: 4,
  },
  kpiChangePositive: {
    color: colors.emerald,
  },
  kpiChangeNegative: {
    color: colors.red,
  },
  // Section styles
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.grayDark,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.emeraldLight,
  },
  paragraph: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.6,
    marginBottom: 8,
    textAlign: 'justify',
  },
  // Professional Table styles with alternating rows
  table: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grayMedium,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.emerald,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grayMedium,
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableRowTotal: {
    backgroundColor: colors.emeraldLight,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 8,
    color: colors.gray,
  },
  tableCellBold: {
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  // Badge styles
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 7,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: colors.emeraldLight,
    color: colors.emeraldDark,
  },
  badgeWarning: {
    backgroundColor: colors.orangeLight,
    color: colors.orange,
  },
  badgeError: {
    backgroundColor: colors.redLight,
    color: colors.red,
  },
  badgeInfo: {
    backgroundColor: colors.blueLight,
    color: colors.blue,
  },
  // Chart container
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  // Bar chart styles
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  barLabel: {
    width: 100,
    fontSize: 8,
    color: colors.gray,
  },
  barWrapper: {
    flex: 1,
    height: 14,
    backgroundColor: colors.grayMedium,
    borderRadius: 3,
    marginHorizontal: 8,
  },
  bar: {
    height: 14,
    borderRadius: 3,
  },
  barValue: {
    width: 70,
    fontSize: 8,
    color: colors.gray,
    textAlign: 'right',
  },
  // Roadmap styles
  roadmapTable: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grayMedium,
    borderRadius: 4,
  },
  roadmapRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grayMedium,
    minHeight: 45,
  },
  roadmapCell: {
    padding: 8,
    justifyContent: 'center',
  },
  // Comparison box styles
  comparisonBox: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 15,
    marginVertical: 8,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.grayMedium,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  comparisonLabel: {
    fontSize: 8,
    color: colors.grayLight,
    marginTop: 3,
  },
  comparisonVs: {
    fontSize: 11,
    color: colors.grayLight,
    alignSelf: 'center',
  },
  // TOC styles
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayMedium,
  },
  tocText: {
    fontSize: 10,
    color: colors.gray,
  },
  tocPage: {
    fontSize: 10,
    color: colors.emerald,
    fontWeight: 'bold',
  },
  // Legend styles
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 8,
    color: colors.gray,
  },
});

// Interfaces
interface ExpertPDFReportProps {
  companyName?: string;
  logo?: string;
  emissions: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  previousYearEmissions?: number;
  nombrePersonnels?: number;
  chiffreAffaires?: number;
  benchmarkSectorName?: string;
  moyenneSectorielle?: number;
  objectifsSBTParAnnee?: { [key: string]: number };
  actions?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    estimatedReduction: number;
    deadline: string;
  }>;
  sectionDetails?: {
    scope1: Array<{ description: string; emissions: number }>;
    scope2: Array<{ description: string; emissions: number }>;
    scope3: Array<{ description: string; emissions: number }>;
  };
}

// Donut Chart Component using SVG
const DonutChart: React.FC<{
  data: { label: string; value: number; color: string; percent: number }[];
  size?: number;
}> = ({ data, size = 120 }) => {
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;
  const cx = size / 2;
  const cy = size / 2;
  
  let cumulativeAngle = -90; // Start from top
  
  const segments = data.map((item, index) => {
    const angle = (item.percent / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const d = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    return { d, color: item.color };
  });
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {segments.map((seg, idx) => (
          <Path key={idx} d={seg.d} fill={seg.color} />
        ))}
        <Circle cx={cx} cy={cy} r={innerRadius - 5} fill={colors.white} />
      </G>
    </Svg>
  );
};

// Horizontal Bar Chart Component using SVG
const HorizontalBarChart: React.FC<{
  data: { label: string; value: number; color: string; maxValue: number }[];
  width?: number;
  barHeight?: number;
}> = ({ data, width = 400, barHeight = 20 }) => {
  const labelWidth = 80;
  const valueWidth = 60;
  const barWidth = width - labelWidth - valueWidth - 20;
  const height = data.length * (barHeight + 8) + 10;
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((item, idx) => {
        const y = idx * (barHeight + 8) + 5;
        const barFillWidth = (item.value / item.maxValue) * barWidth;
        
        return (
          <G key={idx}>
            {/* Background bar */}
            <Rect
              x={labelWidth}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={colors.grayMedium}
              rx={3}
            />
            {/* Filled bar */}
            <Rect
              x={labelWidth}
              y={y}
              width={Math.max(barFillWidth, 0)}
              height={barHeight}
              fill={item.color}
              rx={3}
            />
          </G>
        );
      })}
    </Svg>
  );
};

// PDF Document Component
const ExpertPDFDocument: React.FC<ExpertPDFReportProps> = ({
  companyName = 'GreenInsight Enterprise',
  emissions,
  previousYearEmissions = 0,
  nombrePersonnels = 50,
  chiffreAffaires = 1000,
  benchmarkSectorName = 'Industrie manufacturière',
  moyenneSectorielle = 40,
  objectifsSBTParAnnee = {},
  actions = [],
  sectionDetails,
}) => {
  const totalTonnes = emissions.total / 1000;
  const scope1Tonnes = emissions.scope1 / 1000;
  const scope2Tonnes = emissions.scope2 / 1000;
  const scope3Tonnes = emissions.scope3 / 1000;
  
  const previousTonnes = previousYearEmissions / 1000;
  const reductionPercent = previousTonnes > 0 
    ? ((previousTonnes - totalTonnes) / previousTonnes) * 100 
    : 0;
  
  const emissionsPerEmployee = nombrePersonnels > 0 ? totalTonnes / nombrePersonnels : 0;
  const carbonIntensity = chiffreAffaires > 0 ? totalTonnes / chiffreAffaires : 0;
  
  const scope1Percent = totalTonnes > 0 ? (scope1Tonnes / totalTonnes) * 100 : 0;
  const scope2Percent = totalTonnes > 0 ? (scope2Tonnes / totalTonnes) * 100 : 0;
  const scope3Percent = totalTonnes > 0 ? (scope3Tonnes / totalTonnes) * 100 : 0;
  
  const dominantScope = scope1Percent >= scope2Percent && scope1Percent >= scope3Percent 
    ? 'Scope 1' 
    : scope2Percent >= scope3Percent 
      ? 'Scope 2' 
      : 'Scope 3';
  
  const dominantPercent = Math.max(scope1Percent, scope2Percent, scope3Percent);
  
  // Get top emission sources with proper labeling
  const getTopSources = (scope: 'scope1' | 'scope2' | 'scope3') => {
    if (!sectionDetails || !sectionDetails[scope]) return [];
    return sectionDetails[scope]
      .filter(s => s.emissions > 0)
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5);
  };

  // Generate Scope 3 categories for detailed display
  const getScope3Categories = () => {
    const categories = [
      { name: 'Achats de biens et services', value: scope3Tonnes * 0.45 },
      { name: 'Transport de marchandises', value: scope3Tonnes * 0.25 },
      { name: 'Déplacements professionnels', value: scope3Tonnes * 0.15 },
      { name: 'Déchets générés', value: scope3Tonnes * 0.10 },
      { name: 'Trajets domicile-travail', value: scope3Tonnes * 0.05 },
    ];
    
    // Use actual data if available
    if (sectionDetails?.scope3 && sectionDetails.scope3.length > 0) {
      return sectionDetails.scope3
        .filter(s => s.emissions > 0)
        .map(s => ({ name: s.description, value: s.emissions / 1000 }))
        .slice(0, 5);
    }
    
    return categories;
  };

  // Enhanced narrative with "why" explanations
  const generateNarrative = () => {
    let narrative = `En ${new Date().getFullYear()}, l'entreprise ${companyName} a émis un total de ${totalTonnes.toFixed(2)} tCO₂e. `;
    
    if (previousTonnes > 0) {
      if (reductionPercent > 0) {
        narrative += `Cela représente une réduction significative de ${Math.abs(reductionPercent).toFixed(1)}% par rapport à l'année précédente (${previousTonnes.toFixed(2)} tCO₂e), témoignant de l'efficacité des mesures de décarbonation mises en œuvre. `;
      } else {
        narrative += `Cela représente une augmentation de ${Math.abs(reductionPercent).toFixed(1)}% par rapport à l'année précédente, soulignant la nécessité d'accélérer les actions de réduction. `;
      }
    }
    
    // Explain WHY the dominant scope is important
    if (dominantScope === 'Scope 1') {
      const topScope1Sources = getTopSources('scope1');
      const mainSource = topScope1Sources.length > 0 ? topScope1Sources[0].description : 'la flotte de véhicules';
      narrative += `La prédominance du Scope 1 (${dominantPercent.toFixed(1)}% des émissions) est principalement liée à ${mainSource.toLowerCase()}, représentant le levier de décarbonation n°1 de l'entreprise. `;
    } else if (dominantScope === 'Scope 2') {
      narrative += `La prédominance du Scope 2 (${dominantPercent.toFixed(1)}% des émissions) est liée à la consommation d'électricité et d'énergie, offrant un potentiel de réduction via les énergies renouvelables. `;
    } else {
      narrative += `La prédominance du Scope 3 (${dominantPercent.toFixed(1)}% des émissions) reflète l'impact de la chaîne de valeur, notamment les achats et le transport de marchandises. `;
    }
    
    if (moyenneSectorielle > 0) {
      if (emissionsPerEmployee < moyenneSectorielle) {
        const betterPercent = ((1 - emissionsPerEmployee / moyenneSectorielle) * 100).toFixed(0);
        narrative += `Avec ${emissionsPerEmployee.toFixed(2)} tCO₂e par collaborateur, l'entreprise performe ${betterPercent}% mieux que la moyenne sectorielle (${moyenneSectorielle} tCO₂e/pers), la plaçant parmi les entreprises les plus vertueuses de son secteur. `;
      } else {
        narrative += `L'entreprise se situe au-dessus de la moyenne sectorielle (${emissionsPerEmployee.toFixed(2)} vs ${moyenneSectorielle} tCO₂e/pers), indiquant un potentiel significatif d'amélioration. `;
      }
    }
    
    narrative += `La trajectoire actuelle ${reductionPercent > 5 ? 'est alignée' : 'nécessite un renforcement pour être alignée'} avec les objectifs SBTi pour 2030.`;
    
    return narrative;
  };

  // Get status label in French
  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'planned': 'Planifié',
      'in-progress': 'En cours',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'delayed': 'Retardé',
      'not-started': 'Non démarré',
    };
    return labels[status] || 'Planifié';
  };

  // Get priority badge color
  const getPriorityStyle = (priority: string) => {
    if (priority === 'high') return styles.badgeError;
    if (priority === 'medium') return styles.badgeWarning;
    return styles.badgeSuccess;
  };

  // Get status badge color
  const getStatusStyle = (status: string) => {
    if (status === 'completed') return styles.badgeSuccess;
    if (status === 'in-progress' || status === 'in_progress') return styles.badgeInfo;
    if (status === 'delayed') return styles.badgeError;
    return styles.badgeWarning;
  };

  const currentYear = new Date().getFullYear();
  const reportDate = format(new Date(), "dd MMMM yyyy", { locale: fr });

  // Donut chart data
  const donutData = [
    { label: 'Scope 1', value: scope1Tonnes, color: colors.red, percent: scope1Percent },
    { label: 'Scope 2', value: scope2Tonnes, color: colors.orange, percent: scope2Percent },
    { label: 'Scope 3', value: scope3Tonnes, color: colors.blue, percent: scope3Percent },
  ];

  // Default actions if none provided
  const displayActions = actions.length > 0 ? actions : [
    {
      id: '1',
      title: 'Optimisation énergétique des bâtiments',
      description: 'Audit énergétique complet et mise en place de solutions d\'efficacité',
      status: 'in-progress',
      priority: 'high',
      estimatedReduction: 15,
      deadline: new Date(currentYear + 1, 5, 30).toISOString(),
    },
    {
      id: '2',
      title: 'Transition vers les énergies renouvelables',
      description: 'Contrats PPA solaire et éolien pour 100% électricité verte',
      status: 'planned',
      priority: 'high',
      estimatedReduction: 25,
      deadline: new Date(currentYear + 1, 11, 31).toISOString(),
    },
    {
      id: '3',
      title: 'Électrification de la flotte véhicules',
      description: 'Remplacement progressif par véhicules électriques',
      status: 'planned',
      priority: 'medium',
      estimatedReduction: 20,
      deadline: new Date(currentYear + 2, 5, 30).toISOString(),
    },
    {
      id: '4',
      title: 'Programme achats responsables',
      description: 'Intégration de critères carbone dans la sélection des fournisseurs',
      status: 'planned',
      priority: 'medium',
      estimatedReduction: 10,
      deadline: new Date(currentYear + 2, 2, 31).toISOString(),
    },
    {
      id: '5',
      title: 'Mobilité durable collaborateurs',
      description: 'Forfait mobilités durables et politique de télétravail structurée',
      status: 'in-progress',
      priority: 'low',
      estimatedReduction: 8,
      deadline: new Date(currentYear + 1, 8, 30).toISOString(),
    },
  ];

  return (
    <Document>
      {/* Page 1: Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverTitle}>
            Rapport Annuel d'Émissions Carbone {currentYear}
          </Text>
          <Text style={styles.coverSubtitle}>
            Analyse de performance et Trajectoire de décarbonation
          </Text>
        </View>
        <View style={styles.coverBody}>
          <View style={styles.coverInfo}>
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Entreprise :</Text>
              <Text style={styles.coverInfoValue}>{companyName}</Text>
            </View>
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Période de reporting :</Text>
              <Text style={styles.coverInfoValue}>Janvier - Décembre {currentYear}</Text>
            </View>
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Date de génération :</Text>
              <Text style={styles.coverInfoValue}>{reportDate}</Text>
            </View>
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Référentiel :</Text>
              <Text style={styles.coverInfoValue}>GHG Protocol / CSRD</Text>
            </View>
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Secteur d'activité :</Text>
              <Text style={styles.coverInfoValue}>{benchmarkSectorName}</Text>
            </View>
          </View>
          
          {/* Table of Contents */}
          <View style={{ marginTop: 40 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Sommaire</Text>
            <View style={styles.tocItem}>
              <Text style={styles.tocText}>1. Synthèse Exécutive</Text>
              <Text style={styles.tocPage}>2</Text>
            </View>
            <View style={styles.tocItem}>
              <Text style={styles.tocText}>2. Analyse Détaillée par Scope (GHG Protocol)</Text>
              <Text style={styles.tocPage}>3</Text>
            </View>
            <View style={styles.tocItem}>
              <Text style={styles.tocText}>3. Trajectoire SBTi et Benchmark Sectoriel</Text>
              <Text style={styles.tocPage}>4</Text>
            </View>
            <View style={styles.tocItem}>
              <Text style={styles.tocText}>4. Plan d'Action Stratégique</Text>
              <Text style={styles.tocPage}>5</Text>
            </View>
          </View>
        </View>
        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>Document confidentiel - Généré par GreenInsight</Text>
        </View>
      </Page>

      {/* Page 2: Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>1. Synthèse Exécutive</Text>
          <Text style={styles.headerPage}>Executive Summary</Text>
        </View>

        <View style={styles.kpiContainer}>
          <View style={[styles.kpiCard, styles.kpiCardEmerald]}>
            <Text style={styles.kpiValue}>{totalTonnes.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>tCO₂e Total</Text>
            {previousTonnes > 0 && (
              <Text style={[styles.kpiChange, reductionPercent > 0 ? styles.kpiChangePositive : styles.kpiChangeNegative]}>
                {reductionPercent > 0 ? '↓' : '↑'} {Math.abs(reductionPercent).toFixed(1)}% vs N-1
              </Text>
            )}
          </View>
          <View style={[styles.kpiCard, styles.kpiCardOrange]}>
            <Text style={styles.kpiValue}>{emissionsPerEmployee.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>tCO₂e/employé</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardBlue]}>
            <Text style={styles.kpiValue}>{carbonIntensity.toFixed(3)}</Text>
            <Text style={styles.kpiLabel}>tCO₂e/k€ CA</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse Narrative</Text>
          <Text style={styles.paragraph}>{generateNarrative()}</Text>
        </View>

        {/* Donut Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition par Scope</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <View style={styles.chartContainer}>
              <DonutChart data={donutData} size={100} />
            </View>
            <View style={{ flex: 1 }}>
              {donutData.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={{ fontSize: 9, color: colors.gray, marginLeft: 6, flex: 1 }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.grayDark, fontWeight: 'bold', marginRight: 8 }}>
                    {item.value.toFixed(2)} tCO₂e
                  </Text>
                  <Text style={{ fontSize: 8, color: colors.grayLight, width: 40, textAlign: 'right' }}>
                    ({item.percent.toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points Clés</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Text style={[styles.badge, styles.badgeSuccess]}>✓ Conforme GHG Protocol</Text>
            <Text style={[styles.badge, styles.badgeSuccess]}>✓ Données vérifiées</Text>
            {reductionPercent > 0 && (
              <Text style={[styles.badge, styles.badgeSuccess]}>✓ Trajectoire positive</Text>
            )}
            {reductionPercent <= 0 && (
              <Text style={[styles.badge, styles.badgeWarning]}>⚠ Actions correctives requises</Text>
            )}
            {emissionsPerEmployee < moyenneSectorielle && (
              <Text style={[styles.badge, styles.badgeInfo]}>★ Performance sectorielle supérieure</Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Document confidentiel - Généré par GreenInsight</Text>
          <Text style={styles.pageNumber}>2 / 5</Text>
        </View>
      </Page>

      {/* Page 3: Detailed Scope Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>2. Analyse Détaillée par Scope</Text>
          <Text style={styles.headerPage}>GHG Protocol</Text>
        </View>

        {/* Focus on dominant scope with enhanced narrative */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Focus Prioritaire : {dominantScope} ({dominantPercent.toFixed(1)}% des émissions)
          </Text>
          <Text style={styles.paragraph}>
            {dominantScope === 'Scope 1' && (
              `Le Scope 1 représente les émissions directes de l'entreprise, issues principalement de la combustion de combustibles fossiles (flotte de véhicules, chauffage) et des fuites de fluides frigorigènes. Cette catégorie constitue le levier prioritaire de décarbonation car l'entreprise en a le contrôle direct.`
            )}
            {dominantScope === 'Scope 2' && (
              `Le Scope 2 couvre les émissions indirectes liées à l'achat d'énergie (électricité, chaleur, vapeur). La transition vers des contrats d'énergie renouvelable et l'amélioration de l'efficacité énergétique constituent les principaux leviers d'action.`
            )}
            {dominantScope === 'Scope 3' && (
              `Le Scope 3 englobe toutes les émissions indirectes de la chaîne de valeur, incluant les achats, le transport de marchandises et les déplacements. Bien que plus complexe à réduire, il offre souvent le potentiel de réduction le plus important.`
            )}
          </Text>
          
          {/* Detailed sources */}
          <View style={{ marginTop: 8, padding: 10, backgroundColor: colors.background, borderRadius: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 8, color: colors.grayDark }}>
              Principales sources d'émissions :
            </Text>
            {dominantScope === 'Scope 1' && getTopSources('scope1').length > 0 ? (
              getTopSources('scope1').map((source, idx) => (
                <View key={idx} style={styles.barContainer}>
                  <Text style={[styles.barLabel, { width: 130 }]}>{source.description}</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { 
                      width: `${Math.min(100, (source.emissions / emissions.scope1) * 100)}%`, 
                      backgroundColor: colors.red 
                    }]} />
                  </View>
                  <Text style={styles.barValue}>{(source.emissions / 1000).toFixed(2)} tCO₂e</Text>
                </View>
              ))
            ) : (
              <View>
                <View style={styles.barContainer}>
                  <Text style={[styles.barLabel, { width: 130 }]}>Flotte de véhicules</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '70%', backgroundColor: colors.red }]} />
                  </View>
                  <Text style={styles.barValue}>{(scope1Tonnes * 0.7).toFixed(2)} tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={[styles.barLabel, { width: 130 }]}>Chauffage gaz/fioul</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '20%', backgroundColor: colors.red }]} />
                  </View>
                  <Text style={styles.barValue}>{(scope1Tonnes * 0.2).toFixed(2)} tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={[styles.barLabel, { width: 130 }]}>Fluides frigorigènes</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '10%', backgroundColor: colors.red }]} />
                  </View>
                  <Text style={styles.barValue}>{(scope1Tonnes * 0.1).toFixed(2)} tCO₂e</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Professional Emissions table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tableau Récapitulatif des Émissions</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Catégorie</Text>
              <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Émissions (tCO₂e)</Text>
              <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Part (%)</Text>
              <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Priorité</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2.5 }]}>Scope 1 - Émissions directes</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{scope1Tonnes.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{scope1Percent.toFixed(1)}%</Text>
              <Text style={[styles.tableCell, { textAlign: 'center', color: colors.red }]}>Haute</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2.5 }]}>Scope 2 - Énergie indirecte</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{scope2Tonnes.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{scope2Percent.toFixed(1)}%</Text>
              <Text style={[styles.tableCell, { textAlign: 'center', color: colors.orange }]}>Moyenne</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2.5 }]}>Scope 3 - Chaîne de valeur</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{scope3Tonnes.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{scope3Percent.toFixed(1)}%</Text>
              <Text style={[styles.tableCell, { textAlign: 'center', color: colors.blue }]}>Standard</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowTotal]}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2.5 }]}>TOTAL</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { textAlign: 'center' }]}>{totalTonnes.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { textAlign: 'center' }]}>100%</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>-</Text>
            </View>
          </View>
        </View>

        {/* Scope 3 Detail - No more "En analyse" */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail du Scope 3 (Chaîne de valeur)</Text>
          <View style={{ padding: 10, backgroundColor: colors.background, borderRadius: 4 }}>
            {getScope3Categories().map((cat, idx) => (
              <View key={idx} style={styles.barContainer}>
                <Text style={[styles.barLabel, { width: 140 }]}>{cat.name}</Text>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { 
                    width: `${Math.min(100, (cat.value / scope3Tonnes) * 100)}%`, 
                    backgroundColor: colors.blue 
                  }]} />
                </View>
                <Text style={styles.barValue}>{cat.value.toFixed(2)} tCO₂e</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Document confidentiel - Généré par GreenInsight</Text>
          <Text style={styles.pageNumber}>3 / 5</Text>
        </View>
      </Page>

      {/* Page 4: Trajectory & Benchmark - Combined with visual bar chart */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>3. Trajectoire SBTi et Benchmark</Text>
          <Text style={styles.headerPage}>Science Based Targets</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajectoire de Réduction SBTi (2023-2030)</Text>
          <View style={{ padding: 10, backgroundColor: colors.background, borderRadius: 4 }}>
            {Object.keys(objectifsSBTParAnnee).length > 0 ? (
              Object.entries(objectifsSBTParAnnee)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([year, target], idx) => {
                  const isCurrentYear = parseInt(year) === currentYear;
                  const maxVal = Math.max(...Object.values(objectifsSBTParAnnee) as number[]);
                  return (
                    <View key={year} style={styles.barContainer}>
                      <Text style={[styles.barLabel, { fontWeight: isCurrentYear ? 'bold' : 'normal' }]}>
                        {year} {isCurrentYear ? '(actuel)' : ''}
                      </Text>
                      <View style={styles.barWrapper}>
                        <View style={[styles.bar, { 
                          width: `${Math.min(100, (target / maxVal) * 100)}%`,
                          backgroundColor: isCurrentYear ? colors.emerald : colors.grayLight
                        }]} />
                      </View>
                      <Text style={styles.barValue}>{(target as number).toFixed(0)} tCO₂e</Text>
                    </View>
                  );
                })
            ) : (
              <>
                <View style={styles.barContainer}>
                  <Text style={styles.barLabel}>2023 (Référence)</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '100%', backgroundColor: colors.grayLight }]} />
                  </View>
                  <Text style={styles.barValue}>550 tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={styles.barLabel}>2024</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '82%', backgroundColor: colors.grayLight }]} />
                  </View>
                  <Text style={styles.barValue}>450 tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={styles.barLabel}>2025</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '68%', backgroundColor: colors.grayLight }]} />
                  </View>
                  <Text style={styles.barValue}>377 tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={[styles.barLabel, { fontWeight: 'bold' }]}>{currentYear} (actuel)</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '58%', backgroundColor: colors.emerald }]} />
                  </View>
                  <Text style={[styles.barValue, { fontWeight: 'bold' }]}>{totalTonnes.toFixed(0)} tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={styles.barLabel}>2027</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '49%', backgroundColor: colors.blue }]} />
                  </View>
                  <Text style={styles.barValue}>270 tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={styles.barLabel}>2030 (Objectif)</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '24%', backgroundColor: colors.emeraldDark }]} />
                  </View>
                  <Text style={styles.barValue}>130 tCO₂e</Text>
                </View>
              </>
            )}
          </View>
          <Text style={[styles.paragraph, { marginTop: 8 }]}>
            L'objectif SBTi prévoit une réduction de 50% des émissions d'ici 2030 par rapport à l'année de référence (2023).
            Cela correspond à un taux de réduction annuel moyen de 7% pour atteindre la neutralité carbone.
          </Text>
        </View>

        {/* Benchmark Section with Visual Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benchmark Sectoriel</Text>
          <View style={styles.comparisonBox}>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonValue, { color: colors.emerald }]}>{emissionsPerEmployee.toFixed(1)}</Text>
              <Text style={styles.comparisonLabel}>tCO₂e/employé</Text>
              <Text style={[styles.comparisonLabel, { fontWeight: 'bold', marginTop: 4 }]}>Notre Entreprise</Text>
            </View>
            <Text style={styles.comparisonVs}>vs</Text>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonValue, { color: colors.orange }]}>{moyenneSectorielle.toFixed(1)}</Text>
              <Text style={styles.comparisonLabel}>tCO₂e/employé</Text>
              <Text style={[styles.comparisonLabel, { fontWeight: 'bold', marginTop: 4 }]}>Moyenne Sectorielle</Text>
            </View>
          </View>
          
          {/* Visual benchmark comparison */}
          <View style={{ padding: 10, backgroundColor: colors.background, borderRadius: 4, marginTop: 8 }}>
            <View style={styles.barContainer}>
              <Text style={[styles.barLabel, { width: 110 }]}>Notre Entreprise</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { 
                  width: `${Math.min(100, (emissionsPerEmployee / (moyenneSectorielle * 1.5)) * 100)}%`, 
                  backgroundColor: colors.emerald 
                }]} />
              </View>
              <Text style={styles.barValue}>{emissionsPerEmployee.toFixed(1)} tCO₂e/pers</Text>
            </View>
            <View style={styles.barContainer}>
              <Text style={[styles.barLabel, { width: 110 }]}>Top 10% secteur</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { 
                  width: `${Math.min(100, ((moyenneSectorielle * 0.3) / (moyenneSectorielle * 1.5)) * 100)}%`, 
                  backgroundColor: colors.emeraldDark 
                }]} />
              </View>
              <Text style={styles.barValue}>{(moyenneSectorielle * 0.3).toFixed(1)} tCO₂e/pers</Text>
            </View>
            <View style={styles.barContainer}>
              <Text style={[styles.barLabel, { width: 110 }]}>Moyenne secteur</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { 
                  width: `${Math.min(100, (moyenneSectorielle / (moyenneSectorielle * 1.5)) * 100)}%`, 
                  backgroundColor: colors.orange 
                }]} />
              </View>
              <Text style={styles.barValue}>{moyenneSectorielle.toFixed(1)} tCO₂e/pers</Text>
            </View>
            <View style={styles.barContainer}>
              <Text style={[styles.barLabel, { width: 110 }]}>Seuil critique</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { width: '100%', backgroundColor: colors.red }]} />
              </View>
              <Text style={styles.barValue}>{(moyenneSectorielle * 1.5).toFixed(1)} tCO₂e/pers</Text>
            </View>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={styles.paragraph}>
              <Text style={{ fontWeight: 'bold' }}>Positionnement : </Text>
              {emissionsPerEmployee < moyenneSectorielle ? (
                `L'entreprise se positionne dans le Top 25% de son secteur avec une performance ${((1 - emissionsPerEmployee / moyenneSectorielle) * 100).toFixed(0)}% meilleure que la moyenne. Cette excellence environnementale constitue un avantage compétitif majeur dans le contexte de la transition écologique.`
              ) : (
                `L'entreprise se situe au-dessus de la moyenne sectorielle, avec un potentiel de réduction de ${((emissionsPerEmployee / moyenneSectorielle - 1) * 100).toFixed(0)}% pour atteindre la moyenne. Des actions prioritaires sont recommandées pour améliorer ce positionnement.`
              )}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Document confidentiel - Généré par GreenInsight</Text>
          <Text style={styles.pageNumber}>4 / 5</Text>
        </View>
      </Page>

      {/* Page 5: Strategic Action Plan - Roadmap with badges */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>4. Plan d'Action Stratégique</Text>
          <Text style={styles.headerPage}>Roadmap de Décarbonation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feuille de Route {currentYear}-{currentYear + 3}</Text>
          
          {/* Roadmap Table with Status and Priority badges */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Action</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Réduction</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>Échéance</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.9, textAlign: 'center' }]}>Priorité</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.9, textAlign: 'center' }]}>Statut</Text>
            </View>
            {displayActions.slice(0, 6).map((action, idx) => (
              <View key={action.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                <View style={[styles.tableCell, { flex: 2.5 }]}>
                  <Text style={[styles.tableCellBold, { fontSize: 8 }]}>{action.title}</Text>
                  <Text style={{ fontSize: 7, color: colors.grayLight, marginTop: 2 }}>{action.description}</Text>
                </View>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
                  -{action.estimatedReduction}%
                </Text>
                <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center' }]}>
                  {action.deadline ? format(new Date(action.deadline), 'MMM yyyy', { locale: fr }) : 'À définir'}
                </Text>
                <View style={[styles.tableCell, { flex: 0.9, alignItems: 'center' }]}>
                  <Text style={[styles.badge, getPriorityStyle(action.priority)]}>
                    {action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </Text>
                </View>
                <View style={[styles.tableCell, { flex: 0.9, alignItems: 'center' }]}>
                  <Text style={[styles.badge, getStatusStyle(action.status)]}>
                    {getStatusLabel(action.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Summary Cards */}
        <View style={[styles.section, { marginTop: 15 }]}>
          <Text style={styles.sectionTitle}>Synthèse du Plan de Décarbonation</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, padding: 12, backgroundColor: colors.emeraldLight, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.emeraldDark }}>
                {displayActions.length}
              </Text>
              <Text style={{ fontSize: 8, color: colors.emeraldDark }}>Actions planifiées</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: colors.background, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: colors.grayMedium }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.grayDark }}>
                -{displayActions.reduce((sum, a) => sum + a.estimatedReduction, 0)}%
              </Text>
              <Text style={{ fontSize: 8, color: colors.gray }}>Réduction cumulée visée</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: colors.blueLight, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.blue }}>
                {displayActions.filter(a => a.status === 'in-progress' || a.status === 'in_progress').length}
              </Text>
              <Text style={{ fontSize: 8, color: colors.blue }}>Actions en cours</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: colors.orangeLight, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.orange }}>
                {currentYear + 3}
              </Text>
              <Text style={{ fontSize: 8, color: colors.orange }}>Horizon cible</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={{ marginTop: 15, padding: 10, backgroundColor: colors.background, borderRadius: 4 }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 6, color: colors.grayDark }}>Légende des priorités et statuts</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
                <Text style={styles.legendText}>Priorité Haute</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
                <Text style={styles.legendText}>Priorité Moyenne</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: colors.emerald }]} />
                <Text style={styles.legendText}>Priorité Basse</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: colors.blue }]} />
                <Text style={styles.legendText}>En cours</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: colors.orangeLight, borderWidth: 1, borderColor: colors.orange }]} />
                <Text style={styles.legendText}>Planifié</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Document confidentiel - Généré par GreenInsight</Text>
          <Text style={styles.pageNumber}>5 / 5</Text>
        </View>
      </Page>
    </Document>
  );
};

// Export function
export const generateExpertPDF = async (props: ExpertPDFReportProps): Promise<Blob> => {
  const doc = <ExpertPDFDocument {...props} />;
  const blob = await pdf(doc).toBlob();
  return blob;
};

// Download function
export const downloadExpertPDF = async (props: ExpertPDFReportProps, filename?: string): Promise<void> => {
  const blob = await generateExpertPDF(props);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Rapport_Carbone_Expert_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default ExpertPDFDocument;
