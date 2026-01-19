// Notification System Hook for Data Collection
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 
  | 'document_uploaded'
  | 'document_processed'
  | 'validation_required'
  | 'validation_complete'
  | 'calculation_complete'
  | 'deadline_reminder'
  | 'anomaly_detected'
  | 'batch_import_complete';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
  action_url?: string;
}

interface UseNotificationsOptions {
  autoLoad?: boolean;
  pollInterval?: number; // in ms, 0 to disable
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  clearNotifications: () => void;
  refresh: () => void;
}

// Local storage key
const NOTIFICATIONS_KEY = 'carbon-notifications';

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { autoLoad = true, pollInterval = 0 } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Notification[];
        // Sort by date, newest first
        setNotifications(parsed.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);
  
  // Save notifications to localStorage
  const saveNotifications = useCallback((notifs: Notification[]) => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, []);
  
  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep max 50
      saveNotifications(updated);
      return updated;
    });
    
    // Show toast based on severity
    const toastFn = notification.severity === 'error' ? toast.error :
                   notification.severity === 'warning' ? toast.warning :
                   notification.severity === 'success' ? toast.success :
                   toast.info;
    
    toastFn(notification.title, { description: notification.message });
  }, [saveNotifications]);
  
  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);
  
  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATIONS_KEY);
  }, []);
  
  // Initial load
  useEffect(() => {
    if (autoLoad) {
      loadNotifications();
    }
  }, [autoLoad, loadNotifications]);
  
  // Polling for new data (optional)
  useEffect(() => {
    if (pollInterval > 0) {
      const interval = setInterval(loadNotifications, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, loadNotifications]);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
    refresh: loadNotifications,
  };
}

// Utility functions to create notifications
export const createNotification = {
  documentUploaded: (fileName: string) => ({
    type: 'document_uploaded' as NotificationType,
    title: 'Document téléchargé',
    message: `${fileName} a été ajouté à la file d'extraction`,
    severity: 'info' as const,
  }),
  
  documentProcessed: (fileName: string, confidence: number) => ({
    type: 'document_processed' as NotificationType,
    title: 'Extraction terminée',
    message: `${fileName} - Confiance: ${Math.round(confidence * 100)}%`,
    severity: confidence > 0.8 ? 'success' as const : 'warning' as const,
  }),
  
  validationRequired: (count: number) => ({
    type: 'validation_required' as NotificationType,
    title: 'Validation requise',
    message: `${count} document(s) en attente de validation`,
    severity: 'warning' as const,
    action_url: '/data-ocr?tab=review',
  }),
  
  calculationComplete: (co2Kg: number, itemCount: number) => ({
    type: 'calculation_complete' as NotificationType,
    title: 'Calculs terminés',
    message: `${itemCount} activités calculées: ${(co2Kg / 1000).toFixed(2)} tCO₂e`,
    severity: 'success' as const,
  }),
  
  anomalyDetected: (message: string) => ({
    type: 'anomaly_detected' as NotificationType,
    title: 'Anomalie détectée',
    message,
    severity: 'warning' as const,
  }),
  
  batchImportComplete: (successCount: number, errorCount: number) => ({
    type: 'batch_import_complete' as NotificationType,
    title: 'Import terminé',
    message: `${successCount} lignes importées${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`,
    severity: errorCount > 0 ? 'warning' as const : 'success' as const,
  }),
};
