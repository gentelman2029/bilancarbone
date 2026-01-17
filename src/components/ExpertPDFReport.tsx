import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  Link,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
  ],
});

// Color palette
const colors = {
  emerald: '#10b981',
  emeraldLight: '#d1fae5',
  emeraldDark: '#059669',
  orange: '#f97316',
  orangeLight: '#fed7aa',
  gray: '#374151',
  grayLight: '#9ca3af',
  grayDark: '#111827',
  white: '#ffffff',
  background: '#f9fafb',
  red: '#ef4444',
  blue: '#3b82f6',
};

// Styles
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
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
  },
  coverSubtitle: {
    fontSize: 16,
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
    width: 120,
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
    fontSize: 18,
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
    borderTopColor: colors.grayLight,
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
    marginBottom: 25,
    gap: 15,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 15,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.grayDark,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 9,
    color: colors.grayLight,
  },
  kpiChange: {
    fontSize: 10,
    marginTop: 5,
  },
  kpiChangePositive: {
    color: colors.emerald,
  },
  kpiChangeNegative: {
    color: colors.red,
  },
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.grayDark,
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.emeraldLight,
  },
  paragraph: {
    fontSize: 10,
    color: colors.gray,
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify',
  },
  // Table styles
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.emerald,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    backgroundColor: colors.background,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    color: colors.gray,
  },
  tableCellBold: {
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  // Progress bar styles
  progressContainer: {
    height: 8,
    backgroundColor: colors.grayLight,
    borderRadius: 4,
    marginVertical: 5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  // Alert/badge styles
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: colors.emeraldLight,
    color: colors.emeraldDark,
  },
  badgeWarning: {
    backgroundColor: colors.orangeLight,
    color: colors.orange,
  },
  // Chart substitute styles
  chartPlaceholder: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 20,
    marginVertical: 10,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  barLabel: {
    width: 100,
    fontSize: 9,
    color: colors.gray,
  },
  barWrapper: {
    flex: 1,
    height: 16,
    backgroundColor: colors.grayLight,
    borderRadius: 3,
    marginHorizontal: 10,
  },
  bar: {
    height: 16,
    borderRadius: 3,
  },
  barValue: {
    width: 60,
    fontSize: 9,
    color: colors.gray,
    textAlign: 'right',
  },
  // Roadmap styles
  roadmapItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  roadmapItemDelayed: {
    borderLeftColor: colors.orange,
  },
  roadmapItemCompleted: {
    borderLeftColor: colors.emeraldDark,
  },
  roadmapContent: {
    flex: 1,
    paddingLeft: 10,
  },
  roadmapTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.grayDark,
    marginBottom: 3,
  },
  roadmapDescription: {
    fontSize: 9,
    color: colors.grayLight,
    marginBottom: 4,
  },
  roadmapMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  roadmapMetaItem: {
    fontSize: 8,
    color: colors.gray,
  },
  // Comparison box styles
  comparisonBox: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    justifyContent: 'space-around',
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
    fontSize: 9,
    color: colors.grayLight,
    marginTop: 4,
  },
  comparisonVs: {
    fontSize: 12,
    color: colors.grayLight,
    alignSelf: 'center',
  },
  // TOC styles
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  tocText: {
    fontSize: 11,
    color: colors.gray,
  },
  tocPage: {
    fontSize: 11,
    color: colors.emerald,
    fontWeight: 'bold',
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

  const generateNarrative = () => {
    let narrative = `En ${new Date().getFullYear()}, l'entreprise a émis un total de ${totalTonnes.toFixed(2)} tCO₂e. `;
    
    if (previousTonnes > 0) {
      if (reductionPercent > 0) {
        narrative += `Cela représente une réduction de ${Math.abs(reductionPercent).toFixed(1)}% par rapport à l'année précédente (${previousTonnes.toFixed(2)} tCO₂e). `;
      } else {
        narrative += `Cela représente une augmentation de ${Math.abs(reductionPercent).toFixed(1)}% par rapport à l'année précédente. `;
      }
    }
    
    narrative += `Le ${dominantScope} représente la source principale d'émissions avec ${dominantPercent.toFixed(1)}% du total. `;
    
    if (moyenneSectorielle > 0) {
      if (emissionsPerEmployee < moyenneSectorielle) {
        narrative += `L'entreprise performe mieux que la moyenne sectorielle (${emissionsPerEmployee.toFixed(2)} tCO₂e/pers vs ${moyenneSectorielle} tCO₂e/pers). `;
      } else {
        narrative += `L'entreprise se situe au-dessus de la moyenne sectorielle (${emissionsPerEmployee.toFixed(2)} tCO₂e/pers vs ${moyenneSectorielle} tCO₂e/pers), indiquant un potentiel d'amélioration. `;
      }
    }
    
    narrative += `La trajectoire actuelle est ${reductionPercent > 5 ? 'alignée' : 'à renforcer pour être alignée'} avec les objectifs SBTi pour 2030.`;
    
    return narrative;
  };

  const currentYear = new Date().getFullYear();
  const reportDate = format(new Date(), "dd MMMM yyyy", { locale: fr });

  // Get top emission sources from section details
  const getTopSources = (scope: 'scope1' | 'scope2' | 'scope3') => {
    if (!sectionDetails || !sectionDetails[scope]) return [];
    return sectionDetails[scope]
      .filter(s => s.emissions > 0)
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5);
  };

  return (
    <Document>
      {/* Page 1: Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverTitle}>Rapport Annuel d'Émissions Carbone {currentYear}</Text>
          <Text style={styles.coverSubtitle}>Analyse de performance & Trajectoire de décarbonation</Text>
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
              <Text style={styles.coverInfoLabel}>Secteur :</Text>
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
              <Text style={styles.tocText}>3. Trajectoire SBTi & Benchmark Sectoriel</Text>
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
            <Text style={styles.kpiLabel}>tCO₂e/k€</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse Narrative</Text>
          <Text style={styles.paragraph}>{generateNarrative()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition par Scope</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.barContainer}>
              <Text style={styles.barLabel}>Scope 1</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { width: `${scope1Percent}%`, backgroundColor: colors.red }]} />
              </View>
              <Text style={styles.barValue}>{scope1Tonnes.toFixed(2)} tCO₂e ({scope1Percent.toFixed(1)}%)</Text>
            </View>
            <View style={styles.barContainer}>
              <Text style={styles.barLabel}>Scope 2</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { width: `${scope2Percent}%`, backgroundColor: colors.orange }]} />
              </View>
              <Text style={styles.barValue}>{scope2Tonnes.toFixed(2)} tCO₂e ({scope2Percent.toFixed(1)}%)</Text>
            </View>
            <View style={styles.barContainer}>
              <Text style={styles.barLabel}>Scope 3</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.bar, { width: `${scope3Percent}%`, backgroundColor: colors.blue }]} />
              </View>
              <Text style={styles.barValue}>{scope3Tonnes.toFixed(2)} tCO₂e ({scope3Percent.toFixed(1)}%)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points Clés</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Text style={[styles.badge, styles.badgeSuccess]}>✓ Conforme GHG Protocol</Text>
            <Text style={[styles.badge, styles.badgeSuccess]}>✓ Données vérifiées</Text>
            {reductionPercent > 0 && (
              <Text style={[styles.badge, styles.badgeSuccess]}>✓ Trajectoire positive</Text>
            )}
            {reductionPercent <= 0 && (
              <Text style={[styles.badge, styles.badgeWarning]}>⚠ Actions correctives requises</Text>
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

        {/* Focus on dominant scope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Focus Prioritaire : {dominantScope} ({dominantPercent.toFixed(1)}% des émissions)
          </Text>
          <Text style={styles.paragraph}>
            Le {dominantScope} représente la source principale d'émissions de l'entreprise. 
            Cette catégorie nécessite une attention particulière dans la stratégie de décarbonation.
          </Text>
          
          {scope1Percent >= scope2Percent && scope1Percent >= scope3Percent && (
            <View style={styles.chartPlaceholder}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 10, color: colors.grayDark }}>
                Principales sources d'émissions directes :
              </Text>
              {getTopSources('scope1').length > 0 ? (
                getTopSources('scope1').map((source, idx) => (
                  <View key={idx} style={styles.barContainer}>
                    <Text style={[styles.barLabel, { width: 140 }]}>{source.description}</Text>
                    <View style={[styles.barWrapper, { flex: 1 }]}>
                      <View style={[styles.bar, { 
                        width: `${(source.emissions / emissions.scope1) * 100}%`, 
                        backgroundColor: colors.red 
                      }]} />
                    </View>
                    <Text style={styles.barValue}>{(source.emissions / 1000).toFixed(2)} tCO₂e</Text>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 9, color: colors.grayLight }}>
                  Combustion de carburants, chauffage au gaz, fluides frigorigènes
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Emissions table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tableau Récapitulatif des Émissions</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Catégorie</Text>
              <Text style={styles.tableHeaderCell}>Émissions (tCO₂e)</Text>
              <Text style={styles.tableHeaderCell}>Part (%)</Text>
              <Text style={styles.tableHeaderCell}>Tendance</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2 }]}>Scope 1 - Émissions directes</Text>
              <Text style={styles.tableCell}>{scope1Tonnes.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{scope1Percent.toFixed(1)}%</Text>
              <Text style={[styles.tableCell, { color: colors.emerald }]}>↓ Priorité haute</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2 }]}>Scope 2 - Énergie indirecte</Text>
              <Text style={styles.tableCell}>{scope2Tonnes.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{scope2Percent.toFixed(1)}%</Text>
              <Text style={[styles.tableCell, { color: colors.orange }]}>→ Stable</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2 }]}>Scope 3 - Autres indirectes</Text>
              <Text style={styles.tableCell}>{scope3Tonnes.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{scope3Percent.toFixed(1)}%</Text>
              <Text style={[styles.tableCell, { color: colors.blue }]}>↗ En analyse</Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: colors.emeraldLight }]}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2 }]}>TOTAL</Text>
              <Text style={[styles.tableCell, styles.tableCellBold]}>{totalTonnes.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.tableCellBold]}>100%</Text>
              <Text style={styles.tableCell}>-</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Correctives Prioritaires</Text>
          <Text style={styles.paragraph}>
            • Optimisation énergétique des procédés industriels{'\n'}
            • Transition vers des fluides frigorigènes à faible GWP{'\n'}
            • Électrification progressive de la flotte de véhicules{'\n'}
            • Contrats d'énergie verte pour le Scope 2
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Document confidentiel - Généré par GreenInsight</Text>
          <Text style={styles.pageNumber}>3 / 5</Text>
        </View>
      </Page>

      {/* Page 4: Trajectory & Benchmark */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>3. Trajectoire SBTi & Benchmark</Text>
          <Text style={styles.headerPage}>Science Based Targets</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajectoire de Réduction SBTi 2023-2030</Text>
          <View style={styles.chartPlaceholder}>
            {Object.keys(objectifsSBTParAnnee).length > 0 ? (
              Object.entries(objectifsSBTParAnnee)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([year, target], idx) => {
                  const isCurrentYear = parseInt(year) === currentYear;
                  return (
                    <View key={year} style={styles.barContainer}>
                      <Text style={[styles.barLabel, { fontWeight: isCurrentYear ? 'bold' : 'normal' }]}>
                        {year} {isCurrentYear ? '(actuel)' : ''}
                      </Text>
                      <View style={styles.barWrapper}>
                        <View style={[styles.bar, { 
                          width: `${Math.min(100, (target / (previousTonnes || totalTonnes * 1.5)) * 100)}%`,
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
                  <Text style={styles.barLabel}>2023 (Base)</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '100%', backgroundColor: colors.grayLight }]} />
                  </View>
                  <Text style={styles.barValue}>{(previousTonnes || totalTonnes * 1.2).toFixed(0)} tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={[styles.barLabel, { fontWeight: 'bold' }]}>2025 (Actuel)</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '75%', backgroundColor: colors.emerald }]} />
                  </View>
                  <Text style={styles.barValue}>{totalTonnes.toFixed(0)} tCO₂e</Text>
                </View>
                <View style={styles.barContainer}>
                  <Text style={styles.barLabel}>2030 (Objectif)</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { width: '50%', backgroundColor: colors.blue }]} />
                  </View>
                  <Text style={styles.barValue}>{(totalTonnes * 0.5).toFixed(0)} tCO₂e</Text>
                </View>
              </>
            )}
          </View>
          <Text style={[styles.paragraph, { marginTop: 10 }]}>
            L'objectif SBTi prévoit une réduction de 50% des émissions d'ici 2030 par rapport à l'année de référence.
            Cela correspond à un taux de réduction annuel moyen de 7%.
          </Text>
        </View>

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
          
          <View style={{ marginTop: 15 }}>
            <Text style={styles.paragraph}>
              <Text style={{ fontWeight: 'bold' }}>Positionnement : </Text>
              {emissionsPerEmployee < moyenneSectorielle ? (
                <>
                  L'entreprise se positionne dans le Top 25% de son secteur avec une performance 
                  {' '}{((1 - emissionsPerEmployee / moyenneSectorielle) * 100).toFixed(0)}% meilleure que la moyenne.
                </>
              ) : (
                <>
                  L'entreprise se situe au-dessus de la moyenne sectorielle, avec un potentiel de réduction 
                  de {((emissionsPerEmployee / moyenneSectorielle - 1) * 100).toFixed(0)}% pour atteindre la moyenne.
                </>
              )}
            </Text>
          </View>

          <View style={{ marginTop: 15, flexDirection: 'row', gap: 15 }}>
            <View style={{ flex: 1, padding: 10, backgroundColor: colors.emeraldLight, borderRadius: 6 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.emeraldDark }}>Top 10% du secteur</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.emeraldDark, marginTop: 4 }}>
                {(moyenneSectorielle * 0.3).toFixed(1)} tCO₂e/employé
              </Text>
            </View>
            <View style={{ flex: 1, padding: 10, backgroundColor: colors.orangeLight, borderRadius: 6 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.orange }}>Seuil critique</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.orange, marginTop: 4 }}>
                {(moyenneSectorielle * 1.5).toFixed(1)} tCO₂e/employé
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Document confidentiel - Généré par GreenInsight</Text>
          <Text style={styles.pageNumber}>4 / 5</Text>
        </View>
      </Page>

      {/* Page 5: Strategic Action Plan */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>4. Plan d'Action Stratégique</Text>
          <Text style={styles.headerPage}>Roadmap Décarbonation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feuille de Route {currentYear}-{currentYear + 3}</Text>
          
          {actions.length > 0 ? (
            actions.slice(0, 8).map((action, idx) => (
              <View key={action.id} style={[
                styles.roadmapItem,
                action.status === 'completed' && styles.roadmapItemCompleted,
                action.status === 'delayed' && styles.roadmapItemDelayed,
              ]}>
                <View style={styles.roadmapContent}>
                  <Text style={styles.roadmapTitle}>
                    {idx + 1}. {action.title}
                  </Text>
                  <Text style={styles.roadmapDescription}>{action.description}</Text>
                  <View style={styles.roadmapMeta}>
                    <Text style={styles.roadmapMetaItem}>
                      📊 Réduction: {action.estimatedReduction}%
                    </Text>
                    <Text style={styles.roadmapMetaItem}>
                      📅 Échéance: {action.deadline ? format(new Date(action.deadline), 'MMM yyyy', { locale: fr }) : 'À définir'}
                    </Text>
                    <Text style={[styles.roadmapMetaItem, { 
                      color: action.priority === 'high' ? colors.red : 
                             action.priority === 'medium' ? colors.orange : colors.grayLight 
                    }]}>
                      ⚡ Priorité: {action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <>
              <View style={styles.roadmapItem}>
                <View style={styles.roadmapContent}>
                  <Text style={styles.roadmapTitle}>1. Optimisation énergétique des bâtiments</Text>
                  <Text style={styles.roadmapDescription}>Audit énergétique et mise en place de solutions d'efficacité</Text>
                  <View style={styles.roadmapMeta}>
                    <Text style={styles.roadmapMetaItem}>📊 Réduction: 15%</Text>
                    <Text style={styles.roadmapMetaItem}>📅 Échéance: Q2 {currentYear + 1}</Text>
                    <Text style={[styles.roadmapMetaItem, { color: colors.red }]}>⚡ Priorité: Haute</Text>
                  </View>
                </View>
              </View>
              <View style={styles.roadmapItem}>
                <View style={styles.roadmapContent}>
                  <Text style={styles.roadmapTitle}>2. Transition énergies renouvelables</Text>
                  <Text style={styles.roadmapDescription}>Contrats PPA solaire et éolien pour 100% électricité verte</Text>
                  <View style={styles.roadmapMeta}>
                    <Text style={styles.roadmapMetaItem}>📊 Réduction: 25%</Text>
                    <Text style={styles.roadmapMetaItem}>📅 Échéance: Q4 {currentYear + 1}</Text>
                    <Text style={[styles.roadmapMetaItem, { color: colors.red }]}>⚡ Priorité: Haute</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.roadmapItem, styles.roadmapItemDelayed]}>
                <View style={styles.roadmapContent}>
                  <Text style={styles.roadmapTitle}>3. Électrification de la flotte</Text>
                  <Text style={styles.roadmapDescription}>Remplacement progressif par véhicules électriques</Text>
                  <View style={styles.roadmapMeta}>
                    <Text style={styles.roadmapMetaItem}>📊 Réduction: 20%</Text>
                    <Text style={styles.roadmapMetaItem}>📅 Échéance: Q2 {currentYear + 2}</Text>
                    <Text style={[styles.roadmapMetaItem, { color: colors.orange }]}>⚡ Priorité: Moyenne</Text>
                  </View>
                </View>
              </View>
              <View style={styles.roadmapItem}>
                <View style={styles.roadmapContent}>
                  <Text style={styles.roadmapTitle}>4. Programme achats responsables</Text>
                  <Text style={styles.roadmapDescription}>Critères carbone dans la sélection fournisseurs</Text>
                  <View style={styles.roadmapMeta}>
                    <Text style={styles.roadmapMetaItem}>📊 Réduction: 10%</Text>
                    <Text style={styles.roadmapMetaItem}>📅 Échéance: Q1 {currentYear + 2}</Text>
                    <Text style={[styles.roadmapMetaItem, { color: colors.orange }]}>⚡ Priorité: Moyenne</Text>
                  </View>
                </View>
              </View>
              <View style={styles.roadmapItem}>
                <View style={styles.roadmapContent}>
                  <Text style={styles.roadmapTitle}>5. Mobilité durable collaborateurs</Text>
                  <Text style={styles.roadmapDescription}>Forfait mobilités durables et télétravail structuré</Text>
                  <View style={styles.roadmapMeta}>
                    <Text style={styles.roadmapMetaItem}>📊 Réduction: 8%</Text>
                    <Text style={styles.roadmapMetaItem}>📅 Échéance: Q3 {currentYear + 1}</Text>
                    <Text style={[styles.roadmapMetaItem, { color: colors.grayLight }]}>⚡ Priorité: Basse</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Synthèse du Plan</Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={{ flex: 1, padding: 12, backgroundColor: colors.emeraldLight, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.emeraldDark }}>
                {actions.length > 0 ? actions.length : 5}
              </Text>
              <Text style={{ fontSize: 9, color: colors.emeraldDark }}>Actions planifiées</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: colors.background, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.grayDark }}>
                -{actions.length > 0 ? actions.reduce((sum, a) => sum + a.estimatedReduction, 0) : 78}%
              </Text>
              <Text style={{ fontSize: 9, color: colors.gray }}>Réduction cumulée visée</Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: colors.orangeLight, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.orange }}>
                {currentYear + 3}
              </Text>
              <Text style={{ fontSize: 9, color: colors.orange }}>Horizon cible</Text>
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
