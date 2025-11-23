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
    handleRunComparison,
    handleSpeedChange // Get handler from hook
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
    animationSpeed // Get speed from state
  } = state;

  const allNodes = useMemo(() => [depot, ...customerNodes], [depot, customerNodes]);
  
  const displayTotalDistance = comparisonResults.length > 0 
    ? comparisonResults.reduce((min, res) => Math.min(min, res.distance), totalDistance)
    : totalDistance;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 font-sans">
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

      {/* Sidebar: Changed to horizontal layout on medium screens and up */}
      <aside className="w-full md:w-auto md:flex-1 flex flex-col md:flex-row bg-gray-800 shadow-2xl">
        
        {/* Left Panel: Step-by-Step Log (Takes 1/2 width on desktop) */}
        <div className="flex-1 p-6 flex flex-col min-h-[200px] md:w-1/2">
          <div className="flex items-center space-x-3 mb-4 flex-shrink-0">
            <List className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Step-by-Step Log</h2>
          </div>
          {/* Pass animationState and algorithmState to Log */}
          <Log
            messages={logMessages}
            animationState={animationState}
            algorithmState={algorithmState}
          />
        </div>

        {/* Right Panel: Controls & Summary (Takes 1/2 width on desktop) */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto md:w-1/2">
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
              animationSpeed={animationSpeed} 
              onSpeedChange={handleSpeedChange} 
            />
          </div>
          
          <div className="bg-gray-700/50 p-5 rounded-xl shadow-inner flex-shrink-0">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Optimization Results</h2>
            </div>
            {/* Pass animationState and algorithmState to Summary */}
            <Summary
              vehicles={vehicles}
              totalDistance={displayTotalDistance}
              comparisonResults={comparisonResults}
              animationState={animationState}
              algorithmState={algorithmState}
            />
          </div>
        </div>

      </aside>
    </div>
  );
}

