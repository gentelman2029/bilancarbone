// RSE Report Types - Workflow & Export Types

export type ReportStatus = 'draft' | 'under_review' | 'approved';

export interface ReportApproval {
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  // Review stage
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  // Approval stage
  approvedBy?: string;
  approvedAt?: string;
  approvalSignature?: string;
}

export interface ReportMetadata {
  id: string;
  title: string;
  fiscalYear: number;
  companyName: string;
  approval: ReportApproval;
  version: number;
  exportHistory: ExportRecord[];
}

export interface ExportRecord {
  id: string;
  format: 'pdf' | 'excel';
  exportedAt: string;
  exportedBy: string;
  fileName: string;
  fileSize?: number;
}

export const REPORT_STATUS_CONFIG: Record<ReportStatus, {
  label: string;
  labelFr: string;
  color: string;
  bgColor: string;
  icon: string;
  nextAction?: string;
}> = {
  draft: {
    label: 'Draft',
    labelFr: 'Brouillon',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    icon: '📝',
    nextAction: 'Soumettre pour révision',
  },
  under_review: {
    label: 'Under Review',
    labelFr: 'En révision',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: '👁',
    nextAction: 'Approuver le rapport',
  },
  approved: {
    label: 'Approved',
    labelFr: 'Approuvé',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: '✓',
  },
};

/**
 * Create initial report metadata
 */
export function createReportMetadata(
  fiscalYear: number,
  companyName: string,
  createdBy: string = 'Utilisateur'
): ReportMetadata {
  const now = new Date().toISOString();
  return {
    id: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: `Rapport RSE ${fiscalYear}`,
    fiscalYear,
    companyName,
    version: 1,
    approval: {
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      createdBy,
    },
    exportHistory: [],
  };
}

/**
 * Transition report to next status
 */
export function transitionReportStatus(
  metadata: ReportMetadata,
  newStatus: ReportStatus,
  actor: string,
  comments?: string
): ReportMetadata {
  const now = new Date().toISOString();
  const updatedApproval: ReportApproval = {
    ...metadata.approval,
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === 'under_review') {
    updatedApproval.reviewedBy = actor;
    updatedApproval.reviewedAt = now;
    updatedApproval.reviewComments = comments;
  }

  if (newStatus === 'approved') {
    updatedApproval.approvedBy = actor;
    updatedApproval.approvedAt = now;
    updatedApproval.approvalSignature = `Approuvé électroniquement par ${actor} le ${new Date(now).toLocaleDateString('fr-FR')}`;
  }

  return {
    ...metadata,
    approval: updatedApproval,
    version: metadata.version + 1,
  };
}

/**
 * Add export record
 */
export function addExportRecord(
  metadata: ReportMetadata,
  format: 'pdf' | 'excel',
  exportedBy: string,
  fileName: string,
  fileSize?: number
): ReportMetadata {
  const record: ExportRecord = {
    id: `EXP_${Date.now()}`,
    format,
    exportedAt: new Date().toISOString(),
    exportedBy,
    fileName,
    fileSize,
  };

  return {
    ...metadata,
    exportHistory: [...metadata.exportHistory, record],
  };
}
