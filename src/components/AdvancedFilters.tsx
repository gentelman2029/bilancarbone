import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, RotateCcw, Building, Target, Calendar as CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export interface DashboardFilters {
  dateRange: DateRange | undefined;
  entity: string;
  scope: string[];
  period: string;
  department: string;
}

interface AdvancedFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  availableEntities?: string[];
  availableDepartments?: string[];
}

export const AdvancedFilters = ({ 
  filters, 
  onFiltersChange,
  availableEntities = ['Siège social', 'Site Paris', 'Site Lyon', 'Site Marseille'],
  availableDepartments = ['Tous', 'Production', 'Administration', 'Commercial', 'R&D']
}: AdvancedFiltersProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const updateFilters = (key: keyof DashboardFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleScope = (scope: string) => {
    const newScopes = filters.scope.includes(scope)
      ? filters.scope.filter(s => s !== scope)
      : [...filters.scope, scope];
    updateFilters('scope', newScopes);
  };

  const resetFilters = () => {
    onFiltersChange({
      dateRange: undefined,
      entity: 'all',
      scope: ['scope1', 'scope2', 'scope3'],
      period: 'year',
      department: 'all'
    });
  };

  const activeFiltersCount = [
    filters.dateRange ? 1 : 0,
    filters.entity !== 'all' ? 1 : 0,
    filters.scope.length !== 3 ? 1 : 0,
    filters.period !== 'year' ? 1 : 0,
    filters.department !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const scopeColors = {
    scope1: '#059669',
    scope2: '#3B82F6', 
    scope3: '#EF4444'
  };

  const scopeLabels = {
    scope1: 'Scope 1',
    scope2: 'Scope 2',
    scope3: 'Scope 3'
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de Données
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Filtre par Période */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Période
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd LLL", { locale: fr })} -{" "}
                        {format(filters.dateRange.to, "dd LLL yyyy", { locale: fr })}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd LLL yyyy", { locale: fr })
                    )
                  ) : (
                    <span>Sélectionner période</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => {
                    updateFilters('dateRange', range);
                    if (range?.from && range?.to) {
                      setIsCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  locale={fr}
                />
                <div className="p-2 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        const startOfYear = new Date(now.getFullYear(), 0, 1);
                        updateFilters('dateRange', { from: startOfYear, to: now });
                        setIsCalendarOpen(false);
                      }}
                    >
                      Cette année
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
                        const endLastYear = new Date(now.getFullYear() - 1, 11, 31);
                        updateFilters('dateRange', { from: lastYear, to: endLastYear });
                        setIsCalendarOpen(false);
                      }}
                    >
                      Année dernière
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtre par Entité/Site */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Entité/Site
            </label>
            <Select value={filters.entity} onValueChange={(value) => updateFilters('entity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner entité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entités</SelectItem>
                {availableEntities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par Département */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Département</label>
            <Select value={filters.department} onValueChange={(value) => updateFilters('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner département" />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par Type de Période */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Agrégation</label>
            <Select value={filters.period} onValueChange={(value) => updateFilters('period', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensuel</SelectItem>
                <SelectItem value="quarter">Trimestriel</SelectItem>
                <SelectItem value="year">Annuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par Scope */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Scopes
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(scopeLabels).map(([scope, label]) => (
                <Badge
                  key={scope}
                  variant={filters.scope.includes(scope) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  style={{
                    backgroundColor: filters.scope.includes(scope) 
                      ? scopeColors[scope as keyof typeof scopeColors] 
                      : 'transparent',
                    borderColor: scopeColors[scope as keyof typeof scopeColors],
                    color: filters.scope.includes(scope) 
                      ? 'white' 
                      : scopeColors[scope as keyof typeof scopeColors]
                  }}
                  onClick={() => toggleScope(scope)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé des filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Filtres actifs :</p>
            <div className="flex flex-wrap gap-2">
              {filters.dateRange && (
                <Badge variant="secondary">
                  📅 {filters.dateRange.from && format(filters.dateRange.from, "dd/MM/yy", { locale: fr })}
                  {filters.dateRange.to && ` - ${format(filters.dateRange.to, "dd/MM/yy", { locale: fr })}`}
                </Badge>
              )}
              {filters.entity !== 'all' && (
                <Badge variant="secondary">🏢 {filters.entity}</Badge>
              )}
              {filters.department !== 'all' && (
                <Badge variant="secondary">🏪 {filters.department}</Badge>
              )}
              {filters.scope.length !== 3 && (
                <Badge variant="secondary">🎯 {filters.scope.length} scope{filters.scope.length > 1 ? 's' : ''}</Badge>
              )}
              {filters.period !== 'year' && (
                <Badge variant="secondary">📊 Vue {filters.period === 'month' ? 'mensuelle' : 'trimestrielle'}</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};