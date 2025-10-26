import React, { useMemo } from 'react';
import { Sliders, Package, List } from 'lucide-react';

import { sampleDatasets } from './constants/datasets';
import { useCvrpAlgorithm } from './hooks/useCvrpAlgorithm';
import Visualization from './components/Visualization';
import Controls from './components/Controls';
import Summary from './components/Summary';
import Log from './components/Log';

export default function App() {
  const initialDatasetKey = Object.keys(sampleDatasets)[0];
  const {
    state,
    selectedDataset,
    handlePlayPause,
    handleNextStep,
    handleReset,
    handleDatasetChange,
    handleAlgorithmChange,
    handleRunComparison
  } = useCvrpAlgorithm(initialDatasetKey);

  const {
    depot,
    customerNodes,
    vehicles,
    currentVehicleId,
    logMessages,
    totalDistance,
    animationState,
    algorithmState,
    algorithmType,
    comparisonResults,
  } = state;

  const allNodes = useMemo(() => [depot, ...customerNodes], [depot, customerNodes]);
  
  const displayTotalDistance = comparisonResults.length > 0 
    ? comparisonResults.reduce((min, res) => Math.min(min, res.distance), totalDistance)
    : totalDistance;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Main visualization panel remains flexible */}
      <main className="flex-1 flex flex-col p-4 md:p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          CVRP Algorithm Visualizer & Comparator
        </h1>
        <div className="flex-1 w-full max-w-4xl mx-auto h-64 md:h-auto">
          <Visualization
            nodes={allNodes}
            depot={depot}
            vehicles={vehicles}
            currentVehicleId={currentVehicleId}
          />
        </div>
      </main>

      {/* Sidebar: Wider, flex-col on mobile, flex-row on desktop */}
      <aside className="w-full md:w-[700px] lg:w-[800px] bg-gray-800 p-6 shadow-2xl flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
        
        {/* Column 1: Log (Appears at bottom on mobile, left on desktop) */}
        <div className="bg-gray-700/50 p-5 rounded-xl shadow-inner flex-1 flex flex-col min-h-[200px] md:w-1/2 order-2 md:order-1">
          <div className="flex items-center space-x-3 mb-4">
            <List className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Step-by-Step Log</h2>
          </div>
          <Log messages={logMessages} />
        </div>

        {/* Column 2: Controls & Summary (Appears at top on mobile, right on desktop) */}
        <div className="flex flex-col md:w-1/2 space-y-6 order-1 md:order-2">
          {/* Controls Section */}
          <div className="bg-gray-700/50 p-5 rounded-xl shadow-inner flex-shrink-0">
            <div className="flex items-center space-x-3 mb-4">
              <Sliders className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Controls</h2>
            </div>
            <Controls
              datasets={sampleDatasets}
              selectedDataset={selectedDataset}
              onDatasetChange={handleDatasetChange}
              onPlayPause={handlePlayPause}
              onNextStep={handleNextStep}
              onReset={handleReset}
              onAlgorithmChange={handleAlgorithmChange}
              onRunComparison={handleRunComparison}
              animationState={animationState}
              algorithmType={algorithmType}
              algorithmState={algorithmState}
            />
          </div>
          
          {/* Summary Section */}
          <div className="bg-gray-700/50 p-5 rounded-xl shadow-inner flex-shrink-0">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Optimization Results</h2>
            </div>
            <Summary
              vehicles={vehicles}
              totalDistance={displayTotalDistance}
              comparisonResults={comparisonResults}
            />
          </div>
        </div>

      </aside>
    </div>
  );
}

