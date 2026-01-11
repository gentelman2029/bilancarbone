import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';

export interface BenchmarkConfig {
  avgScore: number;
  topScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  source: string;
}

interface BenchmarkConfigModalProps {
  sector: string;
  sectorLabel: string;
  currentConfig: BenchmarkConfig;
  onSave: (config: BenchmarkConfig) => void;
}

const STORAGE_KEY_PREFIX = 'esg_benchmark_config_';

export const getBenchmarkConfig = (sector: string, defaults: BenchmarkConfig): BenchmarkConfig => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${sector}`);
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error loading benchmark config:', e);
  }
  return defaults;
};

export const saveBenchmarkConfig = (sector: string, config: BenchmarkConfig): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${sector}`, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving benchmark config:', e);
  }
};

export const BenchmarkConfigModal: React.FC<BenchmarkConfigModalProps> = ({
  sector,
  sectorLabel,
  currentConfig,
  onSave,
}) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<BenchmarkConfig>(currentConfig);

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  const handleSave = () => {
    saveBenchmarkConfig(sector, config);
    onSave(config);
    setOpen(false);
  };

  const handleReset = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${sector}`);
    // Reset will be handled by parent component reloading defaults
    setOpen(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurer Benchmark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuration du Benchmark</DialogTitle>
          <DialogDescription>
            Personnalisez les valeurs de référence pour le secteur "{sectorLabel}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Global Scores */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Scores Globaux</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avgScore">Moyenne du Secteur</Label>
                <Input
                  id="avgScore"
                  type="number"
                  min="0"
                  max="100"
                  value={config.avgScore}
                  onChange={(e) => setConfig({ ...config, avgScore: Number(e.target.value) })}
                  placeholder="ex: 45"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topScore">Score Top 10%</Label>
                <Input
                  id="topScore"
                  type="number"
                  min="0"
                  max="100"
                  value={config.topScore}
                  onChange={(e) => setConfig({ ...config, topScore: Number(e.target.value) })}
                  placeholder="ex: 80"
                />
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Moyennes par Catégorie</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eScore">Environnement</Label>
                <Input
                  id="eScore"
                  type="number"
                  min="0"
                  max="100"
                  value={config.eScore}
                  onChange={(e) => setConfig({ ...config, eScore: Number(e.target.value) })}
                  placeholder="ex: 38"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sScore">Social</Label>
                <Input
                  id="sScore"
                  type="number"
                  min="0"
                  max="100"
                  value={config.sScore}
                  onChange={(e) => setConfig({ ...config, sScore: Number(e.target.value) })}
                  placeholder="ex: 50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gScore">Gouvernance</Label>
                <Input
                  id="gScore"
                  type="number"
                  min="0"
                  max="100"
                  value={config.gScore}
                  onChange={(e) => setConfig({ ...config, gScore: Number(e.target.value) })}
                  placeholder="ex: 48"
                />
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source des données</Label>
            <Input
              id="source"
              type="text"
              value={config.source}
              onChange={(e) => setConfig({ ...config, source: e.target.value })}
              placeholder="ex: Étude Sectorielle APII 2024"
            />
            <p className="text-xs text-muted-foreground">
              Laissez vide pour afficher "Données simulées à titre indicatif"
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={handleReset} className="mr-auto">
            Réinitialiser
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
