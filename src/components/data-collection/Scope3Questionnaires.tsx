// Module Questionnaires Scope 3 - Collecte de données qualitatives
import { useState } from 'react';
import { ClipboardList, Users, Car, Utensils, Plane, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { activityDataService } from '@/lib/dataCollection/activityService';

interface Scope3QuestionnairesProps {
  onDataSubmitted?: () => void;
}

// Emission factors for common scenarios (ADEME Base Carbone)
const COMMUTING_FACTORS = {
  car_solo: 0.218,      // kgCO2/km
  car_carpool_2: 0.109, // kgCO2/km
  car_carpool_3: 0.073, // kgCO2/km
  electric_car: 0.02,   // kgCO2/km
  bus: 0.103,           // kgCO2/km
  metro: 0.003,         // kgCO2/km
  train: 0.003,         // kgCO2/km
  bike: 0,              // kgCO2/km
  walking: 0,           // kgCO2/km
  electric_bike: 0.005, // kgCO2/km
};

const MEAL_FACTORS = {
  meat_heavy: 6.3,      // kgCO2/meal
  meat_light: 3.5,      // kgCO2/meal
  vegetarian: 1.5,      // kgCO2/meal
  vegan: 0.8,           // kgCO2/meal
};

const BUSINESS_TRAVEL_FACTORS = {
  flight_short: 0.255,   // kgCO2/km (<1000km)
  flight_medium: 0.187,  // kgCO2/km (1000-3500km)
  flight_long: 0.152,    // kgCO2/km (>3500km)
  train: 0.003,          // kgCO2/km
  car: 0.218,            // kgCO2/km
};

interface CommutingData {
  employeeCount: number;
  avgDistance: number;
  workDaysPerYear: number;
  transportMode: keyof typeof COMMUTING_FACTORS;
  remoteWorkDays: number;
}

interface MealData {
  employeeCount: number;
  mealsPerWeek: number;
  weeksPerYear: number;
  mealType: keyof typeof MEAL_FACTORS;
}

interface BusinessTravelData {
  travelType: keyof typeof BUSINESS_TRAVEL_FACTORS;
  totalKm: number;
  trips: number;
}

export function Scope3Questionnaires({ onDataSubmitted }: Scope3QuestionnairesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Commuting form state
  const [commuting, setCommuting] = useState<CommutingData>({
    employeeCount: 50,
    avgDistance: 15,
    workDaysPerYear: 220,
    transportMode: 'car_solo',
    remoteWorkDays: 2,
  });

  // Meals form state
  const [meals, setMeals] = useState<MealData>({
    employeeCount: 50,
    mealsPerWeek: 5,
    weeksPerYear: 46,
    mealType: 'meat_light',
  });

  // Business travel state
  const [travel, setTravel] = useState<BusinessTravelData>({
    travelType: 'train',
    totalKm: 5000,
    trips: 20,
  });

  // Calculate emissions
  const calculateCommutingEmissions = (): number => {
    const effectiveWorkDays = commuting.workDaysPerYear * (1 - commuting.remoteWorkDays / 5);
    const totalKm = commuting.employeeCount * commuting.avgDistance * 2 * effectiveWorkDays;
    return totalKm * COMMUTING_FACTORS[commuting.transportMode];
  };

  const calculateMealEmissions = (): number => {
    const totalMeals = meals.employeeCount * meals.mealsPerWeek * meals.weeksPerYear;
    return totalMeals * MEAL_FACTORS[meals.mealType];
  };

  const calculateTravelEmissions = (): number => {
    return travel.totalKm * BUSINESS_TRAVEL_FACTORS[travel.travelType];
  };

  // Submit data
  const handleSubmitCommuting = async () => {
    setIsSubmitting(true);
    try {
      const emissions = calculateCommutingEmissions();
      const effectiveWorkDays = commuting.workDaysPerYear * (1 - commuting.remoteWorkDays / 5);
      const totalKm = commuting.employeeCount * commuting.avgDistance * 2 * effectiveWorkDays;
      
      // Utiliser createValidated pour que les données soient immédiatement validées
      await activityDataService.createValidated({
        organization_id: undefined,
        source_type: 'questionnaire',
        source_reference: 'Questionnaire - Déplacements domicile-travail',
        period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        period_end: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
        ghg_scope: 'scope3',
        ghg_category: 'deplacements_domicile_travail',
        quantity: totalKm,
        unit: 'km',
        emission_factor_value: COMMUTING_FACTORS[commuting.transportMode],
        emission_factor_unit: 'kgCO2e/km',
        emission_factor_source: 'ADEME Base Carbone',
        co2_equivalent_kg: emissions,
      } as any);

      toast.success('Données validées', {
        description: `${(emissions / 1000).toFixed(2)} t CO₂e ajoutées au Scope 3`
      });
      
      onDataSubmitted?.();
    } catch (error) {
      console.error('Error submitting commuting data:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMeals = async () => {
    setIsSubmitting(true);
    try {
      const emissions = calculateMealEmissions();
      const totalMeals = meals.employeeCount * meals.mealsPerWeek * meals.weeksPerYear;
      
      // Utiliser createValidated pour que les données soient immédiatement validées
      await activityDataService.createValidated({
        organization_id: undefined,
        source_type: 'questionnaire',
        source_reference: 'Questionnaire - Repas des salariés',
        period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        period_end: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
        ghg_scope: 'scope3',
        ghg_category: 'repas_salaries',
        quantity: totalMeals,
        unit: 'repas',
        emission_factor_value: MEAL_FACTORS[meals.mealType],
        emission_factor_unit: 'kgCO2e/repas',
        emission_factor_source: 'ADEME Base Carbone',
        co2_equivalent_kg: emissions,
      } as any);

      toast.success('Données validées', {
        description: `${(emissions / 1000).toFixed(2)} t CO₂e ajoutées au Scope 3`
      });
      
      onDataSubmitted?.();
    } catch (error) {
      console.error('Error submitting meals data:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTravel = async () => {
    setIsSubmitting(true);
    try {
      const emissions = calculateTravelEmissions();
      
      // Utiliser createValidated pour que les données soient immédiatement validées
      await activityDataService.createValidated({
        organization_id: undefined,
        source_type: 'questionnaire',
        source_reference: 'Questionnaire - Déplacements professionnels',
        period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        period_end: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
        ghg_scope: 'scope3',
        ghg_category: 'deplacements_professionnels',
        quantity: travel.totalKm,
        unit: 'km',
        emission_factor_value: BUSINESS_TRAVEL_FACTORS[travel.travelType],
        emission_factor_unit: 'kgCO2e/km',
        emission_factor_source: 'ADEME Base Carbone',
        co2_equivalent_kg: emissions,
      } as any);

      toast.success('Données validées', {
        description: `${(emissions / 1000).toFixed(2)} t CO₂e ajoutées au Scope 3`
      });
      
      onDataSubmitted?.();
    } catch (error) {
      console.error('Error submitting travel data:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Questionnaires Scope 3
        </CardTitle>
        <CardDescription>
          Collectez les données qualitatives pour les catégories difficiles à facturer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="commuting" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3" aria-label="Types de questionnaires">
            <TabsTrigger value="commuting" className="flex items-center gap-2" aria-label="Déplacements domicile-travail">
              <Car className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Domicile-Travail</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex items-center gap-2" aria-label="Repas des salariés">
              <Utensils className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Repas</span>
            </TabsTrigger>
            <TabsTrigger value="travel" className="flex items-center gap-2" aria-label="Déplacements professionnels">
              <Plane className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Voyages Pro</span>
            </TabsTrigger>
          </TabsList>

          {/* Commuting Tab */}
          <TabsContent value="commuting" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Nombre de salariés</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={commuting.employeeCount}
                  onChange={(e) => setCommuting({ ...commuting, employeeCount: parseInt(e.target.value) || 0 })}
                  aria-label="Nombre de salariés"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgDistance">Distance moyenne (km aller)</Label>
                <Input
                  id="avgDistance"
                  type="number"
                  value={commuting.avgDistance}
                  onChange={(e) => setCommuting({ ...commuting, avgDistance: parseFloat(e.target.value) || 0 })}
                  aria-label="Distance moyenne en kilomètres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportMode">Mode de transport dominant</Label>
                <Select
                  value={commuting.transportMode}
                  onValueChange={(v) => setCommuting({ ...commuting, transportMode: v as keyof typeof COMMUTING_FACTORS })}
                >
                  <SelectTrigger id="transportMode" aria-label="Mode de transport">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car_solo">Voiture seul</SelectItem>
                    <SelectItem value="car_carpool_2">Covoiturage (2 pers.)</SelectItem>
                    <SelectItem value="car_carpool_3">Covoiturage (3+ pers.)</SelectItem>
                    <SelectItem value="electric_car">Voiture électrique</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="metro">Métro/Tram</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bike">Vélo</SelectItem>
                    <SelectItem value="electric_bike">Vélo électrique</SelectItem>
                    <SelectItem value="walking">Marche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jours de télétravail/semaine: {commuting.remoteWorkDays}</Label>
                <Slider
                  value={[commuting.remoteWorkDays]}
                  onValueChange={([v]) => setCommuting({ ...commuting, remoteWorkDays: v })}
                  max={5}
                  step={0.5}
                  aria-label="Nombre de jours de télétravail par semaine"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Émissions estimées</p>
                <p className="text-2xl font-bold text-primary">
                  {(calculateCommutingEmissions() / 1000).toFixed(2)} t CO₂e/an
                </p>
              </div>
              <Button onClick={handleSubmitCommuting} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mealEmployees">Nombre de salariés</Label>
                <Input
                  id="mealEmployees"
                  type="number"
                  value={meals.employeeCount}
                  onChange={(e) => setMeals({ ...meals, employeeCount: parseInt(e.target.value) || 0 })}
                  aria-label="Nombre de salariés"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mealsPerWeek">Repas pris sur site/semaine</Label>
                <Input
                  id="mealsPerWeek"
                  type="number"
                  value={meals.mealsPerWeek}
                  onChange={(e) => setMeals({ ...meals, mealsPerWeek: parseInt(e.target.value) || 0 })}
                  aria-label="Nombre de repas par semaine"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="mealType">Type de repas dominant</Label>
                <Select
                  value={meals.mealType}
                  onValueChange={(v) => setMeals({ ...meals, mealType: v as keyof typeof MEAL_FACTORS })}
                >
                  <SelectTrigger id="mealType" aria-label="Type de repas">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meat_heavy">Riche en viande rouge</SelectItem>
                    <SelectItem value="meat_light">Mixte (viande blanche)</SelectItem>
                    <SelectItem value="vegetarian">Végétarien</SelectItem>
                    <SelectItem value="vegan">Végan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Émissions estimées</p>
                <p className="text-2xl font-bold text-primary">
                  {(calculateMealEmissions() / 1000).toFixed(2)} t CO₂e/an
                </p>
              </div>
              <Button onClick={handleSubmitMeals} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </TabsContent>

          {/* Business Travel Tab */}
          <TabsContent value="travel" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="travelType">Type de déplacement</Label>
                <Select
                  value={travel.travelType}
                  onValueChange={(v) => setTravel({ ...travel, travelType: v as keyof typeof BUSINESS_TRAVEL_FACTORS })}
                >
                  <SelectTrigger id="travelType" aria-label="Type de déplacement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight_short">Vol court (&lt;1000km)</SelectItem>
                    <SelectItem value="flight_medium">Vol moyen (1000-3500km)</SelectItem>
                    <SelectItem value="flight_long">Vol long (&gt;3500km)</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="car">Voiture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalKm">Distance totale (km/an)</Label>
                <Input
                  id="totalKm"
                  type="number"
                  value={travel.totalKm}
                  onChange={(e) => setTravel({ ...travel, totalKm: parseInt(e.target.value) || 0 })}
                  aria-label="Distance totale en kilomètres par an"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trips">Nombre de voyages</Label>
                <Input
                  id="trips"
                  type="number"
                  value={travel.trips}
                  onChange={(e) => setTravel({ ...travel, trips: parseInt(e.target.value) || 0 })}
                  aria-label="Nombre de voyages"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Émissions estimées</p>
                <p className="text-2xl font-bold text-primary">
                  {(calculateTravelEmissions() / 1000).toFixed(2)} t CO₂e/an
                </p>
              </div>
              <Button onClick={handleSubmitTravel} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
