import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';

export interface MaterialityIssue {
  id: string;
  issueName: string;
  category: 'E' | 'S' | 'G';
  impactNature: 'positive' | 'negative';
  severity: number;
  probability: number;
  riskScore: number;
  opportunity: string;
}

interface ESGMaterialityTableProps {
  issues: MaterialityIssue[];
  onAddIssue: (issue: Omit<MaterialityIssue, 'id' | 'riskScore'>) => void;
  onUpdateIssue: (id: string, issue: Partial<MaterialityIssue>) => void;
  onDeleteIssue: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  E: { label: 'Environnement', color: 'bg-emerald-500' },
  S: { label: 'Social', color: 'bg-blue-500' },
  G: { label: 'Gouvernance', color: 'bg-purple-500' },
};

const getRiskColor = (score: number): string => {
  if (score >= 15) return 'text-destructive bg-destructive/10';
  if (score >= 8) return 'text-amber-600 bg-amber-500/10';
  return 'text-emerald-600 bg-emerald-500/10';
};

const getRiskLabel = (score: number): string => {
  if (score >= 15) return 'Critique';
  if (score >= 8) return 'Modéré';
  return 'Faible';
};

export const ESGMaterialityTable: React.FC<ESGMaterialityTableProps> = ({
  issues,
  onAddIssue,
  onUpdateIssue,
  onDeleteIssue,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<MaterialityIssue | null>(null);
  const [formData, setFormData] = useState({
    issueName: '',
    category: 'E' as 'E' | 'S' | 'G',
    impactNature: 'negative' as 'positive' | 'negative',
    severity: 3,
    probability: 3,
    opportunity: '',
  });

  const resetForm = () => {
    setFormData({
      issueName: '',
      category: 'E',
      impactNature: 'negative',
      severity: 3,
      probability: 3,
      opportunity: '',
    });
  };

  const handleSubmit = () => {
    if (editingIssue) {
      onUpdateIssue(editingIssue.id, formData);
      setEditingIssue(null);
    } else {
      onAddIssue(formData);
    }
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (issue: MaterialityIssue) => {
    setEditingIssue(issue);
    setFormData({
      issueName: issue.issueName,
      category: issue.category,
      impactNature: issue.impactNature,
      severity: issue.severity,
      probability: issue.probability,
      opportunity: issue.opportunity,
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingIssue(null);
    resetForm();
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Tableau de Matérialité
            </CardTitle>
            <CardDescription>
              Identifiez et évaluez vos enjeux ESG prioritaires (CRUD interactif)
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingIssue(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un enjeu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingIssue ? 'Modifier l\'enjeu' : 'Nouvel enjeu de matérialité'}
                </DialogTitle>
                <DialogDescription>
                  Définissez les caractéristiques de l'enjeu ESG
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nom de l'enjeu *</Label>
                  <Input
                    placeholder="Ex: Stress Hydrique, Corruption, Sécurité des données..."
                    value={formData.issueName}
                    onChange={(e) => setFormData({ ...formData, issueName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as 'E' | 'S' | 'G' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E">🌿 Environnement</SelectItem>
                        <SelectItem value="S">👥 Social</SelectItem>
                        <SelectItem value="G">🏛️ Gouvernance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nature de l'impact *</Label>
                    <Select
                      value={formData.impactNature}
                      onValueChange={(v) => setFormData({ ...formData, impactNature: v as 'positive' | 'negative' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">✅ Positif</SelectItem>
                        <SelectItem value="negative">❌ Négatif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gravité (1-5) *</Label>
                    <Select
                      value={formData.severity.toString()}
                      onValueChange={(v) => setFormData({ ...formData, severity: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} - {n === 1 ? 'Mineur' : n === 2 ? 'Faible' : n === 3 ? 'Modéré' : n === 4 ? 'Majeur' : 'Critique'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Probabilité (1-5) *</Label>
                    <Select
                      value={formData.probability.toString()}
                      onValueChange={(v) => setFormData({ ...formData, probability: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} - {n === 1 ? 'Rare' : n === 2 ? 'Improbable' : n === 3 ? 'Possible' : n === 4 ? 'Probable' : 'Quasi-certain'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-sm text-muted-foreground">Score de Risque calculé : </span>
                  <Badge className={getRiskColor(formData.severity * formData.probability)}>
                    {formData.severity * formData.probability}/25 - {getRiskLabel(formData.severity * formData.probability)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Opportunité stratégique</Label>
                  <Textarea
                    placeholder="Décrivez l'avantage financier ou stratégique potentiel..."
                    value={formData.opportunity}
                    onChange={(e) => setFormData({ ...formData, opportunity: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.issueName}>
                  {editingIssue ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun enjeu défini</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par ajouter vos enjeux de matérialité ESG
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier enjeu
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Enjeu</TableHead>
                  <TableHead className="text-center">Catégorie</TableHead>
                  <TableHead className="text-center">Impact</TableHead>
                  <TableHead className="text-center">Gravité</TableHead>
                  <TableHead className="text-center">Probabilité</TableHead>
                  <TableHead className="text-center">Score Risque</TableHead>
                  <TableHead>Opportunité</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.issueName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <div className={`w-2 h-2 rounded-full ${CATEGORY_LABELS[issue.category].color}`} />
                        {CATEGORY_LABELS[issue.category].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={issue.impactNature === 'positive' ? 'default' : 'destructive'}>
                        {issue.impactNature === 'positive' ? 'Positif' : 'Négatif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">{issue.severity}/5</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">{issue.probability}/5</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getRiskColor(issue.riskScore)}>
                        {issue.riskScore}/25
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {issue.opportunity || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(issue)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDeleteIssue(issue.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
