import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, Zap, Car, Plane, Building } from "lucide-react";
import { toast } from "sonner";

export const QuickCarbonCalculator = () => {
  const [formData, setFormData] = useState({
    employees: "",
    electricityConsumption: "",
    gasConsumption: "",
    fuelConsumption: "",
    businessTrips: "",
    companySize: "pme"
  });

  const [result, setResult] = useState<number | null>(null);

  // Facteurs d'émission simplifiés (kgCO2e)
  const emissionFactors = {
    electricity: 0.057, // kgCO2e/kWh (mix électrique français)
    gas: 0.227, // kgCO2e/kWh
    fuel: 2.31, // kgCO2e/L
    businessTrip: 0.258, // kgCO2e/km (avion moyen)
    employeeBase: 2.5 // tCO2e/employé/an (base)
  };

  const calculateEmissions = () => {
    const employees = parseInt(formData.employees) || 0;
    const electricity = parseFloat(formData.electricityConsumption) || 0;
    const gas = parseFloat(formData.gasConsumption) || 0;
    const fuel = parseFloat(formData.fuelConsumption) || 0;
    const trips = parseFloat(formData.businessTrips) || 0;

    // Calculs des émissions (en tCO2e)
    const electricityEmissions = (electricity * emissionFactors.electricity) / 1000;
    const gasEmissions = (gas * emissionFactors.gas) / 1000;
    const fuelEmissions = (fuel * emissionFactors.fuel) / 1000;
    const tripEmissions = (trips * emissionFactors.businessTrip) / 1000;
    const baseEmissions = employees * emissionFactors.employeeBase;

    const totalEmissions = electricityEmissions + gasEmissions + fuelEmissions + tripEmissions + baseEmissions;
    
    setResult(Math.round(totalEmissions * 10) / 10);
    
    toast.success("Calcul effectué !", {
      description: `Votre empreinte carbone estimée : ${Math.round(totalEmissions * 10) / 10} tCO2e/an`
    });
  };

  const getEmissionLevel = (emissions: number) => {
    if (emissions < 50) return { level: "Faible", color: "text-green-600", description: "Votre empreinte est relativement faible" };
    if (emissions < 200) return { level: "Modérée", color: "text-orange-500", description: "Empreinte dans la moyenne des PME" };
    return { level: "Élevée", color: "text-red-600", description: "Potentiel d'amélioration important" };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          Accéder au calculateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculateur Carbone Rapide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employees">Nombre d'employés</Label>
              <Input
                id="employees"
                type="number"
                placeholder="ex: 25"
                value={formData.employees}
                onChange={(e) => setFormData({...formData, employees: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="companySize">Taille d'entreprise</Label>
              <Select value={formData.companySize} onValueChange={(value) => setFormData({...formData, companySize: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="pme">PME</SelectItem>
                  <SelectItem value="eti">ETI</SelectItem>
                  <SelectItem value="grande">Grande entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Consommations énergétiques (annuelles)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="electricity">Électricité (kWh/an)</Label>
                <Input
                  id="electricity"
                  type="number"
                  placeholder="ex: 50000"
                  value={formData.electricityConsumption}
                  onChange={(e) => setFormData({...formData, electricityConsumption: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="gas">Gaz (kWh/an)</Label>
                <Input
                  id="gas"
                  type="number"
                  placeholder="ex: 25000"
                  value={formData.gasConsumption}
                  onChange={(e) => setFormData({...formData, gasConsumption: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Transport et déplacements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuel">Carburant flotte (L/an)</Label>
                <Input
                  id="fuel"
                  type="number"
                  placeholder="ex: 5000"
                  value={formData.fuelConsumption}
                  onChange={(e) => setFormData({...formData, fuelConsumption: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="trips">Voyages d'affaires (km/an)</Label>
                <Input
                  id="trips"
                  type="number"
                  placeholder="ex: 15000"
                  value={formData.businessTrips}
                  onChange={(e) => setFormData({...formData, businessTrips: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button onClick={calculateEmissions} className="w-full" size="lg">
            <Calculator className="w-4 h-4 mr-2" />
            Calculer mon empreinte carbone
          </Button>

          {result !== null && (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {result} tCO2e/an
                </div>
                <div className={`text-lg font-semibold ${getEmissionLevel(result).color}`}>
                  Niveau : {getEmissionLevel(result).level}
                </div>
                <p className="text-muted-foreground">
                  {getEmissionLevel(result).description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {Math.round(result / parseInt(formData.employees || "1") * 10) / 10}
                    </div>
                    <div className="text-sm text-muted-foreground">tCO2e/employé</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {Math.round(result * 2.3 * 10) / 10}€
                    </div>
                    <div className="text-sm text-muted-foreground">Coût carbone estimé</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-accent/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Recommandation :</strong> Commencez par un audit détaillé pour identifier 
                    les postes d'émissions prioritaires et définir un plan de réduction.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};