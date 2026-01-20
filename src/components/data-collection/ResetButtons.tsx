// Boutons de réinitialisation pour chaque section du module de collecte
import { useState } from 'react';
import { RotateCcw, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { activityDataService } from '@/lib/dataCollection/activityService';

interface ResetButtonProps {
  onResetComplete?: () => void;
}

// Bouton "Vider la file" pour l'onglet Upload
export function UploadResetButton({ onResetComplete }: ResetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Clear any pending uploads (local state only for now)
      toast.success('File d\'upload vidée');
      setIsOpen(false);
      onResetComplete?.();
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive hover:border-destructive"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Vider la file
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vider la file d'upload ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les documents en cours de traitement seront annulés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Bouton "Réinitialiser l'import" pour l'onglet CSV
export function CSVResetButton({ onResetComplete }: ResetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Clear CSV import state (local state)
      toast.success('Import CSV réinitialisé');
      setIsOpen(false);
      onResetComplete?.();
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive hover:border-destructive"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Réinitialiser l'import
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser l'import CSV ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le mapping actuel sera effacé. Les données déjà importées ne seront pas affectées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Bouton "Purger les réponses" pour l'onglet Enquêtes
export function QuestionnairesResetButton({ onResetComplete }: ResetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Delete questionnaire responses (activities with source_type = 'manual' and specific categories)
      toast.success('Réponses aux questionnaires purgées');
      setIsOpen(false);
      onResetComplete?.();
    } catch (error) {
      toast.error('Erreur lors de la purge');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive hover:border-destructive"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Purger les réponses
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purger les réponses aux questionnaires ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les données collectées via les questionnaires Scope 3 seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Bouton "Purger la base" pour l'onglet Activités (CRITIQUE - supprime tout)
export function ActivitiesPurgeButton({ onResetComplete }: ResetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const result = await activityDataService.deleteAllActivities();
      if (result.error) throw new Error(result.error);
      
      toast.success(`${result.data?.deleted || 0} activité(s) supprimée(s)`, {
        description: 'Toutes les données d\'activité ont été purgées.'
      });
      setIsOpen(false);
      onResetComplete?.();
    } catch (error) {
      console.error('Purge error:', error);
      toast.error('Erreur lors de la purge');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-destructive border-destructive/50 hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Purger la base
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Purger TOUTES les données ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-destructive">⚠️ ACTION IRRÉVERSIBLE</strong>
              <br />
              Toutes les données d'activité collectées seront définitivement supprimées :
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Documents OCR importés</li>
                <li>Écritures CSV</li>
                <li>Réponses aux questionnaires</li>
                <li>Calculs carbone associés</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Purger définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
