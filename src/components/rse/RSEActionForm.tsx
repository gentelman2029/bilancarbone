import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { RSEAction, ActionStatus, ActionPriority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/rse/types';
import { BVMT_ESG_SCHEMA } from '@/lib/esg/types';

interface RSEActionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (action: Omit<RSEAction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editAction?: RSEAction | null;
}

const LEGISLATION_REFS = [
  'Loi RSE 2018-35',
  'Loi RSE 2018-35 Art.2',
  'Loi RSE 2018-35 Art.3',
  'CSRD ESRS E1',
  'CSRD ESRS S1',
  'CSRD ESRS G1',
  'Règlement UE 2023/956 MACF',
  'Décret 2009-2269 ANME',
  'Loi 2015-12 Énergies Renouvelables',
  'Code des Eaux Tunisie',
  'Loi 96-41 Déchets',
  'Code du Travail Art.5 bis',
  'ISO 50001',
  'ISO 37001',
];

const ALL_KPIS = BVMT_ESG_SCHEMA.flatMap(cat => 
  cat.indicators.map(ind => ({
    id: ind.id,
    label: ind.label,
    category: cat.id,
  }))
);

export function RSEActionForm({ open, onClose, onSave, editAction }: RSEActionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as ActionStatus,
    priority: 'medium' as ActionPriority,
    linkedKpiId: '',
    legislationRef: [] as string[],
    costEstimated: 0,
    co2ReductionTarget: 0,
    kpiImpactPoints: 0,
    regionalImpact: false,
    assignedTo: '',
    deadline: '',
  });

  const [newLegRef, setNewLegRef] = useState('');

  useEffect(() => {
    if (editAction) {
      setFormData({
        title: editAction.title,
        description: editAction.description,
        status: editAction.status,
        priority: editAction.priority,
        linkedKpiId: editAction.linkedKpiId,
        legislationRef: editAction.legislationRef,
        costEstimated: editAction.impactMetrics.costEstimated,
        co2ReductionTarget: editAction.impactMetrics.co2ReductionTarget || 0,
        kpiImpactPoints: editAction.impactMetrics.kpiImpactPoints || 0,
        regionalImpact: editAction.impactMetrics.regionalImpact,
        assignedTo: editAction.assignedTo,
        deadline: editAction.deadline,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        linkedKpiId: '',
        legislationRef: [],
        costEstimated: 0,
        co2ReductionTarget: 0,
        kpiImpactPoints: 0,
        regionalImpact: false,
        assignedTo: '',
        deadline: '',
      });
    }
  }, [editAction, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedKpi = ALL_KPIS.find(k => k.id === formData.linkedKpiId);
    
    onSave({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      linkedKpiId: formData.linkedKpiId,
      linkedKpiLabel: selectedKpi?.label || '',
      legislationRef: formData.legislationRef,
      impactMetrics: {
        costEstimated: formData.costEstimated,
        co2ReductionTarget: formData.co2ReductionTarget || undefined,
        kpiImpactPoints: formData.kpiImpactPoints || undefined,
        regionalImpact: formData.regionalImpact,
      },
      assignedTo: formData.assignedTo,
      deadline: formData.deadline,
      category: (selectedKpi?.category || 'E') as 'E' | 'S' | 'G',
    });
    
    onClose();
  };

  const addLegislationRef = (ref: string) => {
    if (ref && !formData.legislationRef.includes(ref)) {
      setFormData(prev => ({
        ...prev,
        legislationRef: [...prev.legislationRef, ref],
      }));
    }
    setNewLegRef('');
  };

  const removeLegislationRef = (ref: string) => {
    setFormData(prev => ({
      ...prev,
      legislationRef: prev.legislationRef.filter(r => r !== ref),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editAction ? 'Modifier l\'action' : 'Nouvelle action RSE'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Ex: Installation Centrale Photovoltaïque"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Décrivez l'action et ses objectifs..."
              />
            </div>

            <div>
              <Label>Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ActionStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ActionPriority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>KPI impacté *</Label>
              <Select
                value={formData.linkedKpiId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, linkedKpiId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un KPI" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_KPIS.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      {kpi.id} - {kpi.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignedTo">Responsable</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Ex: Directeur Technique"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Date limite</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="costEstimated">Budget estimé (TND)</Label>
              <Input
                id="costEstimated"
                type="number"
                value={formData.costEstimated}
                onChange={(e) => setFormData(prev => ({ ...prev, costEstimated: Number(e.target.value) }))}
                min={0}
              />
            </div>

            <div>
              <Label htmlFor="kpiImpactPoints">Impact KPI (points)</Label>
              <Input
                id="kpiImpactPoints"
                type="number"
                value={formData.kpiImpactPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, kpiImpactPoints: Number(e.target.value) }))}
                min={0}
                max={100}
                placeholder="Amélioration attendue du score"
              />
            </div>

            <div>
              <Label htmlFor="co2ReductionTarget">Réduction CO₂ cible (tCO₂e/an)</Label>
              <Input
                id="co2ReductionTarget"
                type="number"
                value={formData.co2ReductionTarget}
                onChange={(e) => setFormData(prev => ({ ...prev, co2ReductionTarget: Number(e.target.value) }))}
                min={0}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Références légales</Label>
              <div className="flex gap-2 mb-2">
                <Select
                  value={newLegRef}
                  onValueChange={addLegislationRef}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Ajouter une référence..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LEGISLATION_REFS.filter(ref => !formData.legislationRef.includes(ref)).map(ref => (
                      <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.legislationRef.map(ref => (
                  <Badge key={ref} variant="secondary" className="gap-1">
                    {ref}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeLegislationRef(ref)} 
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <Checkbox
                  id="regionalImpact"
                  checked={formData.regionalImpact}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, regionalImpact: checked === true }))
                  }
                />
                <Label htmlFor="regionalImpact" className="text-sm cursor-pointer">
                  Projet à impact régional / Développement local (Bonus Loi RSE 2018-35)
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editAction ? 'Enregistrer' : 'Créer l\'action'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
