// Service d'audit trail pour le module CBAM
// Assure la traçabilité complète des actions pour la conformité réglementaire
import { supabase } from '@/integrations/supabase/client';

// Types pour l'audit
export interface AuditEvent {
  id: string;
  organization_id?: string;
  user_id: string;
  session_id?: string;
  ip_address?: unknown;
  user_agent?: string;
  event_type: AuditEventType;
  entity_type: AuditEntityType;
  entity_id?: string;
  previous_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status: 'success' | 'failure' | 'warning';
  error_message?: string;
  occurred_at: string;
}

export type AuditEventType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'submit' 
  | 'verify' 
  | 'approve'
  | 'reject'
  | 'login' 
  | 'logout'
  | 'view'
  | 'download'
  | 'calculate';

export type AuditEntityType = 
  | 'shipment' 
  | 'product' 
  | 'emissions' 
  | 'report' 
  | 'calculation'
  | 'importer'
  | 'supplier'
  | 'installation'
  | 'certificate'
  | 'declaration'
  | 'organization'
  | 'user';

interface AuditFilters {
  organization_id?: string;
  user_id?: string;
  event_type?: AuditEventType;
  entity_type?: AuditEntityType;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  status?: 'success' | 'failure' | 'warning';
}

interface ServiceResponse<T> {
  data?: T;
  error?: string;
}

// ============================================================================
// SERVICE AUDIT
// ============================================================================

class AuditService {
  private sessionId: string;

  constructor() {
    // Générer un ID de session unique
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Logger un événement d'audit
  async log(
    eventType: AuditEventType,
    entityType: AuditEntityType,
    options: {
      organization_id?: string;
      entity_id?: string;
      previous_values?: Record<string, unknown>;
      new_values?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      status?: 'success' | 'failure' | 'warning';
      error_message?: string;
    } = {}
  ): Promise<ServiceResponse<AuditEvent>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const auditEvent = {
        organization_id: options.organization_id || null,
        user_id: user.id,
        session_id: this.sessionId,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        event_type: eventType,
        entity_type: entityType,
        entity_id: options.entity_id || null,
        previous_values: options.previous_values || null,
        new_values: options.new_values || null,
        metadata: options.metadata || {},
        status: options.status || 'success',
        error_message: options.error_message || null,
        occurred_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('cbam_audit_events')
        .insert(auditEvent)
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as AuditEvent };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
      // On ne fait pas échouer l'opération principale pour un échec d'audit
      return { error: `Erreur d'audit: ${error}` };
    }
  }

  // Logger une création
  async logCreate(
    entityType: AuditEntityType,
    entityId: string,
    newValues: Record<string, unknown>,
    organizationId?: string
  ): Promise<ServiceResponse<AuditEvent>> {
    return this.log('create', entityType, {
      organization_id: organizationId,
      entity_id: entityId,
      new_values: newValues
    });
  }

  // Logger une mise à jour
  async logUpdate(
    entityType: AuditEntityType,
    entityId: string,
    previousValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
    organizationId?: string
  ): Promise<ServiceResponse<AuditEvent>> {
    return this.log('update', entityType, {
      organization_id: organizationId,
      entity_id: entityId,
      previous_values: previousValues,
      new_values: newValues
    });
  }

  // Logger une suppression
  async logDelete(
    entityType: AuditEntityType,
    entityId: string,
    previousValues: Record<string, unknown>,
    organizationId?: string
  ): Promise<ServiceResponse<AuditEvent>> {
    return this.log('delete', entityType, {
      organization_id: organizationId,
      entity_id: entityId,
      previous_values: previousValues
    });
  }

  // Logger un export
  async logExport(
    entityType: AuditEntityType,
    metadata: {
      format: 'csv' | 'pdf' | 'xml' | 'json';
      record_count: number;
      file_name?: string;
    },
    organizationId?: string
  ): Promise<ServiceResponse<AuditEvent>> {
    return this.log('export', entityType, {
      organization_id: organizationId,
      metadata
    });
  }

  // Logger un calcul
  async logCalculation(
    entityId: string,
    metadata: {
      calculation_type: string;
      inputs: Record<string, unknown>;
      outputs: Record<string, unknown>;
      methodology: string;
      regulation_reference?: string;
    },
    organizationId?: string
  ): Promise<ServiceResponse<AuditEvent>> {
    return this.log('calculate', 'calculation', {
      organization_id: organizationId,
      entity_id: entityId,
      metadata
    });
  }

  // Logger une soumission de rapport
  async logSubmission(
    entityType: AuditEntityType,
    entityId: string,
    metadata: Record<string, unknown>,
    organizationId?: string
  ): Promise<ServiceResponse<AuditEvent>> {
    return this.log('submit', entityType, {
      organization_id: organizationId,
      entity_id: entityId,
      metadata
    });
  }

  // Récupérer les événements d'audit
  async getAuditEvents(filters: AuditFilters, limit = 100): Promise<ServiceResponse<AuditEvent[]>> {
    try {
      let query = supabase
        .from('cbam_audit_events')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (filters.organization_id) {
        query = query.eq('organization_id', filters.organization_id);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }
      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }
      if (filters.date_from) {
        query = query.gte('occurred_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('occurred_at', filters.date_to);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: (data || []) as AuditEvent[] };
    } catch (error) {
      return { error: `Erreur lors de la récupération de l'historique d'audit: ${error}` };
    }
  }

  // Récupérer l'historique d'une entité spécifique
  async getEntityHistory(entityType: AuditEntityType, entityId: string): Promise<ServiceResponse<AuditEvent[]>> {
    return this.getAuditEvents({
      entity_type: entityType,
      entity_id: entityId
    }, 500);
  }

  // Exporter l'audit trail (pour conformité)
  async exportAuditTrail(
    organizationId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<ServiceResponse<AuditEvent[]>> {
    const result = await this.getAuditEvents({
      organization_id: organizationId,
      date_from: dateFrom,
      date_to: dateTo
    }, 10000);

    if (result.data) {
      // Logger l'export de l'audit trail lui-même
      await this.logExport('organization', {
        format: 'json',
        record_count: result.data.length,
        file_name: `audit_trail_${dateFrom}_${dateTo}.json`
      }, organizationId);
    }

    return result;
  }
}

export const auditService = new AuditService();
