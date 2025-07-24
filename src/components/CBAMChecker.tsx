import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";

export const CBAMChecker = () => {
  const [formData, setFormData] = useState({
    sector: "",
    importVolume: "",
    originCountry: "",
    currentCarbonPrice: "",
    hasLocalCertification: false,
    productType: ""
  });

  const [assessment, setAssessment] = useState<any>(null);

  // Prix CBAM estimés par secteur (€/tCO2e)
  const cbamPrices = {
    cement: 85,
    iron_steel: 90,
    aluminum: 95,
    fertilizers: 80,
    electricity: 85,
    hydrogen: 100
  };

  // Facteurs d'émission moyens par secteur (tCO2e/tonne)
  const emissionFactors = {
    cement: 0.75,
    iron_steel: 2.1,
    aluminum: 8.5,
    fertilizers: 2.8,
    electricity: 0.4, // tCO2e/MWh
    hydrogen: 9.3
  };

  // Pays et leurs prix carbone actuels (€/tCO2e)
  const countryCarbonPrices = {
    china: 8,
    india: 2,
    russia: 3,
    turkey: 15,
    ukraine: 0,
    usa: 25,
    brazil: 5
  };

  const calculateCBAMImpact = () => {
    if (!formData.sector || !formData.importVolume || !formData.originCountry) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const volume = parseFloat(formData.importVolume);
    const sectorEmissionFactor = emissionFactors[formData.sector as keyof typeof emissionFactors];
    const cbamPrice = cbamPrices[formData.sector as keyof typeof cbamPrices];
    const localCarbonPrice = countryCarbonPrices[formData.originCountry as keyof typeof countryCarbonPrices];
    
    // Calcul des émissions totales
    const totalEmissions = volume * sectorEmissionFactor;
    
    // Coût CBAM total
    const cbamCostTotal = totalEmissions * cbamPrice;
    
    // Crédit pour prix carbone local (si certification)
    const localCarbonCredit = formData.hasLocalCertification ? totalEmissions * localCarbonPrice : 0;
    
    // Coût net CBAM
    const netCBAMCost = Math.max(0, cbamCostTotal - localCarbonCredit);
    
    // Impact sur le prix du produit (en %)
    const productValue = volume * 1000; // Estimation: 1000€/tonne
    const priceImpact = (netCBAMCost / productValue) * 100;

    const result = {
      totalEmissions: Math.round(totalEmissions),
      cbamCostTotal: Math.round(cbamCostTotal),
      localCarbonCredit: Math.round(localCarbonCredit),
      netCBAMCost: Math.round(netCBAMCost),
      priceImpact: Math.round(priceImpact * 10) / 10,
      riskLevel: priceImpact > 15 ? "Élevé" : priceImpact > 5 ? "Modéré" : "Faible"
    };

    setAssessment(result);
    
    toast.success("Évaluation CBAM terminée !", {
      description: `Coût estimé : ${result.netCBAMCost.toLocaleString()}€/an`
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Élevé": return "text-red-600";
      case "Modéré": return "text-orange-500";
      default: return "text-green-600";
    }
  };

  const sectors = [
    { value: "cement", label: "Ciment" },
    { value: "iron_steel", label: "Fer et acier" },
    { value: "aluminum", label: "Aluminium" },
    { value: "fertilizers", label: "Engrais" },
    { value: "electricity", label: "Électricité" },
    { value: "hydrogen", label: "Hydrogène" }
  ];

  const countries = [
    { value: "china", label: "Chine" },
    { value: "india", label: "Inde" },
    { value: "russia", label: "Russie" },
    { value: "turkey", label: "Turquie" },
    { value: "ukraine", label: "Ukraine" },
    { value: "usa", label: "États-Unis" },
    { value: "brazil", label: "Brésil" }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <DollarSign className="w-4 h-4 mr-2" />
          Évaluer les coûts CBAM
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            CBAM Checker - Mécanisme d'Ajustement Carbone aux Frontières
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>CBAM</strong> : Mécanisme européen entré en vigueur pour taxer les importations à fort contenu carbone. 
                Phase transitoire jusqu'en 2026, puis taxation effective.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sector">Secteur d'activité *</Label>
              <Select value={formData.sector} onValueChange={(value) => setFormData({...formData, sector: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un secteur" />
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
              <Label htmlFor="volume">Volume d'import annuel (tonnes) *</Label>
              <Input
                id="volume"
                type="number"
                placeholder="ex: 1000"
                value={formData.importVolume}
                onChange={(e) => setFormData({...formData, importVolume: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Pays d'origine *</Label>
              <Select value={formData.originCountry} onValueChange={(value) => setFormData({...formData, originCountry: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pays d'origine" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="productType">Type de produit</Label>
              <Input
                id="productType"
                placeholder="ex: Acier inoxydable"
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="certification"
                checked={formData.hasLocalCertification}
                onCheckedChange={(checked) => setFormData({...formData, hasLocalCertification: checked as boolean})}
              />
              <Label htmlFor="certification" className="text-sm">
                Le fournisseur possède une certification carbone locale reconnue
              </Label>
            </div>
          </div>

          <Button onClick={calculateCBAMImpact} className="w-full" size="lg">
            <DollarSign className="w-4 h-4 mr-2" />
            Évaluer l'impact CBAM
          </Button>

          {assessment && (
            <Card className="p-6 bg-accent/5 border-accent/20">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Évaluation CBAM
                  </h3>
                  <div className={`text-xl font-bold ${getRiskColor(assessment.riskLevel)}`}>
                    Niveau de risque : {assessment.riskLevel}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {assessment.totalEmissions.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">tCO2e/an</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {assessment.netCBAMCost.toLocaleString()}€
                    </div>
                    <div className="text-sm text-muted-foreground">Coût CBAM net</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coût CBAM brut :</span>
                    <span className="font-semibold">{assessment.cbamCostTotal.toLocaleString()}€</span>
                  </div>
                  {assessment.localCarbonCredit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crédit carbone local :</span>
                      <span className="font-semibold text-green-600">-{assessment.localCarbonCredit.toLocaleString()}€</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Impact sur le prix :</span>
                    <span className="font-semibold">{assessment.priceImpact}%</span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recommandations
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {assessment.riskLevel === "Élevé" ? (
                      <>
                        <li>• Négocier avec des fournisseurs bas-carbone</li>
                        <li>• Diversifier les sources d'approvisionnement</li>
                        <li>• Investir dans des alternatives locales</li>
                        <li>• Planifier la hausse des coûts dès 2026</li>
                      </>
                    ) : assessment.riskLevel === "Modéré" ? (
                      <>
                        <li>• Surveiller l'évolution des prix CBAM</li>
                        <li>• Encourager la certification carbone des fournisseurs</li>
                        <li>• Anticiper les évolutions réglementaires</li>
                      </>
                    ) : (
                      <>
                        <li>• Maintenir la surveillance des coûts</li>
                        <li>• Capitaliser sur votre avantage concurrentiel</li>
                        <li>• Communiquer sur votre performance carbone</li>
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