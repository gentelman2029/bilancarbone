import { useDigitalTwin } from "@/hooks/useDigitalTwin";
import {
  DigitalTwinSidebar,
  DigitalTwinHeader,
  ConfigPanel,
  KPICards,
  ProjectionChart,
  AIRecommendation,
  AdditionalInfo
} from "@/components/digital-twin";

const DigitalTwin = () => {
  const {
    solarPower,
    setSolarPower,
    hasTracker,
    setHasTracker,
    batteryCapacity,
    setBatteryCapacity,
    withSubsidy,
    setWithSubsidy,
    inflationRate,
    setInflationRate,
    voltageRegime,
    setVoltageRegime,
    isSimulating,
    validation,
    metrics,
    projectionData,
    aiRecommendation,
    handleSimulation
  } = useDigitalTwin();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <DigitalTwinSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DigitalTwinHeader />

        {/* Main Grid */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Control Panel */}
            <ConfigPanel
              solarPower={solarPower}
              setSolarPower={setSolarPower}
              hasTracker={hasTracker}
              setHasTracker={setHasTracker}
              batteryCapacity={batteryCapacity}
              setBatteryCapacity={setBatteryCapacity}
              withSubsidy={withSubsidy}
              setWithSubsidy={setWithSubsidy}
              inflationRate={inflationRate}
              setInflationRate={setInflationRate}
              voltageRegime={voltageRegime}
              setVoltageRegime={setVoltageRegime}
              isSimulating={isSimulating}
              validation={validation}
              onSimulate={handleSimulation}
            />

            {/* Right Column - Results */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-1">Impact Financier & Carbone</h2>
                <p className="text-sm text-slate-500">Résultats de la simulation</p>
              </div>

              {/* KPI Cards Row */}
              <KPICards metrics={metrics} isLoading={isSimulating} />

              {/* Main Chart */}
              <ProjectionChart data={projectionData} isLoading={isSimulating} />

              {/* AI Recommendation Alert */}
              <AIRecommendation recommendation={aiRecommendation} />

              {/* Additional Info */}
              <AdditionalInfo metrics={metrics} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DigitalTwin;
