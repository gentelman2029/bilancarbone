import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory, Zap, Building, FileText } from "lucide-react";
import { Scope1Form } from './Scope1Form';
import { Scope2Form } from './Scope2Form';
import { Scope3StandardForm } from './Scope3StandardForm';
import { Scope3AdvancedModule } from '@/components/scope3/Scope3AdvancedModule';
import { CalculationDetail } from '@/hooks/useCalculationDetails';
import { DetailsView } from './DetailsView';
import { useTranslation } from 'react-i18next';

interface ScopeTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  // Scope 1
  scope1Data: any;
  onScope1Change: (updates: any) => void;
  // Scope 2
  scope2Data: any;
  onScope2Change: (updates: any) => void;
  // Scope 3
  scope3Data: any;
  onScope3Change: (updates: any) => void;
  isAdvancedMode: boolean;
  onEnableAdvanced: () => void;
  onScope3AdvancedTotalChange: (total: number) => void;
  onScope3AdvancedCalcsChange: (calcs: any[]) => void;
  // Shared
  onAddCalculation: (scope: string, category: string, subcategory: string, quantity: number) => void;
  // Details view
  sectionDetails: { scope1: CalculationDetail[]; scope2: CalculationDetail[]; scope3: CalculationDetail[] };
  scope3CombinedDetails: CalculationDetail[];
  scope1Total: number;
  scope2Total: number;
  scope3TotalWithAdvanced: number;
  totalGlobal: number;
  totalEntries: number;
  advancedCount: number;
  hasAnyData: boolean;
  isAuthenticated: boolean;
  isSaving: boolean;
  onRemoveScope1Detail: (id: string) => void;
  onRemoveScope2Detail: (id: string) => void;
  onRemoveScope3Detail: (id: string) => void;
  onClearScope1: () => void;
  onClearScope2: () => void;
  onClearScope3: () => void;
  onResetAll: () => void;
  onSave: () => void;
  onExportCSV: () => void;
}

export const ScopeTabs: React.FC<ScopeTabsProps> = ({
  activeTab,
  onTabChange,
  scope1Data,
  onScope1Change,
  scope2Data,
  onScope2Change,
  scope3Data,
  onScope3Change,
  isAdvancedMode,
  onEnableAdvanced,
  onScope3AdvancedTotalChange,
  onScope3AdvancedCalcsChange,
  onAddCalculation,
  sectionDetails,
  scope3CombinedDetails,
  scope1Total,
  scope2Total,
  scope3TotalWithAdvanced,
  totalGlobal,
  totalEntries,
  advancedCount,
  hasAnyData,
  isAuthenticated,
  isSaving,
  onRemoveScope1Detail,
  onRemoveScope2Detail,
  onRemoveScope3Detail,
  onClearScope1,
  onClearScope2,
  onClearScope3,
  onResetAll,
  onSave,
  onExportCSV,
}) => {
  const { t } = useTranslation();

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="scope1" className="flex items-center gap-2">
          <Factory className="h-4 w-4" />Scope 1
        </TabsTrigger>
        <TabsTrigger value="scope2" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />Scope 2
        </TabsTrigger>
        <TabsTrigger value="scope3" className="flex items-center gap-2">
          <Building className="h-4 w-4" />Scope 3
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />{t('ghg.tabs.details', 'Détails calcul')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scope1" className="space-y-6">
        <Scope1Form data={scope1Data} onChange={onScope1Change} onAddCalculation={onAddCalculation} />
      </TabsContent>

      <TabsContent value="scope2" className="space-y-6">
        <Scope2Form data={scope2Data} onChange={onScope2Change} onAddCalculation={onAddCalculation} />
      </TabsContent>

      <TabsContent value="scope3" className="space-y-6">
        {isAdvancedMode ? (
          <Scope3AdvancedModule
            onTotalChange={onScope3AdvancedTotalChange}
            onCalculationsChange={onScope3AdvancedCalcsChange}
          />
        ) : (
          <Scope3StandardForm
            data={scope3Data}
            onChange={onScope3Change}
            onAddCalculation={onAddCalculation}
            onEnableAdvanced={onEnableAdvanced}
          />
        )}
      </TabsContent>

      <TabsContent value="details" className="space-y-6">
        <DetailsView
          sectionDetails={sectionDetails}
          scope3CombinedDetails={scope3CombinedDetails}
          scope1Total={scope1Total}
          scope2Total={scope2Total}
          scope3TotalWithAdvanced={scope3TotalWithAdvanced}
          totalGlobal={totalGlobal}
          totalEntries={totalEntries}
          advancedCount={advancedCount}
          isAdvancedMode={isAdvancedMode}
          hasAnyData={hasAnyData}
          isAuthenticated={isAuthenticated}
          isSaving={isSaving}
          onRemoveScope1Detail={onRemoveScope1Detail}
          onRemoveScope2Detail={onRemoveScope2Detail}
          onRemoveScope3Detail={onRemoveScope3Detail}
          onClearScope1={onClearScope1}
          onClearScope2={onClearScope2}
          onClearScope3={onClearScope3}
          onResetAll={onResetAll}
          onSave={onSave}
          onExportCSV={onExportCSV}
        />
      </TabsContent>
    </Tabs>
  );
};
