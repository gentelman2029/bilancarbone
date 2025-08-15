import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ActionFilters {
  status?: string[];
  scope?: string[];
  priority?: string[];
  search?: string;
}

interface ActionFiltersProps {
  filters: ActionFilters;
  onFiltersChange: (filters: Partial<ActionFilters>) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  actionsCount: number;
  filteredCount: number;
}

export const ActionFilters = ({
  filters,
  onFiltersChange,
  sortField,
  sortDirection,
  onSortChange,
  actionsCount,
  filteredCount
}: ActionFiltersProps) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'todo', label: t('actions.status.todo') },
    { value: 'in-progress', label: t('actions.status.in_progress') },
    { value: 'completed', label: t('actions.status.completed') },
    { value: 'delayed', label: t('actions.status.delayed') }
  ];

  const scopeOptions = [
    { value: 'Scope 1', label: 'Scope 1' },
    { value: 'Scope 2', label: 'Scope 2' },
    { value: 'Scope 3', label: 'Scope 3' },
    { value: 'Transverse', label: t('actions.scope.transverse') }
  ];

  const priorityOptions = [
    { value: 'high', label: t('actions.priority.high') },
    { value: 'medium', label: t('actions.priority.medium') },
    { value: 'low', label: t('actions.priority.low') }
  ];

  const sortOptions = [
    { value: 'deadline', label: t('actions.sort.deadline') },
    { value: 'impact', label: t('actions.sort.impact') },
    { value: 'cost', label: t('actions.sort.cost') },
    { value: 'priority', label: t('actions.sort.priority') },
    { value: 'status', label: t('actions.sort.status') },
    { value: 'title', label: t('actions.sort.title') }
  ];

  const handleCheckboxChange = (type: keyof ActionFilters, value: string, checked: boolean) => {
    const currentValues = filters[type] as string[] || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({ [type]: newValues.length > 0 ? newValues : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({ status: undefined, scope: undefined, priority: undefined, search: undefined });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : v.length > 0)).length;

  return (
    <Card className="p-4 border-0 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Header with search and toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={t('actions.filters.search_placeholder')}
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ search: e.target.value || undefined })}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredCount} / {actionsCount} {t('actions.filters.actions')}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {t('actions.filters.filters')}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                {t('actions.filters.clear')}
              </Button>
            )}
          </div>
        </div>

        {/* Sorting */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Label className="text-sm font-medium whitespace-nowrap">
            {t('actions.filters.sort_by')}:
          </Label>
          <div className="flex gap-2">
            <Select value={sortField} onValueChange={(value) => onSortChange(value, sortDirection)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortDirection === 'asc' ? t('actions.filters.asc') : t('actions.filters.desc')}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('actions.filters.status')}</Label>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={(filters.status || []).includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('status', option.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('actions.filters.scope')}</Label>
              <div className="space-y-2">
                {scopeOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`scope-${option.value}`}
                      checked={(filters.scope || []).includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('scope', option.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`scope-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('actions.filters.priority')}</Label>
              <div className="space-y-2">
                {priorityOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={(filters.priority || []).includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('priority', option.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`priority-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};