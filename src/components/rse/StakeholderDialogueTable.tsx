import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Stakeholder, 
  DialogueMode,
  STAKEHOLDER_CATEGORIES, 
  DIALOGUE_MODES 
} from '@/lib/rse/types';
import { MessageSquare, Save, Edit3, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface StakeholderDialogueTableProps {
  stakeholders: Stakeholder[];
  onUpdateStakeholder: (stakeholder: Stakeholder) => void;
}

export function StakeholderDialogueTable({ 
  stakeholders, 
  onUpdateStakeholder 
}: StakeholderDialogueTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Stakeholder>>({});

  const handleStartEdit = (stakeholder: Stakeholder) => {
    setEditingId(stakeholder.id);
    setEditData({
      dialogueMode: stakeholder.dialogueMode || 'meeting',
      keyExpectations: stakeholder.keyExpectations || '',
      plannedActions: stakeholder.plannedActions || '',
    });
  };

  const handleSave = (stakeholder: Stakeholder) => {
    onUpdateStakeholder({
      ...stakeholder,
      ...editData,
    });
    setEditingId(null);
    setEditData({});
    toast.success('Dialogue mis à jour');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Dialogue et Attentes
            </CardTitle>
            <CardDescription>
              Gestion des modes de dialogue et attentes par partie prenante
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Partie Prenante</TableHead>
                <TableHead className="w-[150px]">Mode de Dialogue</TableHead>
                <TableHead className="w-[250px]">Attentes Clés</TableHead>
                <TableHead className="w-[250px]">Actions à entreprendre</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders.map((stakeholder) => {
                const categoryInfo = STAKEHOLDER_CATEGORIES[stakeholder.category];
                const isEditing = editingId === stakeholder.id;

                return (
                  <TableRow key={stakeholder.id}>
                    {/* Stakeholder Name & Category */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: categoryInfo?.color }}
                          />
                          <span className="font-medium text-sm">{stakeholder.name}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: categoryInfo?.color, color: categoryInfo?.color }}
                        >
                          {categoryInfo?.label}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Dialogue Mode */}
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editData.dialogueMode || 'meeting'}
                          onValueChange={(value: DialogueMode) => 
                            setEditData(prev => ({ ...prev, dialogueMode: value }))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DIALOGUE_MODES).map(([key, label]) => (
                              <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {DIALOGUE_MODES[stakeholder.dialogueMode as DialogueMode] || 'Non défini'}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Key Expectations */}
                    <TableCell>
                      {isEditing ? (
                        <Textarea
                          value={editData.keyExpectations || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, keyExpectations: e.target.value }))}
                          className="min-h-[60px] text-xs"
                          placeholder="Attentes clés..."
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {stakeholder.keyExpectations || <span className="italic">Non renseigné</span>}
                        </p>
                      )}
                    </TableCell>

                    {/* Planned Actions */}
                    <TableCell>
                      {isEditing ? (
                        <Textarea
                          value={editData.plannedActions || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, plannedActions: e.target.value }))}
                          className="min-h-[60px] text-xs"
                          placeholder="Actions prévues..."
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {stakeholder.plannedActions || <span className="italic">Non renseigné</span>}
                        </p>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={() => handleSave(stakeholder)}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => handleStartEdit(stakeholder)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
