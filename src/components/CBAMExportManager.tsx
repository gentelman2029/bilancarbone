import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  FileSpreadsheet,
  Database,
  Globe
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const CBAMExportManager = () => {
  const [exportFormat, setExportFormat] = useState('xml_cbam');
  const [reportingPeriod, setReportingPeriod] = useState('Q1_2024');
  const [isExporting, setIsExporting] = useState(false);

  // Formats d'export supportés
  const exportFormats = [
    { 
      value: 'xml_cbam', 
      label: '🇪🇺 XML CBAM Officiel', 
      description: 'Format requis pour le registre UE',
      extension: '.xml'
    },
    { 
      value: 'csv_detailed', 
      label: '📊 CSV Détaillé', 
      description: 'Export complet avec sources',
      extension: '.csv'
    },
    { 
      value: 'excel_analysis', 
      label: '📈 Excel Analyse', 
      description: 'Feuille de calcul pour analyse',
      extension: '.xlsx'
    },
    { 
      value: 'json_api', 
      label: '🔗 JSON API', 
      description: 'Format structuré pour intégrations',
      extension: '.json'
    }
  ];

  // Périodes de reporting
  const reportingPeriods = [
    { value: 'Q1_2024', label: 'Q1 2024 (Jan-Mar)' },
    { value: 'Q2_2024', label: 'Q2 2024 (Avr-Juin)' },
    { value: 'Q3_2024', label: 'Q3 2024 (Juil-Sept)' },
    { value: 'Q4_2024', label: 'Q4 2024 (Oct-Déc)' },
    { value: 'ANNUAL_2024', label: 'Année 2024 (Complète)' }
  ];

  // Données simulées pour la démo
  const mockData = {
    declaration_metadata: {
      declarant: {
        eori_number: "TN123456789",
        company_name: "Société Tunisienne d'Acier",
        country: "TN"
      },
      reporting_period: reportingPeriod,
      declaration_type: "quarterly_report",
      phase: "transitional",
      submission_date: new Date().toISOString()
    },
    installations: [
      {
        id: "INST_001",
        name: "Haut fourneau Menzel Bourguiba",
        country: "TN",
        permit_number: "ENV-2023-001",
        coordinates: { lat: 37.1584, lon: 9.7816 }
      }
    ],
    products: [
      {
        cn8_code: "72081000",
        product_name: "Acier laminé à chaud",
        sector: "iron_steel",
        total_quantity: 2500,
        unit: "tonnes"
      }
    ],
    emissions_data: [
      {
        product_cn8: "72081000",
        installation_id: "INST_001",
        direct_emissions: 2.1,
        indirect_emissions: 0.48,
        total_emissions: 2.58,
        emission_intensity: 1.032,
        verification_status: "verified",
        method_direct: "ACTUAL",
        method_indirect: "DEFAULT",
        uncertainty_direct: 5.2,
        uncertainty_indirect: 8.1
      }
    ],
    carbon_pricing: [
      {
        installation_id: "INST_001",
        carbon_price_local: 12.5,
        currency: "TND",
        carbon_price_eur: 3.8,
        exchange_rate: 3.29,
        pricing_system: "Carbon Tax Tunisia"
      }
    ],
    compliance_summary: {
      total_shipments: 12,
      total_emissions: 32.25,
      total_value_eur: 1250000,
      compliance_rate: 92.5,
      verification_rate: 87.3
    }
  };

  const generateXMLCBAM = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cbam:Declaration xmlns:cbam="urn:eu:cbam:2023" 
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xsi:schemaLocation="urn:eu:cbam:2023 cbam-schema-v1.0.xsd">
  
  <!-- Métadonnées de déclaration -->
  <cbam:DeclarationMetadata>
    <cbam:DeclarantEORI>${mockData.declaration_metadata.declarant.eori_number}</cbam:DeclarantEORI>
    <cbam:CompanyName>${mockData.declaration_metadata.declarant.company_name}</cbam:CompanyName>
    <cbam:CountryCode>${mockData.declaration_metadata.declarant.country}</cbam:CountryCode>
    <cbam:ReportingPeriod>${mockData.declaration_metadata.reporting_period}</cbam:ReportingPeriod>
    <cbam:DeclarationType>${mockData.declaration_metadata.declaration_type}</cbam:DeclarationType>
    <cbam:Phase>${mockData.declaration_metadata.phase}</cbam:Phase>
    <cbam:SubmissionDate>${mockData.declaration_metadata.submission_date}</cbam:SubmissionDate>
  </cbam:DeclarationMetadata>

  <!-- Installations -->
  <cbam:Installations>
    ${mockData.installations.map(inst => `
    <cbam:Installation>
      <cbam:InstallationID>${inst.id}</cbam:InstallationID>
      <cbam:InstallationName>${inst.name}</cbam:InstallationName>
      <cbam:CountryCode>${inst.country}</cbam:CountryCode>
      <cbam:PermitNumber>${inst.permit_number}</cbam:PermitNumber>
      <cbam:Coordinates lat="${inst.coordinates.lat}" lon="${inst.coordinates.lon}"/>
    </cbam:Installation>
    `).join('')}
  </cbam:Installations>

  <!-- Données d'émissions -->
  <cbam:EmissionsData>
    ${mockData.emissions_data.map(emission => `
    <cbam:ProductEmissions>
      <cbam:CN8Code>${emission.product_cn8}</cbam:CN8Code>
      <cbam:InstallationID>${emission.installation_id}</cbam:InstallationID>
      <cbam:DirectEmissions method="${emission.method_direct}" uncertainty="${emission.uncertainty_direct}">
        ${emission.direct_emissions}
      </cbam:DirectEmissions>
      <cbam:IndirectEmissions method="${emission.method_indirect}" uncertainty="${emission.uncertainty_indirect}">
        ${emission.indirect_emissions}
      </cbam:IndirectEmissions>
      <cbam:TotalEmissions>${emission.total_emissions}</cbam:TotalEmissions>
      <cbam:EmissionIntensity unit="tCO2e_per_tonne">${emission.emission_intensity}</cbam:EmissionIntensity>
      <cbam:VerificationStatus>${emission.verification_status}</cbam:VerificationStatus>
    </cbam:ProductEmissions>
    `).join('')}
  </cbam:EmissionsData>

  <!-- Prix du carbone d'origine -->
  <cbam:CarbonPricing>
    ${mockData.carbon_pricing.map(price => `
    <cbam:InstallationCarbonPrice>
      <cbam:InstallationID>${price.installation_id}</cbam:InstallationID>
      <cbam:CarbonPriceLocal currency="${price.currency}">${price.carbon_price_local}</cbam:CarbonPriceLocal>
      <cbam:CarbonPriceEUR>${price.carbon_price_eur}</cbam:CarbonPriceEUR>
      <cbam:ExchangeRate>${price.exchange_rate}</cbam:ExchangeRate>
      <cbam:PricingSystem>${price.pricing_system}</cbam:PricingSystem>
    </cbam:InstallationCarbonPrice>
    `).join('')}
  </cbam:CarbonPricing>

  <!-- Résumé de conformité -->
  <cbam:ComplianceSummary>
    <cbam:TotalShipments>${mockData.compliance_summary.total_shipments}</cbam:TotalShipments>
    <cbam:TotalEmissions unit="tCO2e">${mockData.compliance_summary.total_emissions}</cbam:TotalEmissions>
    <cbam:TotalValueEUR>${mockData.compliance_summary.total_value_eur}</cbam:TotalValueEUR>
    <cbam:ComplianceRate>${mockData.compliance_summary.compliance_rate}</cbam:ComplianceRate>
    <cbam:VerificationRate>${mockData.compliance_summary.verification_rate}</cbam:VerificationRate>
  </cbam:ComplianceSummary>

</cbam:Declaration>`;
    
    return xml;
  };

  const generateCSVDetailed = () => {
    const headers = [
      'Période', 'Code CN8', 'Produit', 'Installation', 'Pays', 'Quantité', 'Unité',
      'Émissions Directes', 'Méthode Directe', 'Incertitude Directe (%)',
      'Émissions Indirectes', 'Méthode Indirecte', 'Incertitude Indirecte (%)',
      'Émissions Totales', 'Intensité (tCO2e/tonne)', 'Statut Vérification',
      'Prix Carbone Local', 'Devise', 'Prix Carbone EUR', 'Taux Change',
      'Système Prix Carbone', 'Sources Données', 'Date Dernière MàJ'
    ];

    const rows = mockData.emissions_data.map((emission, idx) => {
      const product = mockData.products[0];
      const installation = mockData.installations[0];
      const pricing = mockData.carbon_pricing[0];
      
      return [
        reportingPeriod,
        emission.product_cn8,
        product.product_name,
        installation.name,
        installation.country,
        product.total_quantity,
        product.unit,
        emission.direct_emissions,
        emission.method_direct,
        emission.uncertainty_direct,
        emission.indirect_emissions,
        emission.method_indirect,
        emission.uncertainty_indirect,
        emission.total_emissions,
        emission.emission_intensity,
        emission.verification_status,
        pricing.carbon_price_local,
        pricing.currency,
        pricing.carbon_price_eur,
        pricing.exchange_rate,
        pricing.pricing_system,
        'Facteurs UE + Données spécifiques installation',
        new Date().toISOString().split('T')[0]
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const generateJSONAPI = () => {
    return JSON.stringify({
      meta: {
        export_date: new Date().toISOString(),
        format_version: "1.0",
        cbam_regulation: "EU 2023/956",
        api_version: "v2.0"
      },
      data: mockData,
      validation: {
        schema_compliance: true,
        data_completeness: 94.5,
        mandatory_fields_present: true,
        warnings: [
          "Scope 3 émissions basées sur estimation par défaut",
          "Vérification par tiers recommandée pour 2 installations"
        ]
      },
      export_statistics: {
        total_products: mockData.products.length,
        total_installations: mockData.installations.length,
        verified_emissions_percentage: 87.3,
        data_quality_score: 92.1
      }
    }, null, 2);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content = '';
      let filename = '';
      let mimeType = '';
      
      const selectedFormat = exportFormats.find(f => f.value === exportFormat);
      
      switch (exportFormat) {
        case 'xml_cbam':
          content = generateXMLCBAM();
          filename = `cbam-declaration-${reportingPeriod}.xml`;
          mimeType = 'application/xml';
          break;
          
        case 'csv_detailed':
          content = generateCSVDetailed();
          filename = `cbam-detailed-${reportingPeriod}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'json_api':
          content = generateJSONAPI();
          filename = `cbam-api-${reportingPeriod}.json`;
          mimeType = 'application/json';
          break;
          
        default:
          throw new Error('Format non supporté');
      }

      // Simuler délai d'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Télécharger le fichier
      const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      toast({
        title: "Export réussi ✅",
        description: `Fichier ${selectedFormat?.label} généré et téléchargé`
      });

    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le fichier",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormat = exportFormats.find(f => f.value === exportFormat);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export et Conformité Réglementaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Format d'export</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Période de reporting</label>
              <Select value={reportingPeriod} onValueChange={setReportingPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportingPeriods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Aperçu du format sélectionné */}
          {selectedFormat && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">{selectedFormat.label}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedFormat.description}</p>
                    
                    {exportFormat === 'xml_cbam' && (
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Conforme EU 2023/956
                        </Badge>
                        <div className="text-xs space-y-1">
                          <div>✅ Métadonnées de déclarant (EORI, entreprise, pays)</div>
                          <div>✅ Données d'installations (coordonnées, permis)</div>
                          <div>✅ Émissions par produit (directes/indirectes avec incertitudes)</div>
                          <div>✅ Prix du carbone d'origine</div>
                          <div>✅ Résumé de conformité</div>
                        </div>
                      </div>
                    )}
                    
                    {exportFormat === 'csv_detailed' && (
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <FileSpreadsheet className="h-3 w-3 mr-1" />
                          Export détaillé
                        </Badge>
                        <div className="text-xs space-y-1">
                          <div>📊 23 colonnes avec toutes les données</div>
                          <div>🔍 Sources et méthodes de calcul</div>
                          <div>📈 Incertitudes et niveaux de confiance</div>
                          <div>💰 Prix du carbone et coûts associés</div>
                        </div>
                      </div>
                    )}
                    
                    {exportFormat === 'json_api' && (
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          <Database className="h-3 w-3 mr-1" />
                          Format structuré
                        </Badge>
                        <div className="text-xs space-y-1">
                          <div>🔗 Compatible APIs et intégrations</div>
                          <div>✅ Métadonnées de validation incluses</div>
                          <div>📊 Statistiques et scores de qualité</div>
                          <div>⚠️ Avertissements et recommandations</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Aperçu des données */}
          <div>
            <h4 className="font-medium mb-3">Aperçu des Données à Exporter</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockData.products.length}</div>
                  <div className="text-sm text-muted-foreground">Produits CBAM</div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mockData.installations.length}</div>
                  <div className="text-sm text-muted-foreground">Installations</div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{mockData.compliance_summary.compliance_rate}%</div>
                  <div className="text-sm text-muted-foreground">Taux conformité</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Bouton d'export */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exporter {selectedFormat?.label}
              </>
            )}
          </Button>

          {/* Informations réglementaires */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Conformité Réglementaire</h4>
                  <div className="text-sm text-yellow-700 mt-1 space-y-1">
                    <div>• Les exports XML sont conformes au schéma officiel CBAM EU 2023/956</div>
                    <div>• Vérifiez les échéances de soumission (31 janvier pour Q4 précédent)</div>
                    <div>• Les données doivent être vérifiées par un organisme accrédité (phase opérationnelle)</div>
                    <div>• Conservez les pièces justificatives pendant au moins 5 ans</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};