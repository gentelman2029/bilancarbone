import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ExternalLink,
  Shield
} from 'lucide-react';
import { ComplianceAlert } from '@/lib/esg/types';

interface ESGComplianceAlertsProps {
  alerts: ComplianceAlert[];
}

const AlertIcon = ({ type }: { type: ComplianceAlert['type'] }) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getAlertVariant = (type: ComplianceAlert['type']) => {
  switch (type) {
    case 'error': return 'destructive';
    case 'warning': return 'default';
    case 'success': return 'default';
    case 'info': return 'default';
  }
};

const getAlertBorderColor = (type: ComplianceAlert['type']) => {
  switch (type) {
    case 'error': return 'border-destructive/50 bg-destructive/5';
    case 'warning': return 'border-yellow-500/50 bg-yellow-500/5';
    case 'success': return 'border-emerald-500/50 bg-emerald-500/5';
    case 'info': return 'border-blue-500/50 bg-blue-500/5';
  }
};

export const ESGComplianceAlerts: React.FC<ESGComplianceAlertsProps> = ({ alerts }) => {
  const errorCount = alerts.filter(a => a.type === 'error').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Alertes de Conformité
          </span>
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} critique{errorCount > 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                {warningCount} attention
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Conformité Loi RSE Tunisie 2018-35, CSRD et MACF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                <p>Aucune alerte de conformité</p>
                <p className="text-sm">Vos données sont conformes aux réglementations</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Alert 
                  key={alert.id} 
                  className={`${getAlertBorderColor(alert.type)} transition-all hover:shadow-sm`}
                >
                  <AlertIcon type={alert.type} />
                  <div className="ml-2 flex-1">
                    <AlertTitle className="flex items-center gap-2 mb-1">
                      {alert.title}
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {alert.regulation}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {alert.description}
                      {alert.action && (
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {alert.action}
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
