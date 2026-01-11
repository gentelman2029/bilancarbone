import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Stakeholder, 
  StakeholderCategory, 
  DialogueMode,
  STAKEHOLDER_CATEGORIES, 
  DIALOGUE_MODES 
} from '@/lib/rse/types';
import { Save, Trash2, Gauge, Target } from 'lucide-react';

interface StakeholderEditPanelProps {
  stakeholder: Stakeholder | null;
  open: boolean;
  onClose: () => void;
  onSave: (stakeholder: Stakeholder) => void;
  onDelete?: (id: string) => void;
}

export function StakeholderEditPanel({ 
  stakeholder, 
  open, 
  onClose, 
  onSave,
  onDelete 
}: StakeholderEditPanelProps) {
  const [formData, setFormData] = useState<Stakeholder | null>(null);

  useEffect(() => {
    if (stakeholder) {
      setFormData({ ...stakeholder });
    }
  }, [stakeholder]);

  if (!formData) return null;

  const handlePowerChange = (value: number[]) => {
    setFormData(prev => prev ? { ...prev, power: value[0] } : null);
  };

  const handleInterestChange = (value: number[]) => {
    setFormData(prev => prev ? { ...prev, interest: value[0] } : null);
  };

  const getEngagementFromScores = (power: number, interest: number): 'inform' | 'consult' | 'involve' | 'collaborate' => {
    if (power >= 50 && interest >= 50) return 'collaborate';
    if (power >= 50 && interest < 50) return 'consult';
    if (power < 50 && interest >= 50) return 'involve';
    return 'inform';
  };

  const getQuadrantInfo = (power: number, interest: number) => {
    if (power >= 50 && interest >= 50) {
      return { label: 'Collaborer étroitement', color: 'bg-emerald-500', description: 'Pouvoir élevé + Intérêt élevé' };
    }
    if (power >= 50 && interest < 50) {
      return { label: 'Satisfaire', color: 'bg-amber-500', description: 'Pouvoir élevé + Intérêt faible' };
    }
    if (power < 50 && interest >= 50) {
      return { label: 'Tenir informé', color: 'bg-blue-500', description: 'Pouvoir faible + Intérêt élevé' };
    }
    return { label: 'Surveiller', color: 'bg-slate-500', description: 'Pouvoir faible + Intérêt faible' };
  };

  const handleSave = () => {
    if (formData) {
      const updatedStakeholder = {
        ...formData,
        engagement: getEngagementFromScores(formData.power, formData.interest)
      };
      onSave(updatedStakeholder);
      onClose();
    }
  };

  const quadrantInfo = getQuadrantInfo(formData.power, formData.interest);
  const categoryInfo = STAKEHOLDER_CATEGORIES[formData.category];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: categoryInfo?.color }}
            />
            {formData.name}
          </SheetTitle>
          <SheetDescription>{formData.description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              style={{ borderColor: categoryInfo?.color, color: categoryInfo?.color }}
            >
              {categoryInfo?.label}
            </Badge>
            <Badge className={quadrantInfo.color}>
              {quadrantInfo.label}
            </Badge>
          </div>

          <Separator />

          {/* Power Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 font-semibold">
                <Gauge className="h-4 w-4 text-primary" />
                Pouvoir (Influence)
              </Label>
              <span className="text-lg font-bold text-primary">{formData.power}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Capacité de la partie prenante à impacter l'entreprise
            </p>
            <Slider
              value={[formData.power]}
              onValueChange={handlePowerChange}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Faible</span>
              <span>Moyen</span>
              <span>Élevé</span>
            </div>
          </div>

          {/* Interest Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 font-semibold">
                <Target className="h-4 w-4 text-primary" />
                Intérêt
              </Label>
              <span className="text-lg font-bold text-primary">{formData.interest}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Niveau d'intérêt de la partie prenante pour les activités de l'entreprise
            </p>
            <Slider
              value={[formData.interest]}
              onValueChange={handleInterestChange}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Faible</span>
              <span>Moyen</span>
              <span>Élevé</span>
            </div>
          </div>

          {/* Quadrant Result */}
          <div className={`p-4 rounded-lg ${quadrantInfo.color} bg-opacity-10 border`} style={{ borderColor: quadrantInfo.color.replace('bg-', '') }}>
            <p className="text-sm font-medium">Stratégie recommandée</p>
            <p className="text-lg font-bold">{quadrantInfo.label}</p>
            <p className="text-xs text-muted-foreground">{quadrantInfo.description}</p>
          </div>

          <Separator />

          {/* Dialogue Mode */}
          <div className="space-y-2">
            <Label>Mode de Dialogue</Label>
            <Select
              value={formData.dialogueMode || 'meeting'}
              onValueChange={(value: DialogueMode) => 
                setFormData(prev => prev ? { ...prev, dialogueMode: value } : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un mode" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIALOGUE_MODES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Key Expectations */}
          <div className="space-y-2">
            <Label>Attentes Clés</Label>
            <Textarea
              placeholder="Quelles sont les exigences de cette partie prenante ?"
              value={formData.keyExpectations || ''}
              onChange={(e) => setFormData(prev => prev ? { ...prev, keyExpectations: e.target.value } : null)}
              rows={3}
            />
          </div>

          {/* Planned Actions */}
          <div className="space-y-2">
            <Label>Actions à entreprendre</Label>
            <Textarea
              placeholder="Comment l'entreprise va-t-elle répondre à ces attentes ?"
              value={formData.plannedActions || ''}
              onChange={(e) => setFormData(prev => prev ? { ...prev, plannedActions: e.target.value } : null)}
              rows={3}
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
            {onDelete && (
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => {
                  onDelete(formData.id);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
