// RSE Report Workflow Component
// Manages Draft → Under Review → Approved workflow

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileEdit,
  Eye,
  CheckCircle2,
  ArrowRight,
  Clock,
  User,
  History,
  Send,
  Stamp,
} from 'lucide-react';
import {
  ReportMetadata,
  ReportStatus,
  REPORT_STATUS_CONFIG,
  transitionReportStatus,
} from '@/lib/rse/reportTypes';
import { toast } from 'sonner';

interface RSEReportWorkflowProps {
  metadata: ReportMetadata;
  onMetadataChange: (metadata: ReportMetadata) => void;
}

const getStatusIcon = (status: ReportStatus) => {
  switch (status) {
    case 'draft':
      return <FileEdit className="h-5 w-5 text-slate-500" />;
    case 'under_review':
      return <Eye className="h-5 w-5 text-amber-500" />;
    case 'approved':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }
};

export function RSEReportWorkflow({ metadata, onMetadataChange }: RSEReportWorkflowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actorName, setActorName] = useState('');
  const [comments, setComments] = useState('');
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('draft');

  const currentConfig = REPORT_STATUS_CONFIG[metadata.approval.status];
  
  const canSubmitForReview = metadata.approval.status === 'draft';
  const canApprove = metadata.approval.status === 'under_review';
  const isApproved = metadata.approval.status === 'approved';

  const handleTransition = (newStatus: ReportStatus) => {
    setTargetStatus(newStatus);
    setIsDialogOpen(true);
  };

  const confirmTransition = () => {
    if (!actorName.trim()) {
      toast.error('Veuillez saisir votre nom');
      return;
    }

    const updated = transitionReportStatus(metadata, targetStatus, actorName, comments);
    onMetadataChange(updated);
    setIsDialogOpen(false);
    setActorName('');
    setComments('');

    const statusLabel = REPORT_STATUS_CONFIG[targetStatus].labelFr;
    toast.success(`Rapport passé à l'état "${statusLabel}"`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Workflow d'Approbation
          </span>
          <Badge className={`${currentConfig.bgColor} ${currentConfig.color}`}>
            {currentConfig.icon} {currentConfig.labelFr}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Progress Steps */}
        <div className="flex items-center justify-between">
          {/* Draft Step */}
          <div className={`flex flex-col items-center ${metadata.approval.status === 'draft' ? 'opacity-100' : 'opacity-60'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              metadata.approval.status === 'draft' ? 'bg-slate-200 ring-2 ring-slate-400' : 'bg-slate-100'
            }`}>
              <FileEdit className="h-5 w-5 text-slate-600" />
            </div>
            <span className="text-xs mt-1 font-medium">Brouillon</span>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground" />

          {/* Under Review Step */}
          <div className={`flex flex-col items-center ${metadata.approval.status === 'under_review' ? 'opacity-100' : 'opacity-60'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              metadata.approval.status === 'under_review' ? 'bg-amber-200 ring-2 ring-amber-400' : 
              metadata.approval.status === 'approved' ? 'bg-amber-100' : 'bg-slate-100'
            }`}>
              <Eye className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-xs mt-1 font-medium">En Révision</span>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground" />

          {/* Approved Step */}
          <div className={`flex flex-col items-center ${metadata.approval.status === 'approved' ? 'opacity-100' : 'opacity-60'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              metadata.approval.status === 'approved' ? 'bg-emerald-200 ring-2 ring-emerald-400' : 'bg-slate-100'
            }`}>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xs mt-1 font-medium">Approuvé</span>
          </div>
        </div>

        <Separator />

        {/* Current Status Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Version</p>
              <p className="font-medium">v{metadata.version}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Créé par</p>
              <p className="font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                {metadata.approval.createdBy}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Créé le</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(metadata.approval.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Dernière mise à jour</p>
              <p className="font-medium">{formatDate(metadata.approval.updatedAt)}</p>
            </div>
          </div>

          {/* Review Info */}
          {metadata.approval.reviewedBy && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium text-amber-700">
                Soumis pour révision par {metadata.approval.reviewedBy}
              </p>
              <p className="text-xs text-amber-600">{formatDate(metadata.approval.reviewedAt)}</p>
              {metadata.approval.reviewComments && (
                <p className="text-sm mt-2 text-amber-800">"{metadata.approval.reviewComments}"</p>
              )}
            </div>
          )}

          {/* Approval Info */}
          {metadata.approval.approvedBy && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <Stamp className="h-4 w-4" />
                Approuvé par {metadata.approval.approvedBy}
              </p>
              <p className="text-xs text-emerald-600">{formatDate(metadata.approval.approvedAt)}</p>
              {metadata.approval.approvalSignature && (
                <p className="text-xs mt-2 text-emerald-700 italic">{metadata.approval.approvalSignature}</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canSubmitForReview && (
            <Button onClick={() => handleTransition('under_review')} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Soumettre pour Révision
            </Button>
          )}

          {canApprove && (
            <Button onClick={() => handleTransition('approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <Stamp className="h-4 w-4 mr-2" />
              Approuver le Rapport
            </Button>
          )}

          {isApproved && (
            <Button variant="outline" disabled className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
              Rapport Approuvé
            </Button>
          )}

          {/* Reset to Draft (for testing) */}
          {metadata.approval.status !== 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const reset = transitionReportStatus(
                  { ...metadata, approval: { ...metadata.approval, status: 'draft' } },
                  'draft',
                  'Système'
                );
                onMetadataChange({ ...reset, approval: { ...reset.approval, status: 'draft' } });
                toast.info('Rapport remis en brouillon');
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </CardContent>

      {/* Transition Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {targetStatus === 'under_review' ? 'Soumettre pour Révision' : 'Approuver le Rapport'}
            </DialogTitle>
            <DialogDescription>
              {targetStatus === 'under_review'
                ? 'Le rapport sera soumis au Responsable RSE pour validation.'
                : 'Cette action officialise le rapport RSE pour publication.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="actor">Votre Nom *</Label>
              <Input
                id="actor"
                placeholder="ex: Mohamed Ben Ali"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">
                {targetStatus === 'under_review' ? 'Commentaires (optionnel)' : 'Signature électronique'}
              </Label>
              <Textarea
                id="comments"
                placeholder={
                  targetStatus === 'under_review'
                    ? 'Ajoutez des notes pour le réviseur...'
                    : 'Approuvé pour publication officielle'
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmTransition}>
              {targetStatus === 'under_review' ? 'Soumettre' : 'Approuver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default RSEReportWorkflow;
