import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

export const CSRDChecker = () => {
  const [formData, setFormData] = useState({
    employees: "",
    revenue: "",
    totalAssets: "",
    isListed: false,
    hasSubsidiaries: false,
    sector: "",
    currentYear: "2024",
    hasCurrentReporting: false,
    reportingStandard: ""
  });

  const [complianceResult, setComplianceResult] = useState<any>(null);

  const checkCSRDCompliance = () => {
    const employees = parseInt(formData.employees) || 0;
    const revenue = parseFloat(formData.revenue) || 0;
    const assets = parseFloat(formData.totalAssets) || 0;

    // Critères CSRD
    const largeCompanyCriteria = {
      employees: employees >= 250,
      revenue: revenue >= 50, // en millions d'euros
      assets: assets >= 25 // en millions d'euros
    };

    // Au moins 2 critères sur 3 pour être considéré comme grande entreprise
    const meetsLargeCriteria = Object.values(largeCompanyCriteria).filter(Boolean).length >= 2;
    
    // Déterminer l'obligation CSRD
    let isSubjectToCSRD = false;
    let applicationDate = "";
    let reasoning = "";

    if (formData.isListed) {
      isSubjectToCSRD = true;
      applicationDate = "1er janvier 2025";
      reasoning = "Entreprise cotée en bourse";
    } else if (meetsLargeCriteria) {
      isSubjectToCSRD = true;
      applicationDate = "1er janvier 2026";
      reasoning = "Grande entreprise (2+ critères sur 3)";
    } else {
      isSubjectToCSRD = false;
      reasoning = "Non soumise aux obligations CSRD actuelles";
    }

    // Évaluation de la préparation
    const preparationFactors = {
      hasCurrentReporting: formData.hasCurrentReporting,
      hasReportingStandard: !!formData.reportingStandard,
      hasSustainabilityStrategy: formData.sector !== "",
      hasDataCollection: employees > 0 && revenue > 0
    };

    const preparationScore = Object.values(preparationFactors).filter(Boolean).length;
    const preparationPercentage = (preparationScore / 4) * 100;

    // Déterminer le niveau de préparation
    let preparationLevel = "";
    let preparationColor = "";
    
    if (preparationPercentage >= 75) {
      preparationLevel = "Bien préparé";
      preparationColor = "text-green-600";
    } else if (preparationPercentage >= 50) {
      preparationLevel = "Partiellement préparé";
      preparationColor = "text-orange-500";
    } else {
      preparationLevel = "Préparation nécessaire";
      preparationColor = "text-red-600";
    }

    // Estimation des coûts de mise en conformité
    const baseCost = employees * 150; // 150€ par employé
    const consultingCost = revenue * 0.001; // 0.1% du CA
    const totalCost = Math.min(baseCost + consultingCost, 500000); // Plafonné à 500k€

    const result = {
      isSubjectToCSRD,
      applicationDate,
      reasoning,
      meetsLargeCriteria,
      criteriaDetails: largeCompanyCriteria,
      preparationLevel,
      preparationColor,
      preparationPercentage,
      preparationFactors,
      estimatedCost: Math.round(totalCost),
      timeToCompliance: isSubjectToCSRD ? calculateTimeToComplianceLocal(applicationDate) : null
    };

    setComplianceResult(result);
    
    toast.success("Vérification CSRD terminée !", {
      description: isSubjectToCSRD ? `Soumis à CSRD - Application ${applicationDate}` : "Non soumis aux obligations CSRD"
    });
  };

  const calculateTimeToComplianceLocal = (applicationDate: string) => {
    const targetDate = new Date(applicationDate);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, diffMonths);
  };

  const sectors = [
    { value: "manufacturing", label: "Industrie manufacturière" },
    { value: "energy", label: "Énergie" },
    { value: "finance", label: "Services financiers" },
    { value: "retail", label: "Commerce de détail" },
    { value: "construction", label: "Construction & BTP" },
    { value: "technology", label: "Technologies" },
    { value: "transport", label: "Transport & logistique" },
    { value: "healthcare", label: "Santé" },
    { value: "other", label: "Autre" }
  ];

  const reportingStandards = [
    { value: "gri", label: "GRI (Global Reporting Initiative)" },
    { value: "sasb", label: "SASB (Sustainability Accounting Standards Board)" },
    { value: "tcfd", label: "TCFD (Task Force on Climate-related Financial Disclosures)" },
    { value: "integrated", label: "Rapport intégré" },
    { value: "other", label: "Autre standard" },
    { value: "none", label: "Aucun standard formalisé" }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Vérifier la conformité CSRD
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            CSRD Checker - Corporate Sustainability Reporting Directive
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>CSRD</strong> : Directive européenne sur la publication d'informations en matière de durabilité. 
                Remplace la NFRD et étend les obligations de reporting ESG.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Critères d'éligibilité</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="employees">Nombre d'employés</Label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="ex: 300"
                  value={formData.employees}
                  onChange={(e) => setFormData({...formData, employees: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="revenue">Chiffre d'affaires (M€)</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="ex: 60"
                  value={formData.revenue}
                  onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="assets">Total bilan (M€)</Label>
                <Input
                  id="assets"
                  type="number"
                  placeholder="ex: 30"
                  value={formData.totalAssets}
                  onChange={(e) => setFormData({...formData, totalAssets: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sector">Secteur d'activité</Label>
                <Select value={formData.sector} onValueChange={(value) => setFormData({...formData, sector: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.value} value={sector.value}>
                        {sector.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reportingStandard">Standard de reporting actuel</Label>
                <Select value={formData.reportingStandard} onValueChange={(value) => setFormData({...formData, reportingStandard: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Standard utilisé" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportingStandards.map((standard) => (
                      <SelectItem key={standard.value} value={standard.value}>
                        {standard.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="listed"
                checked={formData.isListed}
                onCheckedChange={(checked) => setFormData({...formData, isListed: checked as boolean})}
              />
              <Label htmlFor="listed" className="text-sm">
                Entreprise cotée en bourse
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="subsidiaries"
                checked={formData.hasSubsidiaries}
                onCheckedChange={(checked) => setFormData({...formData, hasSubsidiaries: checked as boolean})}
              />
              <Label htmlFor="subsidiaries" className="text-sm">
                Possession de filiales européennes
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="currentReporting"
                checked={formData.hasCurrentReporting}
                onCheckedChange={(checked) => setFormData({...formData, hasCurrentReporting: checked as boolean})}
              />
              <Label htmlFor="currentReporting" className="text-sm">
                Réalise déjà un reporting de durabilité
              </Label>
            </div>
          </div>

          <Button onClick={checkCSRDCompliance} className="w-full" size="lg">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Vérifier la conformité CSRD
          </Button>

          {complianceResult && (
            <Card className="p-6 bg-accent/5 border-accent/20">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {complianceResult.isSubjectToCSRD ? (
                      <AlertCircle className="w-6 h-6 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                    <h3 className="text-lg font-semibold text-foreground">
                      Résultat de l'évaluation CSRD
                    </h3>
                  </div>
                  
                  <div className={`text-xl font-bold ${complianceResult.isSubjectToCSRD ? 'text-orange-600' : 'text-green-600'}`}>
                    {complianceResult.isSubjectToCSRD ? 'Soumis à CSRD' : 'Non soumis à CSRD'}
                  </div>
                  
                  <p className="text-muted-foreground mt-2">
                    {complianceResult.reasoning}
                  </p>
                  
                  {complianceResult.isSubjectToCSRD && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          Application obligatoire : {complianceResult.applicationDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {complianceResult.isSubjectToCSRD && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Critères de grande entreprise</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className={`text-center p-3 rounded-lg ${complianceResult.criteriaDetails.employees ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className={`text-sm font-medium ${complianceResult.criteriaDetails.employees ? 'text-green-800' : 'text-red-800'}`}>
                            ≥ 250 employés
                          </div>
                          <div className={`text-xs ${complianceResult.criteriaDetails.employees ? 'text-green-600' : 'text-red-600'}`}>
                            {complianceResult.criteriaDetails.employees ? '✓ Validé' : '✗ Non validé'}
                          </div>
                        </div>
                        
                        <div className={`text-center p-3 rounded-lg ${complianceResult.criteriaDetails.revenue ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className={`text-sm font-medium ${complianceResult.criteriaDetails.revenue ? 'text-green-800' : 'text-red-800'}`}>
                            ≥ 50 M€ CA
                          </div>
                          <div className={`text-xs ${complianceResult.criteriaDetails.revenue ? 'text-green-600' : 'text-red-600'}`}>
                            {complianceResult.criteriaDetails.revenue ? '✓ Validé' : '✗ Non validé'}
                          </div>
                        </div>
                        
                        <div className={`text-center p-3 rounded-lg ${complianceResult.criteriaDetails.assets ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className={`text-sm font-medium ${complianceResult.criteriaDetails.assets ? 'text-green-800' : 'text-red-800'}`}>
                            ≥ 25 M€ bilan
                          </div>
                          <div className={`text-xs ${complianceResult.criteriaDetails.assets ? 'text-green-600' : 'text-red-600'}`}>
                            {complianceResult.criteriaDetails.assets ? '✓ Validé' : '✗ Non validé'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-foreground">Niveau de préparation</h4>
                        <span className={`font-semibold ${complianceResult.preparationColor}`}>
                          {complianceResult.preparationLevel}
                        </span>
                      </div>
                      <Progress value={complianceResult.preparationPercentage} className="h-3" />
                      <div className="text-sm text-muted-foreground text-center">
                        {complianceResult.preparationPercentage}% de préparation
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`flex items-center gap-2 ${complianceResult.preparationFactors.hasCurrentReporting ? 'text-green-600' : 'text-red-600'}`}>
                          {complianceResult.preparationFactors.hasCurrentReporting ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          Reporting actuel
                        </div>
                        <div className={`flex items-center gap-2 ${complianceResult.preparationFactors.hasReportingStandard ? 'text-green-600' : 'text-red-600'}`}>
                          {complianceResult.preparationFactors.hasReportingStandard ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          Standard défini
                        </div>
                        <div className={`flex items-center gap-2 ${complianceResult.preparationFactors.hasSustainabilityStrategy ? 'text-green-600' : 'text-red-600'}`}>
                          {complianceResult.preparationFactors.hasSustainabilityStrategy ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          Stratégie RSE
                        </div>
                        <div className={`flex items-center gap-2 ${complianceResult.preparationFactors.hasDataCollection ? 'text-green-600' : 'text-red-600'}`}>
                          {complianceResult.preparationFactors.hasDataCollection ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          Collecte de données
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-background rounded-lg border">
                        <div className="text-2xl font-bold text-primary">
                          {complianceResult.estimatedCost.toLocaleString()}€
                        </div>
                        <div className="text-sm text-muted-foreground">Coût estimé de mise en conformité</div>
                      </div>
                      
                      {complianceResult.timeToCompliance && (
                        <div className="text-center p-4 bg-background rounded-lg border">
                          <div className="text-2xl font-bold text-orange-600">
                            {complianceResult.timeToCompliance}
                          </div>
                          <div className="text-sm text-muted-foreground">Mois restants pour se préparer</div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Plan d'action recommandé
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {complianceResult.isSubjectToCSRD ? (
                      <>
                        <li>• Audit de l'existant et identification des gaps</li>
                        <li>• Formation des équipes aux standards ESRS</li>
                        <li>• Mise en place d'un système de collecte de données ESG</li>
                        <li>• Définition de la stratégie de durabilité et des objectifs</li>
                        <li>• Préparation du premier rapport de durabilité</li>
                        <li>• Audit externe et publication du rapport</li>
                      </>
                    ) : (
                      <>
                        <li>• Surveiller l'évolution de la taille de l'entreprise</li>
                        <li>• Anticiper une éventuelle application future</li>
                        <li>• Considérer un reporting volontaire pour l'avantage concurrentiel</li>
                        <li>• Préparer les processus internes pour une croissance future</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};