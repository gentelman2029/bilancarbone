import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Building2, Award } from 'lucide-react';

interface ESGScoreGaugesProps {
  eScore: number;
  sScore: number;
  gScore: number;
  totalScore: number;
  grade: string;
  gradeColor: string;
  gradeLabel: string;
}

const RadialGauge: React.FC<{
  score: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  size?: 'sm' | 'lg';
}> = ({ score, label, icon, color, size = 'sm' }) => {
  const radius = size === 'lg' ? 80 : 50;
  const strokeWidth = size === 'lg' ? 12 : 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const viewBox = size === 'lg' ? 200 : 130;
  const center = viewBox / 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={viewBox} height={viewBox} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon}
          <span className={`font-bold ${size === 'lg' ? 'text-3xl' : 'text-xl'} mt-1`}>
            {score.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={`mt-2 font-medium ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        {label}
      </span>
    </div>
  );
};

export const ESGScoreGauges: React.FC<ESGScoreGaugesProps> = ({
  eScore,
  sScore,
  gScore,
  totalScore,
  grade,
  gradeColor,
  gradeLabel,
}) => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Score ESG Global
          </span>
          <Badge 
            className="text-lg px-3 py-1 font-bold"
            style={{ backgroundColor: gradeColor, color: 'white' }}
          >
            {grade}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          {/* Main Score */}
          <div className="relative">
            <RadialGauge
              score={totalScore}
              label="Score Total"
              icon={<Award className="h-8 w-8 text-primary" />}
              color="hsl(var(--primary))"
              size="lg"
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="text-xs">
                {gradeLabel}
              </Badge>
            </div>
          </div>

          {/* Pillar Scores */}
          <div className="grid grid-cols-3 gap-6 w-full pt-4 border-t">
            <RadialGauge
              score={eScore}
              label="Environnement"
              icon={<Leaf className="h-5 w-5 text-emerald-500" />}
              color="hsl(152, 69%, 31%)"
            />
            <RadialGauge
              score={sScore}
              label="Social"
              icon={<Users className="h-5 w-5 text-blue-500" />}
              color="hsl(217, 91%, 60%)"
            />
            <RadialGauge
              score={gScore}
              label="Gouvernance"
              icon={<Building2 className="h-5 w-5 text-purple-500" />}
              color="hsl(271, 91%, 65%)"
            />
          </div>

          {/* Weight indication */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> E: 40%
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> S: 30%
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500" /> G: 30%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
