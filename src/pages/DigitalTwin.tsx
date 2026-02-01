import { useDigitalTwin } from "@/hooks/useDigitalTwin";
import { useDigitalTwinTour } from "@/hooks/useDigitalTwinTour";
import { DigitalTwinThemeProvider } from "@/contexts/DigitalTwinThemeContext";
import {
  DigitalTwinSidebar,
  DigitalTwinHeader,
  ConfigPanel,
  KPICards,
  ProjectionChart,
  AIRecommendation,
  AdditionalInfo,
  DigitalTwinTour,
  CalculationNotes,
  AdvancedHypothesesAccordion,
  SensitivityInsight
} from "@/components/digital-twin";

const DigitalTwinContent = () => {
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
    energyPriceEscalation,
    setEnergyPriceEscalation,
    voltageRegime,
    setVoltageRegime,
    includeWeatherVariability,
    setIncludeWeatherVariability,
    includeFiscalBenefits,
    setIncludeFiscalBenefits,
    isSimulating,
    validation,
    metrics,
    projectionData,
    aiRecommendation,
    handleSimulation,
    STEG_TARIFFS,
    TRACKER_ADDITIONAL_COST,
    SUBSIDY_REDUCTION,
    // CAPEX unit costs
    solarUnitCost,
    setSolarUnitCost,
    batteryUnitCost,
    setBatteryUnitCost,
    // Advanced hypotheses
    corporateTaxRate,
    setCorporateTaxRate,
    discountRate,
    setDiscountRate,
    omPercentage,
    setOmPercentage,
    panelLifetime,
    setPanelLifetime,
    batteryLifetime,
    setBatteryLifetime,
    depreciationYears,
    setDepreciationYears,
    weatherScenario,
    setWeatherScenario,
    // Sensitivity tracking
    previousMetrics,
    changedParameter,
  } = useDigitalTwin();

  const {
    runTour,
    stepIndex,
    steps,
    startTour,
    handleJoyrideCallback,
  } = useDigitalTwinTour();

  return (
    <div 
      className="min-h-screen flex text-gray-900"
      style={{ 
        background: 'linear-gradient(180deg, hsl(142 60% 96%) 0%, hsl(120 40% 98%) 100%)' 
      }}
    >
      {/* Joyride Tour */}
      <DigitalTwinTour
        runTour={runTour}
        steps={steps}
        stepIndex={stepIndex}
        handleCallback={handleJoyrideCallback}
      />

      {/* Sidebar */}
      <DigitalTwinSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DigitalTwinHeader onStartTour={startTour} />

        {/* Main Grid */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Control Panel */}
            <div className="lg:col-span-5 space-y-5">
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
                energyPriceEscalation={energyPriceEscalation}
                setEnergyPriceEscalation={setEnergyPriceEscalation}
                voltageRegime={voltageRegime}
                setVoltageRegime={setVoltageRegime}
                includeWeatherVariability={includeWeatherVariability}
                setIncludeWeatherVariability={setIncludeWeatherVariability}
                includeFiscalBenefits={includeFiscalBenefits}
                setIncludeFiscalBenefits={setIncludeFiscalBenefits}
                isSimulating={isSimulating}
                validation={validation}
                onSimulate={handleSimulation}
                stegTariffs={STEG_TARIFFS}
                solarUnitCost={solarUnitCost}
                setSolarUnitCost={setSolarUnitCost}
                batteryUnitCost={batteryUnitCost}
                setBatteryUnitCost={setBatteryUnitCost}
                trackerAdditionalCost={TRACKER_ADDITIONAL_COST}
                subsidyReduction={SUBSIDY_REDUCTION}
                metrics={metrics}
              />

              {/* Advanced Hypotheses Accordion */}
              <AdvancedHypothesesAccordion
                corporateTaxRate={corporateTaxRate}
                setCorporateTaxRate={setCorporateTaxRate}
                discountRate={discountRate}
                setDiscountRate={setDiscountRate}
                omPercentage={omPercentage}
                setOmPercentage={setOmPercentage}
                panelLifetime={panelLifetime}
                setPanelLifetime={setPanelLifetime}
                batteryLifetime={batteryLifetime}
                setBatteryLifetime={setBatteryLifetime}
                depreciationYears={depreciationYears}
                setDepreciationYears={setDepreciationYears}
                weatherScenario={weatherScenario}
                setWeatherScenario={setWeatherScenario}
              />
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-900">Impact Financier & Carbone</h2>
                <p className="text-sm text-gray-500">Résultats de la simulation (temps réel)</p>
              </div>

              {/* Sensitivity Insight Alert */}
              <SensitivityInsight
                previousMetrics={previousMetrics}
                currentMetrics={metrics}
                changedParameter={changedParameter}
              />

              {/* KPI Cards Row */}
              <KPICards metrics={metrics} isLoading={isSimulating} />

              {/* Main Chart */}
              <ProjectionChart data={projectionData} isLoading={isSimulating} />

              {/* AI Recommendation Alert */}
              <AIRecommendation recommendation={aiRecommendation} />

              {/* Additional Info */}
              <AdditionalInfo metrics={metrics} />

              {/* Calculation Notes (Collapsible) */}
              <CalculationNotes />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const DigitalTwin = () => {
  return (
    <DigitalTwinThemeProvider>
      <DigitalTwinContent />
    </DigitalTwinThemeProvider>
  );
};

export default DigitalTwin;