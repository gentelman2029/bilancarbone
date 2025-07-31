import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Action {
  id: string;
  title: string;
  description: string;
  impact: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  deadline: string;
  scope: string;
  cost: number;
  estimatedReduction: number;
  calculationId?: string;
  priority: 'low' | 'medium' | 'high';
  implementationTime: string;
  category: string;
}

interface ActionsContextType {
  actions: Action[];
  addAction: (action: Omit<Action, 'id'>) => Promise<void>;
  updateAction: (id: string, updates: Partial<Action>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  getTotalImpact: () => number;
  getCompletedImpact: () => number;
  getTotalCost: () => number;
  getActionsProgress: () => number;
  getActionsByScope: (scope: string) => Action[];
  saveToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export const ActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: carbonActions, error } = await supabase
        .from('carbon_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des actions:', error);
        return;
      }

      if (carbonActions) {
        const formattedActions: Action[] = carbonActions.map(action => ({
          id: action.id,
          title: action.title,
          description: action.description,
          impact: Number(action.estimated_reduction_kg || 0) / 1000, // Conversion kg -> tonnes
          status: action.status as Action['status'],
          progress: 0, // Sera calculé selon le statut
          deadline: action.target_date || '',
          scope: action.scope_type,
          cost: Number(action.estimated_cost || 0),
          estimatedReduction: Number(action.estimated_reduction_percent || 0),
          calculationId: action.calculation_id || '',
          priority: action.priority as Action['priority'],
          implementationTime: action.implementation_time || '',
          category: action.category
        }));

        setActions(formattedActions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actions:', error);
    }
  };

  const saveToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sauvegarder chaque action
      for (const action of actions) {
        const actionData = {
          user_id: user.id,
          title: action.title,
          description: action.description,
          estimated_reduction_kg: action.impact * 1000, // Conversion tonnes -> kg
          estimated_cost: action.cost,
          target_date: action.deadline,
          scope_type: action.scope,
          status: action.status,
          priority: action.priority,
          implementation_time: action.implementationTime,
          category: action.category,
          estimated_reduction_percent: action.estimatedReduction,
          calculation_id: action.calculationId
        };

        if (action.id && action.id.length > 10) {
          // Mise à jour d'une action existante
          await supabase
            .from('carbon_actions')
            .update(actionData)
            .eq('id', action.id)
            .eq('user_id', user.id);
        } else {
          // Création d'une nouvelle action
          await supabase
            .from('carbon_actions')
            .insert(actionData);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des actions:', error);
    }
  };

  const addAction = async (actionData: Omit<Action, 'id'>) => {
    const newAction: Action = {
      ...actionData,
      id: `temp_${Date.now()}`, // ID temporaire
    };

    setActions(prev => [...prev, newAction]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('carbon_actions')
        .insert({
          user_id: user.id,
          title: actionData.title,
          description: actionData.description,
          estimated_reduction_kg: actionData.impact * 1000,
          estimated_cost: actionData.cost,
          target_date: actionData.deadline,
          scope_type: actionData.scope,
          status: actionData.status,
          priority: actionData.priority,
          implementation_time: actionData.implementationTime,
          category: actionData.category,
          estimated_reduction_percent: actionData.estimatedReduction,
          calculation_id: actionData.calculationId
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout:', error);
        return;
      }

      // Mettre à jour avec l'ID réel
      setActions(prev => prev.map(action => 
        action.id === newAction.id ? { ...action, id: data.id } : action
      ));
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const updateAction = async (id: string, updates: Partial<Action>) => {
    setActions(prev => prev.map(action => 
      action.id === id ? { ...action, ...updates } : action
    ));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.impact !== undefined) updateData.estimated_reduction_kg = updates.impact * 1000;
      if (updates.cost !== undefined) updateData.estimated_cost = updates.cost;
      if (updates.deadline) updateData.target_date = updates.deadline;
      if (updates.scope) updateData.scope_type = updates.scope;
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.implementationTime) updateData.implementation_time = updates.implementationTime;
      if (updates.category) updateData.category = updates.category;
      if (updates.estimatedReduction !== undefined) updateData.estimated_reduction_percent = updates.estimatedReduction;

      await supabase
        .from('carbon_actions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const deleteAction = async (id: string) => {
    setActions(prev => prev.filter(action => action.id !== id));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('carbon_actions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getTotalImpact = () => {
    return actions.reduce((sum, action) => sum + action.impact, 0);
  };

  const getCompletedImpact = () => {
    return actions
      .filter(action => action.status === 'completed')
      .reduce((sum, action) => sum + action.impact, 0);
  };

  const getTotalCost = () => {
    return actions.reduce((sum, action) => sum + action.cost, 0);
  };

  const getActionsProgress = () => {
    if (actions.length === 0) return 0;
    const completedActions = actions.filter(action => action.status === 'completed').length;
    return (completedActions / actions.length) * 100;
  };

  const getActionsByScope = (scope: string) => {
    return actions.filter(action => action.scope === scope);
  };

  return (
    <ActionsContext.Provider value={{
      actions,
      addAction,
      updateAction,
      deleteAction,
      getTotalImpact,
      getCompletedImpact,
      getTotalCost,
      getActionsProgress,
      getActionsByScope,
      saveToSupabase,
      loadFromSupabase
    }}>
      {children}
    </ActionsContext.Provider>
  );
};

export const useActions = () => {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error('useActions doit être utilisé dans un ActionsProvider');
  }
  return context;
};