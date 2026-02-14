import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TrendingUp, Flame, Zap, Globe, Calendar,
  ArrowDown, ArrowUp, CheckCircle2, AlertTriangle
} from "lucide-react";

interface GHGDashboardHeaderProps {
  scope1: number;
  scope2: number;
  scope3Total: number;
  totalGlobal: number;
  chiffreAffaires: number;
  nombrePersonnels: number;
  emissionsAnneePrecedente: number;
  isAdvancedMode: boolean;
  onChiffreAffairesChange: (value: number) => void;
  onScopeClick: (scope: 1 | 2 | 3) => void;
}

export const GHGDashboardHeader: React.FC<GHGDashboardHeaderProps> = ({
  scope1,
  scope2,
  scope3Total,
  totalGlobal,
  chiffreAffaires,
  nombrePersonnels,
  emissionsAnneePrecedente,
  isAdvancedMode,
  onChiffreAffairesChange,
  onScopeClick,
}) => {
  const variationBadge = () => {
    if (emissionsAnneePrecedente <= 0 || totalGlobal <= 0) return null;
    const currentTotal = totalGlobal / 1000;
    const variation = ((currentTotal - emissionsAnneePrecedente) / emissionsAnneePrecedente) * 100;
    const isReduction = variation < 0;
    return (
      <Badge
        className={`flex items-center gap-1 ${
          isReduction
            ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300'
            : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
        }`}
        variant="outline"
      >
        {isReduction ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
        {Math.abs(variation).toFixed(1)}% vs 2024
      </Badge>
    );
  };

  return (
    <>
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Résultat Global des Émissions GES
              </CardTitle>
              <Badge variant="outline" className="text-sm font-medium">
                <Calendar className="h-3 w-3 mr-1" />
                Année 2025
              </Badge>
              {variationBadge()}
            </div>
            {isAdvancedMode && (
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                GHG Protocol - 15 catégories
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Scope cards - using button role for accessibility */}
            <button
              type="button"
              className="text-left rounded-xl p-4 bg-red-500/10 border border-red-500/30 cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onScopeClick(1)}
              aria-label={`Scope 1: ${(scope1 / 1000).toFixed(2)} tonnes CO2 équivalent`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-muted-foreground">Scope 1</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{(scope1 / 1000).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </button>

            <button
              type="button"
              className="text-left rounded-xl p-4 bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onScopeClick(2)}
              aria-label={`Scope 2: ${(scope2 / 1000).toFixed(2)} tonnes CO2 équivalent`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">Scope 2</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{(scope2 / 1000).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </button>

            <button
              type="button"
              className="text-left rounded-xl p-4 bg-blue-500/10 border border-blue-500/30 cursor-pointer hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onScopeClick(3)}
              aria-label={`Scope 3: ${(scope3Total / 1000).toFixed(2)} tonnes CO2 équivalent`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Scope 3</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{(scope3Total / 1000).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </button>

            <div className="hidden md:flex items-center justify-center">
              <div className="text-3xl font-bold text-muted-foreground">=</div>
            </div>

            <Card className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">TOTAL</span>
              </div>
              <div className="text-3xl font-bold text-primary">{(totalGlobal / 1000).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </Card>
          </div>

          {/* Barre de répartition */}
          {totalGlobal > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                <div className="bg-red-500 transition-all duration-500" style={{ width: `${(scope1 / totalGlobal) * 100}%` }} />
                <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(scope2 / totalGlobal) * 100}%` }} />
                <div className="bg-blue-500 transition-all duration-500" style={{ width: `${(scope3Total / totalGlobal) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Scope 1: {((scope1 / totalGlobal) * 100).toFixed(1)}%
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Scope 2: {((scope2 / totalGlobal) * 100).toFixed(1)}%
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Scope 3: {((scope3Total / totalGlobal) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Intensité carbone et CA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Intensité carbone</span>
              <span className="text-lg font-bold text-destructive">
                {chiffreAffaires > 0 ? (totalGlobal / 1000 / chiffreAffaires).toFixed(3) : '0.000'} tCO₂e/k€
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">CA:</span>
              <Input
                type="number"
                min="1"
                value={chiffreAffaires}
                onChange={(e) => onChiffreAffairesChange(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 text-center font-bold h-8"
              />
              <span className="text-sm font-medium">k€</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Par employé</span>
              <span className="text-lg font-bold">
                {nombrePersonnels > 0 ? (totalGlobal / 1000 / nombrePersonnels).toFixed(2) : '0.00'} tCO₂e
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerte Sanity Check */}
      {scope1 / 1000 > 500 && (
        <Alert variant="destructive" className="border-2 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Attention - Valeur anormalement élevée</AlertTitle>
          <AlertDescription className="text-base">
            Le Scope 1 affiche <strong>{(scope1 / 1000).toFixed(1)} tCO₂e</strong>, ce qui semble très élevé.
            <br />
            <strong>Avez-vous saisi des kg au lieu de tonnes ?</strong> Les facteurs d'émission Base Carbone® sont en <strong>kg CO₂e par unité</strong>.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
