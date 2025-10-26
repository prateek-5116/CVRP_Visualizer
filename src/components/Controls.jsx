import React from 'react';
import { Play, Pause, FastForward, RotateCcw, ChevronDown, Rocket, BarChart2 } from 'lucide-react';
import { ALGORITHM_TYPES } from '../constants/algorithms';

const Controls = ({
  datasets,
  selectedDataset,
  onDatasetChange,
  onPlayPause,
  onNextStep,
  onReset,
  onAlgorithmChange,
  onRunComparison,
  animationState,
  algorithmType,
  algorithmState,
}) => {
  const isRunning = animationState === 'playing';
  const isDone = algorithmState === 'done';
  const isIdle = algorithmState === 'idle';
  const isHybridGreedy = algorithmType === ALGORITHM_TYPES.GREEDY_HYBRID;
  const isRunningProcess = algorithmState === 'running';

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="algorithm" className="block text-sm font-medium text-gray-300 mb-1">
          Select Algorithm
        </label>
        <div className="relative">
          <select
            id="algorithm"
            value={algorithmType}
            onChange={(e) => onAlgorithmChange(e.target.value)}
            disabled={!isIdle && algorithmState !== 'done' && algorithmState !== 'done'}
            className="w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white appearance-none"
          >
            {Object.keys(ALGORITHM_TYPES).map(key => (
              <option key={key} value={ALGORITHM_TYPES[key]}>
                {ALGORITHM_TYPES[key]}
              </option>
            ))}
          </select>
          <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>
      
      <div>
        <label htmlFor="dataset" className="block text-sm font-medium text-gray-300 mb-1">
          Select Dataset
        </label>
        <div className="relative">
          <select
            id="dataset"
            value={selectedDataset}
            onChange={(e) => onDatasetChange(e.target.value)}
            disabled={!isIdle && algorithmState !== 'done' && algorithmState !== 'done'}
            className="w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white appearance-none"
          >
            {Object.keys(datasets).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onPlayPause}
          disabled={isRunningProcess}
          className={`flex items-center justify-center p-3 rounded-lg text-white font-semibold shadow-md transition-all duration-200 col-span-2
            ${isRunningProcess ? 'bg-gray-600 cursor-wait' : 
            (isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700')}
          `}
        >
          {isRunningProcess ? 'Running...' : isHybridGreedy ? (
            <>
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span className="ml-2">{isRunning ? 'Pause' : 'Play (Step Mode)'}</span>
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              <span className="ml-2">Run Algorithm</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center p-3 rounded-lg text-white font-semibold shadow-md transition-all duration-200 bg-red-600 hover:bg-red-700 disabled:bg-gray-500"
          disabled={isRunningProcess}
        >
          <RotateCcw className="h-5 w-5" />
          <span className="ml-2">Reset</span>
        </button>
        
        {isHybridGreedy && (
          <button
            onClick={onNextStep}
            disabled={isRunning || isDone || isRunningProcess}
            className="flex items-center justify-center p-3 rounded-lg text-white font-semibold shadow-md transition-all duration-200 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed col-span-1"
          >
            <FastForward className="h-5 w-5" />
            <span className="ml-2">Next Step</span>
          </button>
        )}
      </div>

      <button
        onClick={onRunComparison}
        disabled={isRunningProcess}
        className={`flex items-center justify-center w-full p-3 rounded-lg text-white font-bold shadow-md transition-all duration-200 bg-purple-600 hover:bg-purple-700 ${isRunningProcess ? 'bg-gray-500 cursor-wait' : ''}`}
      >
        <BarChart2 className="h-5 w-5 mr-2" />
        {isRunningProcess ? 'Comparing...' : 'Run Full Comparison'}
      </button>
    </div>
  );
};

export default Controls;