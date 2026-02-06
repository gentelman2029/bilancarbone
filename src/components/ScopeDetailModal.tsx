import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Check, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScopeEntry {
  id: string;
  source: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  total: number;
}

interface ScopeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  scopeNumber: 1 | 2 | 3;
  scopeTitle: string;
  entries: ScopeEntry[];
  onEntriesChange: (entries: ScopeEntry[]) => void;
}

export const ScopeDetailModal: React.FC<ScopeDetailModalProps> = ({
  isOpen,
  onClose,
  scopeNumber,
  scopeTitle,
  entries,
  onEntriesChange
}) => {
  const { toast } = useToast();
  const [localEntries, setLocalEntries] = useState<ScopeEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ScopeEntry>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<ScopeEntry, 'id' | 'total'>>({
    source: '',
    quantity: 0,
    unit: '',
    emissionFactor: 0
  });

  // Sync local entries when modal opens or entries prop changes
  useEffect(() => {
    if (isOpen) {
      setLocalEntries([...entries]);
      setEditingId(null);
      setEditData({});
      setIsAdding(false);
      setNewEntry({ source: '', quantity: 0, unit: '', emissionFactor: 0 });
    }
  }, [isOpen, JSON.stringify(entries)]);

  const calculateTotal = () => {
    return localEntries.reduce((sum, entry) => sum + entry.total, 0);
  };

  const handleEdit = (entry: ScopeEntry) => {
    console.log('Editing entry:', entry);
    setEditingId(entry.id);
    setEditData({ ...entry });
  };

  // Auto-save entries on any change to update dashboard in real-time
  const saveEntries = useCallback((entriesToSave: ScopeEntry[]) => {
    onEntriesChange(entriesToSave);
  }, [onEntriesChange]);

  const handleSaveEdit = () => {
    if (!editingId || !editData) return;
    
    const updatedEntries = localEntries.map(entry => {
      if (entry.id === editingId) {
        const quantity = editData.quantity ?? entry.quantity;
        const emissionFactor = editData.emissionFactor ?? entry.emissionFactor;
        // Recalculer le total avec la formule correcte
        const newTotal = quantity * emissionFactor;
        return {
          ...entry,
          source: editData.source ?? entry.source,
          quantity,
          unit: editData.unit ?? entry.unit,
          emissionFactor,
          total: newTotal
        };
      }
      return entry;
    });
    
    setLocalEntries(updatedEntries);
    saveEntries(updatedEntries); // Auto-save to update dashboard
    setEditingId(null);
    setEditData({});
    
    toast({
      title: "Ligne modifiée",
      description: "Le total a été recalculé automatiquement",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    const updatedEntries = localEntries.filter(entry => entry.id !== id);
    setLocalEntries(updatedEntries);
    saveEntries(updatedEntries); // Auto-save to update dashboard
    
    toast({
      title: "Ligne supprimée",
      description: "Le total a été recalculé automatiquement",
    });
  };

  const handleAddEntry = () => {
    if (!newEntry.source.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir la source",
        variant: "destructive"
      });
      return;
    }
    
    const total = newEntry.quantity * newEntry.emissionFactor;
    const entry: ScopeEntry = {
      id: `scope${scopeNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...newEntry,
      total
    };
    
    const updatedEntries = [...localEntries, entry];
    setLocalEntries(updatedEntries);
    saveEntries(updatedEntries); // Auto-save to update dashboard
    setNewEntry({ source: '', quantity: 0, unit: '', emissionFactor: 0 });
    setIsAdding(false);
    
    toast({
      title: "Ligne ajoutée",
      description: `${total.toFixed(2)} kg CO₂e ajoutés au Scope ${scopeNumber}`,
    });
  };

  const handleSaveAndClose = () => {
    // Entries are already saved on each action, just close
    onClose();
  };

  const scopeColors = {
    1: 'text-red-600',
    2: 'text-amber-600',
    3: 'text-blue-600'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSaveAndClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Détail du {scopeTitle}
            <span className={`text-2xl font-bold ${scopeColors[scopeNumber]}`}>
              {(calculateTotal() / 1000).toFixed(2)} tCO₂e
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bouton Ajouter */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </Button>
            <span className="text-sm text-muted-foreground">
              {localEntries.length} entrée(s)
            </span>
          </div>

          {/* Formulaire d'ajout */}
          {isAdding && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Source</label>
                  <Input
                    value={newEntry.source}
                    onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value })}
                    placeholder="Ex: Gazole"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quantité</label>
                  <Input
                    type="number"
                    value={newEntry.quantity || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, quantity: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unité</label>
                  <Input
                    value={newEntry.unit}
                    onChange={(e) => setNewEntry({ ...newEntry, unit: e.target.value })}
                    placeholder="Ex: litres"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Facteur (kg CO₂e/unité)</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={newEntry.emissionFactor || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, emissionFactor: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddEntry}>
                  <Check className="h-4 w-4 mr-1" /> Ajouter
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                  <X className="h-4 w-4 mr-1" /> Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Tableau */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead className="text-right">Facteur d'émission</TableHead>
                  <TableHead className="text-right">Total tCO₂e</TableHead>
                  <TableHead className="text-center w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune entrée pour ce scope. Cliquez sur "Ajouter une ligne" pour commencer.
                    </TableCell>
                  </TableRow>
                ) : (
                  localEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      {editingId === entry.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editData.source || ''}
                              onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editData.quantity || ''}
                              onChange={(e) => setEditData({ ...editData, quantity: Number(e.target.value) })}
                              className="h-8 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editData.unit || ''}
                              onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.001"
                              value={editData.emissionFactor || ''}
                              onChange={(e) => setEditData({ ...editData, emissionFactor: Number(e.target.value) })}
                              className="h-8 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(((editData.quantity || 0) * (editData.emissionFactor || 0)) / 1000).toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{entry.source}</TableCell>
                          <TableCell className="text-right">{entry.quantity.toLocaleString('fr-FR')}</TableCell>
                          <TableCell>{entry.unit}</TableCell>
                          <TableCell className="text-right">{entry.emissionFactor}</TableCell>
                          <TableCell className={`text-right font-bold ${scopeColors[scopeNumber]}`}>
                            {(entry.total / 1000).toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button 
                                type="button"
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 hover:bg-blue-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEdit(entry);
                                }}
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button 
                                type="button"
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 hover:bg-red-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(entry.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer avec total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-semibold">
              Total {scopeTitle}: 
              <span className={`ml-2 text-2xl ${scopeColors[scopeNumber]}`}>
                {(calculateTotal() / 1000).toFixed(2)} tCO₂e
              </span>
            </div>
            <Button onClick={handleSaveAndClose} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder et fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
