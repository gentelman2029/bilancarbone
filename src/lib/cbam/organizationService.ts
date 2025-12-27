// Service pour la gestion des organisations et du multi-tenant CBAM
import { supabase } from '@/integrations/supabase/client';

// Types pour les organisations
export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  registration_number?: string;
  country_code: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  cbam_registration_id?: string;
  settings: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: AppRole;
  is_primary: boolean;
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AppRole = 'admin_org' | 'supervisor' | 'user' | 'accountant' | 'auditor';

export interface OrganizationWithRole extends Organization {
  role: AppRole;
  is_primary: boolean;
}

interface ServiceResponse<T> {
  data?: T;
  error?: string;
}

// ============================================================================
// SERVICE ORGANISATIONS
// ============================================================================

class OrganizationService {
  
  // Récupérer les organisations de l'utilisateur courant
  async getUserOrganizations(): Promise<ServiceResponse<OrganizationWithRole[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          is_primary,
          organizations (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const organizations: OrganizationWithRole[] = (data || []).map((member: any) => ({
        ...member.organizations,
        role: member.role as AppRole,
        is_primary: member.is_primary
      }));

      return { data: organizations };
    } catch (error) {
      return { error: `Erreur lors de la récupération des organisations: ${error}` };
    }
  }

  // Récupérer l'organisation principale
  async getPrimaryOrganization(): Promise<ServiceResponse<OrganizationWithRole | null>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          is_primary,
          organizations (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return { data: null };

      return { 
        data: {
          ...(data as any).organizations,
          role: (data as any).role as AppRole,
          is_primary: (data as any).is_primary
        }
      };
    } catch (error) {
      return { error: `Erreur lors de la récupération de l'organisation principale: ${error}` };
    }
  }

  // Créer une nouvelle organisation
  async createOrganization(org: Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'settings'>): Promise<ServiceResponse<Organization>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Créer l'organisation
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: org.name,
          legal_name: org.legal_name,
          registration_number: org.registration_number,
          country_code: org.country_code,
          address: org.address,
          contact_email: org.contact_email,
          contact_phone: org.contact_phone,
          cbam_registration_id: org.cbam_registration_id,
          settings: {},
          is_active: true
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Ajouter l'utilisateur comme admin_org
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          role: 'admin_org',
          is_primary: true,
          joined_at: new Date().toISOString(),
          is_active: true
        });

      if (memberError) throw memberError;

      return { data: orgData };
    } catch (error) {
      return { error: `Erreur lors de la création de l'organisation: ${error}` };
    }
  }

  // Mettre à jour une organisation
  async updateOrganization(id: string, updates: Partial<Organization>): Promise<ServiceResponse<Organization>> {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.legal_name !== undefined) updateData.legal_name = updates.legal_name;
      if (updates.registration_number !== undefined) updateData.registration_number = updates.registration_number;
      if (updates.country_code !== undefined) updateData.country_code = updates.country_code;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.contact_email !== undefined) updateData.contact_email = updates.contact_email;
      if (updates.contact_phone !== undefined) updateData.contact_phone = updates.contact_phone;
      if (updates.cbam_registration_id !== undefined) updateData.cbam_registration_id = updates.cbam_registration_id;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

      const { data, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la mise à jour de l'organisation: ${error}` };
    }
  }

  // Changer l'organisation principale
  async setPrimaryOrganization(organizationId: string): Promise<ServiceResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Retirer is_primary de toutes les organisations
      await supabase
        .from('organization_members')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Définir la nouvelle organisation principale
      const { error } = await supabase
        .from('organization_members')
        .update({ is_primary: true })
        .eq('user_id', user.id)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return {};
    } catch (error) {
      return { error: `Erreur lors du changement d'organisation principale: ${error}` };
    }
  }

  // Récupérer les membres d'une organisation
  async getOrganizationMembers(organizationId: string): Promise<ServiceResponse<OrganizationMember[]>> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('role');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des membres: ${error}` };
    }
  }

  // Inviter un membre
  async inviteMember(organizationId: string, email: string, role: AppRole): Promise<ServiceResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // TODO: Implémenter l'invitation par email via edge function
      // Pour l'instant, on retourne une erreur
      return { error: 'Fonctionnalité d\'invitation en cours de développement' };
    } catch (error) {
      return { error: `Erreur lors de l'invitation: ${error}` };
    }
  }

  // Modifier le rôle d'un membre
  async updateMemberRole(memberId: string, role: AppRole): Promise<ServiceResponse<OrganizationMember>> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: `Erreur lors de la mise à jour du rôle: ${error}` };
    }
  }

  // Retirer un membre
  async removeMember(memberId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;
      return {};
    } catch (error) {
      return { error: `Erreur lors du retrait du membre: ${error}` };
    }
  }

  // Vérifier les permissions
  async hasPermission(organizationId: string, minRole: AppRole): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) return false;

      const roleHierarchy: Record<AppRole, number> = {
        'admin_org': 5,
        'supervisor': 4,
        'user': 3,
        'accountant': 2,
        'auditor': 1
      };

      return roleHierarchy[data.role as AppRole] >= roleHierarchy[minRole];
    } catch {
      return false;
    }
  }
}

export const organizationService = new OrganizationService();
