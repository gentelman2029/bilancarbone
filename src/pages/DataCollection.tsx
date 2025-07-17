import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Calculator, FileSpreadsheet, Zap, Car, Trash2 } from "lucide-react";

export const DataCollection = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Collecte de données GES</h1>
        <p className="text-muted-foreground">Saisissez vos données d'émissions par scope</p>
      </div>

      <Tabs defaultValue="scope1" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scope1" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Scope 1</span>
          </TabsTrigger>
          <TabsTrigger value="scope2" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Scope 2</span>
          </TabsTrigger>
          <TabsTrigger value="scope3" className="flex items-center space-x-2">
            <Car className="w-4 h-4" />
            <span>Scope 3</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scope1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span>Saisie manuelle - Combustibles</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fuel-type">Type de combustible</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un combustible" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas">Gaz naturel</SelectItem>
                      <SelectItem value="fuel">Fioul domestique</SelectItem>
                      <SelectItem value="propane">Propane</SelectItem>
                      <SelectItem value="butane">Butane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantité consommée</Label>
                  <div className="flex space-x-2">
                    <Input id="quantity" placeholder="0" type="number" />
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kwh">kWh</SelectItem>
                        <SelectItem value="m3">m³</SelectItem>
                        <SelectItem value="liters">Litres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="period">Période</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Période de consommation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="eco" className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculer les émissions
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-accent" />
                <span>Import de fichiers</span>
              </h3>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Glissez vos fichiers Excel/CSV ici ou cliquez pour sélectionner
                </p>
                <Button variant="outline">
                  Choisir des fichiers
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Formats acceptés: .xlsx, .csv</p>
                <p>Taille max: 10MB</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scope2">
          <Card className="p-6 bg-gradient-card border shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Consommation électrique</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="electricity">Consommation électrique (kWh)</Label>
                  <Input id="electricity" placeholder="0" type="number" />
                </div>
                <div>
                  <Label htmlFor="provider">Fournisseur d'énergie</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edf">EDF</SelectItem>
                      <SelectItem value="engie">Engie</SelectItem>
                      <SelectItem value="total">Total Direct Energie</SelectItem>
                      <SelectItem value="green">Fournisseur vert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="renewable">% Énergies renouvelables</Label>
                  <Input id="renewable" placeholder="0" type="number" max="100" />
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pays/Région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="france">France</SelectItem>
                      <SelectItem value="germany">Allemagne</SelectItem>
                      <SelectItem value="uk">Royaume-Uni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button variant="eco" className="w-full mt-6">
              <Calculator className="w-4 h-4 mr-2" />
              Calculer les émissions Scope 2
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="scope3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Car className="w-5 h-5 text-primary" />
                <span>Transport</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transport-type">Type de transport</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Voiture particulière</SelectItem>
                      <SelectItem value="truck">Camion</SelectItem>
                      <SelectItem value="plane">Avion</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input id="distance" placeholder="0" type="number" />
                </div>
                <div>
                  <Label htmlFor="frequency">Fréquence</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Fréquence d'utilisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="yearly">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-primary" />
                <span>Déchets</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="waste-type">Type de déchet</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie de déchet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paper">Papier/Carton</SelectItem>
                      <SelectItem value="plastic">Plastique</SelectItem>
                      <SelectItem value="organic">Organique</SelectItem>
                      <SelectItem value="mixed">Mélangé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="waste-quantity">Quantité (kg)</Label>
                  <Input id="waste-quantity" placeholder="0" type="number" />
                </div>
                <div>
                  <Label htmlFor="treatment">Traitement</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de traitement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recycling">Recyclage</SelectItem>
                      <SelectItem value="incineration">Incinération</SelectItem>
                      <SelectItem value="landfill">Enfouissement</SelectItem>
                      <SelectItem value="composting">Compostage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};