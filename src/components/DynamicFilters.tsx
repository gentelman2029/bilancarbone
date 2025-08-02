import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, RotateCcw, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DynamicFiltersProps {
  onFiltersChange: (filters: {
    period: string;
    scope: string;
    entity: string;
    category: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
  availableEntities: string[];
  availableCategories: string[];
  currentFilters: {
    period: string;
    scope: string;
    entity: string;
    category: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export const DynamicFilters: React.FC<DynamicFiltersProps> = ({
  onFiltersChange,
  availableEntities,
  availableCategories,
  currentFilters
}) => {
  const handleFilterChange = (key: string, value: string | Date | undefined) => {
    onFiltersChange({
      ...currentFilters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      period: "Tous",
      scope: "Tous les Scopes",
      entity: "Tous les sites",
      category: "Toutes les catégories",
      startDate: undefined,
      endDate: undefined
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.period !== "Tous") count++;
    if (currentFilters.scope !== "Tous les Scopes") count++;
    if (currentFilters.entity !== "Tous les sites") count++;
    if (currentFilters.category !== "Toutes les catégories") count++;
    if (currentFilters.startDate || currentFilters.endDate) count++;
    return count;
  };

  const removeFilter = (filterKey: string) => {
    const resetValues: Record<string, any> = {
      period: "Tous",
      scope: "Tous les Scopes",
      entity: "Tous les sites",
      category: "Toutes les catégories",
      startDate: undefined,
      endDate: undefined
    };

    if (filterKey === 'date') {
      handleFilterChange('startDate', undefined);
      handleFilterChange('endDate', undefined);
    } else {
      handleFilterChange(filterKey, resetValues[filterKey]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres Dynamiques
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Réinitialiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtre Période */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Période</label>
            <Select value={currentFilters.period} onValueChange={(value) => handleFilterChange('period', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Toutes les périodes</SelectItem>
                <SelectItem value="Année 2024">Année 2024</SelectItem>
                <SelectItem value="Année 2023">Année 2023</SelectItem>
                <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                <SelectItem value="Personnalisé">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre Scope */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Scope</label>
            <Select value={currentFilters.scope} onValueChange={(value) => handleFilterChange('scope', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les Scopes">Tous les Scopes</SelectItem>
                <SelectItem value="Scope 1">Scope 1 uniquement</SelectItem>
                <SelectItem value="Scope 2">Scope 2 uniquement</SelectItem>
                <SelectItem value="Scope 3">Scope 3 uniquement</SelectItem>
                <SelectItem value="Scope 1+2">Scope 1 + 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre Entité/Site */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Site/Entité</label>
            <Select value={currentFilters.entity} onValueChange={(value) => handleFilterChange('entity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les sites">Tous les sites</SelectItem>
                {availableEntities.map(entity => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre Catégorie */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select value={currentFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Toutes les catégories">Toutes les catégories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre Date Personnalisée */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dates</label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentFilters.startDate ? format(currentFilters.startDate, "dd/MM/yy") : "Début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentFilters.startDate}
                    onSelect={(date) => handleFilterChange('startDate', date)}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentFilters.endDate ? format(currentFilters.endDate, "dd/MM/yy") : "Fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentFilters.endDate}
                    onSelect={(date) => handleFilterChange('endDate', date)}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Filtres Actifs */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filtres actifs:</span>
              {currentFilters.period !== "Tous" && (
                <Badge variant="secondary" className="text-xs">
                  {currentFilters.period}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('period')}
                  />
                </Badge>
              )}
              {currentFilters.scope !== "Tous les Scopes" && (
                <Badge variant="secondary" className="text-xs">
                  {currentFilters.scope}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('scope')}
                  />
                </Badge>
              )}
              {currentFilters.entity !== "Tous les sites" && (
                <Badge variant="secondary" className="text-xs">
                  {currentFilters.entity}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('entity')}
                  />
                </Badge>
              )}
              {currentFilters.category !== "Toutes les catégories" && (
                <Badge variant="secondary" className="text-xs">
                  {currentFilters.category}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('category')}
                  />
                </Badge>
              )}
              {(currentFilters.startDate || currentFilters.endDate) && (
                <Badge variant="secondary" className="text-xs">
                  Période personnalisée
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter('date')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};