import { useState, useEffect, useMemo } from 'react';

interface CBAMDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Haute' | 'Moyenne' | 'Faible';
  status: 'À venir' | 'En retard' | 'Terminé';
  type: 'Rapport' | 'Notification' | 'Audit' | 'Formation';
  productIds: string[];
}

const DEADLINES_STORAGE_KEY = 'cbam_deadlines';

const defaultDeadlines: CBAMDeadline[] = [
  {
    id: '1',
    title: 'Rapport Trimestriel Q1 2024',
    description: 'Soumission du rapport CBAM pour le premier trimestre',
    dueDate: '2024-01-31',
    priority: 'Haute',
    status: 'En retard',
    type: 'Rapport',
    productIds: ['1', '2']
  },
  {
    id: '2',
    title: 'Formation équipe CBAM',
    description: 'Formation du personnel sur les nouvelles procédures',
    dueDate: '2024-02-15',
    priority: 'Moyenne',
    status: 'En retard',
    type: 'Formation',
    productIds: []
  },
  {
    id: '3',
    title: 'Audit interne émissions',
    description: 'Vérification des calculs d\'émissions embarquées',
    dueDate: '2024-01-20',
    priority: 'Haute',
    status: 'En retard',
    type: 'Audit',
    productIds: ['1']
  },
  {
    id: '4',
    title: 'Rapport semestriel',
    description: 'Rapport complet des émissions du semestre',
    dueDate: '2025-12-31',
    priority: 'Haute',
    status: 'À venir',
    type: 'Rapport',
    productIds: ['1', '2', '3']
  }
];

const loadDeadlinesFromStorage = (): CBAMDeadline[] => {
  try {
    const stored = localStorage.getItem(DEADLINES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erreur chargement échéances:', e);
  }
  return defaultDeadlines;
};

const saveDeadlinesToStorage = (deadlines: CBAMDeadline[]) => {
  try {
    localStorage.setItem(DEADLINES_STORAGE_KEY, JSON.stringify(deadlines));
  } catch (e) {
    console.error('Erreur sauvegarde échéances:', e);
  }
};

export const useCBAMDeadlines = () => {
  const [deadlines, setDeadlinesState] = useState<CBAMDeadline[]>(loadDeadlinesFromStorage);

  // Wrapper pour sauvegarder automatiquement
  const setDeadlines = (updater: CBAMDeadline[] | ((prev: CBAMDeadline[]) => CBAMDeadline[])) => {
    setDeadlinesState(prev => {
      const newDeadlines = typeof updater === 'function' ? updater(prev) : updater;
      saveDeadlinesToStorage(newDeadlines);
      return newDeadlines;
    });
  };

  // Fonction de réinitialisation
  const resetDeadlines = () => {
    setDeadlines([]);
  };

  // Mettre à jour automatiquement les statuts selon les dates
  const deadlinesWithUpdatedStatus = useMemo(() => {
    const today = new Date();
    return deadlines.map(deadline => {
      const dueDate = new Date(deadline.dueDate);
      let status: 'À venir' | 'En retard' | 'Terminé' = deadline.status;
      
      // Ne modifier que si le statut n'est pas déjà "Terminé"
      if (deadline.status !== 'Terminé') {
        if (dueDate < today) {
          status = 'En retard';
        } else {
          status = 'À venir';
        }
      }
      
      return { ...deadline, status };
    });
  }, [deadlines]);

  // Calculer le nombre d'échéances critiques (en retard avec priorité Haute)
  const criticalOverdueCount = useMemo(() => {
    return deadlinesWithUpdatedStatus.filter(deadline => 
      deadline.status === 'En retard' && deadline.priority === 'Haute'
    ).length;
  }, [deadlinesWithUpdatedStatus]);

  // Calculer le nombre total d'échéances en retard
  const totalOverdueCount = useMemo(() => {
    return deadlinesWithUpdatedStatus.filter(deadline => deadline.status === 'En retard').length;
  }, [deadlinesWithUpdatedStatus]);

  return {
    deadlines: deadlinesWithUpdatedStatus,
    criticalOverdueCount,
    totalOverdueCount,
    setDeadlines,
    resetDeadlines
  };
};
