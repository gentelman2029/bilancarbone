import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, Zap, Car } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const QuickCarbonCalculator = () => {
  const { t } = useTranslation();
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
    
    toast.success(t('quick_calculator.calculation_done'), {
      description: `${t('quick_calculator.estimated_footprint')} : ${Math.round(totalEmissions * 10) / 10} tCO2e/an`
    });
  };

  const getEmissionLevel = (emissions: number) => {
    if (emissions < 50) return { level: t('quick_calculator.low'), color: "text-green-600", description: t('quick_calculator.low_desc') };
    if (emissions < 200) return { level: t('quick_calculator.moderate'), color: "text-orange-500", description: t('quick_calculator.moderate_desc') };
    return { level: t('quick_calculator.high'), color: "text-red-600", description: t('quick_calculator.high_desc') };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          {t('quick_calculator.access')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            {t('quick_calculator.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employees">{t('quick_calculator.employees')}</Label>
              <Input
                id="employees"
                type="number"
                placeholder="ex: 25"
                value={formData.employees}
                onChange={(e) => setFormData({...formData, employees: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="companySize">{t('quick_calculator.company_size')}</Label>
              <Select value={formData.companySize} onValueChange={(value) => setFormData({...formData, companySize: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">{t('quick_calculator.company_sizes.startup')}</SelectItem>
                  <SelectItem value="pme">{t('quick_calculator.company_sizes.pme')}</SelectItem>
                  <SelectItem value="eti">{t('quick_calculator.company_sizes.eti')}</SelectItem>
                  <SelectItem value="grande">{t('quick_calculator.company_sizes.grande')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {t('quick_calculator.energy_consumption')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="electricity">{t('quick_calculator.electricity')}</Label>
                <Input
                  id="electricity"
                  type="number"
                  placeholder="ex: 50000"
                  value={formData.electricityConsumption}
                  onChange={(e) => setFormData({...formData, electricityConsumption: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="gas">{t('quick_calculator.gas')}</Label>
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
              {t('quick_calculator.transport')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuel">{t('quick_calculator.fuel_fleet')}</Label>
                <Input
                  id="fuel"
                  type="number"
                  placeholder="ex: 5000"
                  value={formData.fuelConsumption}
                  onChange={(e) => setFormData({...formData, fuelConsumption: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="trips">{t('quick_calculator.business_trips')}</Label>
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
            {t('quick_calculator.calculate_footprint')}
          </Button>

          {result !== null && (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {result} tCO2e/an
                </div>
                <div className={`text-lg font-semibold ${getEmissionLevel(result).color}`}>
                  {t('quick_calculator.level')} : {getEmissionLevel(result).level}
                </div>
                <p className="text-muted-foreground">
                  {getEmissionLevel(result).description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {Math.round(result / parseInt(formData.employees || "1") * 10) / 10}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('quick_calculator.per_employee')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {Math.round(result * 2.3 * 10) / 10}€
                    </div>
                    <div className="text-sm text-muted-foreground">{t('quick_calculator.carbon_cost')}</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-accent/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>{t('quick_calculator.recommendation')} :</strong> {t('quick_calculator.recommendation_text')}
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