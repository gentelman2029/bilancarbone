import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Leaf, Users, Building2, BookOpen, ArrowRight } from 'lucide-react';
import { ACTION_SUGGESTIONS_LIBRARY, ActionSuggestion } from '@/lib/rse/actionSuggestions';
import { RSEAction } from '@/lib/rse/types';

interface RSEActionLibraryProps {
  onAddToBacklog: (action: Omit<RSEAction, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
}

const CATEGORY_CONFIG = {
  E: { label: 'Environnement', icon: Leaf, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
  S: { label: 'Social', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  G: { label: 'Gouvernance', icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-100' },
};

export function RSEActionLibrary({ onAddToBacklog }: RSEActionLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'E' | 'S' | 'G'>('all');

  const filteredLibrary = ACTION_SUGGESTIONS_LIBRARY.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.kpiLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.suggestions.some(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const handleAddAction = (suggestion: ActionSuggestion['suggestions'][0], kpiId: string) => {
    onAddToBacklog({
      ...suggestion,
      linkedKpiId: kpiId,
      isSuggestion: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Bibliothèque d'Actions "Tunisia Compliant"
            </CardTitle>
            <CardDescription>
              Actions standards conformes aux réglementations tunisiennes et européennes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="E" className="gap-1">
                <Leaf className="h-3 w-3" /> E
              </TabsTrigger>
              <TabsTrigger value="S" className="gap-1">
                <Users className="h-3 w-3" /> S
              </TabsTrigger>
              <TabsTrigger value="G" className="gap-1">
                <Building2 className="h-3 w-3" /> G
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Action Library */}
        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {filteredLibrary.map((item) => {
              const config = CATEGORY_CONFIG[item.category];
              const Icon = config.icon;
              
              return (
                <div key={item.kpiId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.kpiId} - {item.kpiLabel}</h3>
                      <p className="text-xs text-muted-foreground">
                        Seuil de déclenchement: Score &lt; {item.threshold}/100
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pl-11">
                    {item.suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {suggestion.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {suggestion.legislationRef.map((ref, refIdx) => (
                              <Badge key={refIdx} variant="outline" className="text-xs">
                                {ref}
                              </Badge>
                            ))}
                            {suggestion.impactMetrics.regionalImpact && (
                              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                Impact Régional
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Budget: {suggestion.impactMetrics.costEstimated.toLocaleString()} TND</span>
                            {suggestion.impactMetrics.kpiImpactPoints && (
                              <span className="text-emerald-600">+{suggestion.impactMetrics.kpiImpactPoints} points</span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddAction(suggestion, item.kpiId)}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredLibrary.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune action trouvée pour votre recherche</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
