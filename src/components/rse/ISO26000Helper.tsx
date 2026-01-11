import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ISO_26000_QUESTIONS } from '@/lib/rse/types';
import { HelpCircle, Lightbulb, CheckCircle2 } from 'lucide-react';

interface ISO26000HelperProps {
  onQuestionClick?: (examples: string[]) => void;
}

export function ISO26000Helper({ onQuestionClick }: ISO26000HelperProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Aide à l'identification
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Guide ISO 26000 - Identification des Parties Prenantes
          </DialogTitle>
          <DialogDescription>
            Questions directrices de la norme ISO 26000 pour identifier vos parties prenantes
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {ISO_26000_QUESTIONS.map((item, index) => (
              <Card key={item.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start gap-2">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">
                      Q{index + 1}
                    </Badge>
                    <span>{item.question}</span>
                  </CardTitle>
                  <CardDescription className="text-sm pl-8">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 pl-8">
                  <div className="flex flex-wrap gap-2">
                    {item.examples.map((example, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => onQuestionClick?.([example])}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {example}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Conseil ISO 26000</p>
              <p className="text-muted-foreground">
                Une partie prenante peut appartenir à plusieurs catégories. Identifiez toutes les parties 
                qui ont un intérêt dans vos activités, même si elles ne sont pas immédiatement évidentes. 
                Le dialogue avec les parties prenantes est essentiel pour une démarche RSE efficace.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
