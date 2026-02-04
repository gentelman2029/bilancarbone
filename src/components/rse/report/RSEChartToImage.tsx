// RSE Chart to Image Converter
// Uses html2canvas to convert Recharts components to images for PDF export

import { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RSEReportData } from '@/hooks/useRSEReport';

interface ChartImageData {
  scopePieChart?: string;
  esgBarChart?: string;
  actionsStatusPie?: string;
  budgetChart?: string;
}

interface RSEChartToImageProps {
  reportData: RSEReportData;
  onChartsReady: (charts: ChartImageData) => void;
}

const COLORS = {
  scope1: '#EF4444', // red
  scope2: '#F59E0B', // amber
  scope3: '#3B82F6', // blue
  E: '#10B981', // emerald
  S: '#3B82F6', // blue
  G: '#8B5CF6', // purple
  completed: '#10B981',
  inProgress: '#3B82F6',
  todo: '#94a3b8',
  blocked: '#EF4444',
};

export function RSEChartToImage({ reportData, onChartsReady }: RSEChartToImageProps) {
  const scopePieRef = useRef<HTMLDivElement>(null);
  const esgBarRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  // Simulated Scope data (would come from Carbon module in real app)
  const scopeData = [
    { name: 'Scope 1', value: 35, color: COLORS.scope1 },
    { name: 'Scope 2', value: 25, color: COLORS.scope2 },
    { name: 'Scope 3', value: 40, color: COLORS.scope3 },
  ];

  // ESG Score data
  const esgData = [
    { name: 'Environnement', score: reportData.esgScores.categoryScores.E || 0, fill: COLORS.E },
    { name: 'Social', score: reportData.esgScores.categoryScores.S || 0, fill: COLORS.S },
    { name: 'Gouvernance', score: reportData.esgScores.categoryScores.G || 0, fill: COLORS.G },
  ];

  // Actions status data
  const actionsData = [
    { name: 'Terminées', value: reportData.actionStats.completed, color: COLORS.completed },
    { name: 'En cours', value: reportData.actionStats.inProgress, color: COLORS.inProgress },
    { name: 'À faire', value: reportData.actionStats.todo, color: COLORS.todo },
    { name: 'Bloquées', value: reportData.actionStats.blocked, color: COLORS.blocked },
  ];

  // Budget data
  const budgetData = [
    { name: 'Consommé', value: reportData.budgetStats.spent, fill: COLORS.completed },
    { name: 'Restant', value: reportData.budgetStats.remaining, fill: '#e2e8f0' },
  ];

  const captureCharts = useCallback(async () => {
    const charts: ChartImageData = {};

    // Helper function to capture a chart
    const captureElement = async (ref: React.RefObject<HTMLDivElement>): Promise<string | undefined> => {
      if (!ref.current) return undefined;
      
      try {
        const canvas = await html2canvas(ref.current, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher resolution
          logging: false,
          useCORS: true,
        });
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing chart:', error);
        return undefined;
      }
    };

    // Capture all charts
    charts.scopePieChart = await captureElement(scopePieRef);
    charts.esgBarChart = await captureElement(esgBarRef);
    charts.actionsStatusPie = await captureElement(actionsRef);
    charts.budgetChart = await captureElement(budgetRef);

    onChartsReady(charts);
  }, [onChartsReady]);

  // Expose capture function via ref or effect
  // You would call this when ready to generate PDF

  return (
    <div className="fixed -left-[9999px] top-0 pointer-events-none">
      {/* Hidden charts for canvas capture */}
      
      {/* Scope Pie Chart */}
      <div ref={scopePieRef} className="bg-white p-4" style={{ width: 400, height: 300 }}>
        <h3 className="text-center font-bold mb-2">Répartition des Émissions par Scope</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={scopeData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {scopeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ESG Bar Chart */}
      <div ref={esgBarRef} className="bg-white p-4" style={{ width: 450, height: 300 }}>
        <h3 className="text-center font-bold mb-2">Scores ESG par Pilier</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={esgData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {esgData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Actions Status Pie */}
      <div ref={actionsRef} className="bg-white p-4" style={{ width: 400, height: 300 }}>
        <h3 className="text-center font-bold mb-2">Statut des Actions RSE</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={actionsData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {actionsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Chart */}
      <div ref={budgetRef} className="bg-white p-4" style={{ width: 350, height: 300 }}>
        <h3 className="text-center font-bold mb-2">Utilisation Budgétaire</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={budgetData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
            >
              {budgetData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} TND`} />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-center font-bold text-lg">{reportData.budgetStats.utilizationRate}%</p>
        <p className="text-center text-sm text-gray-600">Budget utilisé</p>
      </div>

      {/* Trigger capture after render */}
      <button onClick={captureCharts} className="hidden">Capture</button>
    </div>
  );
}

// Utility function to capture charts for PDF
export async function captureChartsForPDF(
  reportData: RSEReportData
): Promise<ChartImageData> {
  return new Promise((resolve) => {
    // Create temporary container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    // This would be implemented with proper React rendering
    // For now, return placeholder
    setTimeout(() => {
      document.body.removeChild(container);
      resolve({});
    }, 100);
  });
}

export default RSEChartToImage;
