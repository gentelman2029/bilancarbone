import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Calculator, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormulaVariable {
  name: string;
  value: string;
  unit: string;
  description?: string;
}

interface FormulaModalProps {
  title: string;
  formula: string;
  description: string;
  variables: FormulaVariable[];
  result: string;
  resultUnit: string;
  sources?: string[];
}

export const FormulaModal = ({
  title,
  formula,
  description,
  variables,
  result,
  resultUnit,
  sources = [],
}: FormulaModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-indigo-100 text-gray-400 hover:text-indigo-600"
        >
          <Calculator className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Calculator className="h-5 w-5 text-indigo-600" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Formula Display */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Formule</p>
            <code className="text-lg font-mono text-indigo-700 font-semibold">
              {formula}
            </code>
          </div>

          {/* Variables */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Variables utilisées</p>
            <div className="space-y-2">
              {variables.map((variable, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono bg-white text-gray-700 px-2 py-1 rounded border border-gray-200">
                      {variable.name}
                    </code>
                    {variable.description && (
                      <span className="text-xs text-gray-500">{variable.description}</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-gray-900">{variable.value}</span>
                    <span className="text-xs text-gray-500">{variable.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-xs text-emerald-600 uppercase tracking-wider font-medium mb-2">Résultat calculé</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{result}</span>
              <span className="text-sm text-emerald-600">{resultUnit}</span>
            </div>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Sources : </span>
                  {sources.join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
