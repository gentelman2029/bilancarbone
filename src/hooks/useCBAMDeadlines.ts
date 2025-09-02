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

export const useCBAMDeadlines = () => {
  const [deadlines, setDeadlines] = useState<CBAMDeadline[]>([
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
      dueDate: '2024-12-31',
      priority: 'Haute',
      status: 'À venir',
      type: 'Rapport',
      productIds: ['1', '2', '3']
    }
  ]);

  // Calculer le nombre d'échéances critiques (en retard avec priorité Haute)
  const criticalOverdueCount = useMemo(() => {
    return deadlines.filter(deadline => 
      deadline.status === 'En retard' && deadline.priority === 'Haute'
    ).length;
  }, [deadlines]);

  // Calculer le nombre total d'échéances en retard
  const totalOverdueCount = useMemo(() => {
    return deadlines.filter(deadline => deadline.status === 'En retard').length;
  }, [deadlines]);

  return {
    deadlines,
    criticalOverdueCount,
    totalOverdueCount,
    setDeadlines
  };
};