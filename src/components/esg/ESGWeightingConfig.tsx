import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings2, AlertTriangle, Check, Info } from 'lucide-react';

export type WeightingMode = 'standard' | 'sectoriel' | 'expert';

export interface WeightingConfig {
  mode: WeightingMode;
  sector?: string;
  environmentWeight: number;
  socialWeight: number;
  governanceWeight: number;
}

interface ESGWeightingConfigProps {
  config: WeightingConfig;
  onConfigChange: (config: WeightingConfig) => void;
}

// Presets sectoriels basés sur SASB/GRI
const SECTOR_PRESETS: Record<string, { e: number; s: number; g: number; label: string }> = {
  banque: { e: 20, s: 30, g: 50, label: 'Banque & Finance' },
  services: { e: 25, s: 35, g: 40, label: 'Services' },
  tourisme: { e: 35, s: 40, g: 25, label: 'Tourisme & Hôtellerie' },
  electronique: { e: 30, s: 35, g: 35, label: 'Électronique & Électrique' },
  textile: { e: 50, s: 30, g: 20, label: 'Textile & Habillement' },
  agroalimentaire: { e: 45, s: 35, g: 20, label: 'Agroalimentaire' },
  chimie: { e: 55, s: 25, g: 20, label: 'Chimie & Pharmacie' },
  mecanique: { e: 45, s: 30, g: 25, label: 'Industries Mécaniques' },
  materiaux: { e: 55, s: 25, g: 20, label: 'Matériaux de Construction' },
  energie: { e: 60, s: 20, g: 20, label: 'Énergie' },
};

export const ESGWeightingConfig: React.FC<ESGWeightingConfigProps> = ({
  config,
  onConfigChange,
}) => {
  const [localConfig, setLocalConfig] = useState<WeightingConfig>(config);
  const totalWeight = localConfig.environmentWeight + localConfig.socialWeight + localConfig.governanceWeight;
  const isValid = Math.abs(totalWeight - 100) < 0.1;

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleModeChange = (mode: WeightingMode) => {
    let newConfig: WeightingConfig = { ...localConfig, mode };

    if (mode === 'standard') {
      newConfig = {
        ...newConfig,
        environmentWeight: 33.33,
        socialWeight: 33.33,
        governanceWeight: 33.34,
      };
    } else if (mode === 'sectoriel' && localConfig.sector) {
      const preset = SECTOR_PRESETS[localConfig.sector];
      if (preset) {
        newConfig = {
          ...newConfig,
          environmentWeight: preset.e,
          socialWeight: preset.s,
          governanceWeight: preset.g,
        };
      }
    }

    setLocalConfig(newConfig);
    if (mode !== 'expert' || isValid) {
      onConfigChange(newConfig);
    }
  };

  const handleSectorChange = (sector: string) => {
    const preset = SECTOR_PRESETS[sector];
    if (preset) {
      const newConfig = {
        ...localConfig,
        sector,
        environmentWeight: preset.e,
        socialWeight: preset.s,
        governanceWeight: preset.g,
      };
      setLocalConfig(newConfig);
      onConfigChange(newConfig);
    }
  };

  const handleWeightChange = (field: 'environmentWeight' | 'socialWeight' | 'governanceWeight', value: number) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    
    const newTotal = newConfig.environmentWeight + newConfig.socialWeight + newConfig.governanceWeight;
    if (Math.abs(newTotal - 100) < 0.1) {
      onConfigChange(newConfig);
    }
  };

  const getModeIcon = (mode: WeightingMode) => {
    switch (mode) {
      case 'standard': return '⚖️';
      case 'sectoriel': return '🏭';
      case 'expert': return '🎯';
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Configuration des Pondérations ESG
        </CardTitle>
        <CardDescription>
          Définissez la matrice de matérialité selon votre secteur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <RadioGroup
          value={localConfig.mode}
          onValueChange={(value) => handleModeChange(value as WeightingMode)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
              <span>{getModeIcon('standard')}</span>
              <div>
                <div className="font-medium">Standard</div>
                <div className="text-xs text-muted-foreground">Équipondéré (33/33/33)</div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sectoriel" id="sectoriel" />
            <Label htmlFor="sectoriel" className="flex items-center gap-2 cursor-pointer">
              <span>{getModeIcon('sectoriel')}</span>
              <div>
                <div className="font-medium">Sectoriel</div>
                <div className="text-xs text-muted-foreground">Presets SASB/GRI</div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expert" id="expert" />
            <Label htmlFor="expert" className="flex items-center gap-2 cursor-pointer">
              <span>{getModeIcon('expert')}</span>
              <div>
                <div className="font-medium">Expert</div>
                <div className="text-xs text-muted-foreground">Personnalisé</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* Sector Selection for Sectoriel Mode */}
        {localConfig.mode === 'sectoriel' && (
          <div className="space-y-2">
            <Label>Secteur d'activité</Label>
            <Select
              value={localConfig.sector || ''}
              onValueChange={handleSectorChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un secteur" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SECTOR_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    {preset.label} (E:{preset.e}% S:{preset.s}% G:{preset.g}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 mt-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Suggestion basée sur les standards SASB/GRI
              </p>
            </div>
          </div>
        )}

        {/* Weight Sliders */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Pondérations</Label>
            <Badge variant={isValid ? 'default' : 'destructive'}>
              Total: {totalWeight.toFixed(1)}%
            </Badge>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Environnement (E)
              </Label>
              <span className="text-sm font-medium">{localConfig.environmentWeight.toFixed(1)}%</span>
            </div>
            <Slider
              value={[localConfig.environmentWeight]}
              onValueChange={([v]) => handleWeightChange('environmentWeight', v)}
              max={100}
              min={0}
              step={1}
              disabled={localConfig.mode !== 'expert'}
              className="[&_[role=slider]]:bg-emerald-500"
            />
          </div>

          {/* Social */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Social (S)
              </Label>
              <span className="text-sm font-medium">{localConfig.socialWeight.toFixed(1)}%</span>
            </div>
            <Slider
              value={[localConfig.socialWeight]}
              onValueChange={([v]) => handleWeightChange('socialWeight', v)}
              max={100}
              min={0}
              step={1}
              disabled={localConfig.mode !== 'expert'}
              className="[&_[role=slider]]:bg-blue-500"
            />
          </div>

          {/* Governance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Gouvernance (G)
              </Label>
              <span className="text-sm font-medium">{localConfig.governanceWeight.toFixed(1)}%</span>
            </div>
            <Slider
              value={[localConfig.governanceWeight]}
              onValueChange={([v]) => handleWeightChange('governanceWeight', v)}
              max={100}
              min={0}
              step={1}
              disabled={localConfig.mode !== 'expert'}
              className="[&_[role=slider]]:bg-purple-500"
            />
          </div>

          {/* Validation Alert */}
          {!isValid && localConfig.mode === 'expert' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Le total des pondérations doit être égal à 100% (actuellement {totalWeight.toFixed(1)}%)
              </AlertDescription>
            </Alert>
          )}

          {isValid && (
            <Alert className="border-emerald-500/30 bg-emerald-500/5">
              <Check className="h-4 w-4 text-emerald-500" />
              <AlertDescription className="text-emerald-600">
                Configuration valide - Les scores ESG seront calculés avec ces pondérations
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
