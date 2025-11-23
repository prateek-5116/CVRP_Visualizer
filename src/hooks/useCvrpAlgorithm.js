import { useState, useEffect, useCallback } from 'react';
import { sampleDatasets } from '../constants/datasets';
import { vehicleColors } from '../constants/vehicleColors';
import { ALGORITHM_TYPES, COMPARISON_COLORS } from '../constants/algorithms';
import { runAlgorithmStep, runMetaheuristic, hybridGreedyStep } from '../algorithms'; 


const getInitialState = (datasetName) => {
  const data = sampleDatasets[datasetName];
  const allNodes = [data.depot, ...data.customers];
  const nodeMap = allNodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});
  
  return {
    dataset: data,
    depot: data.depot,
    capacity: data.capacity,
    allNodesMap: nodeMap,
    customerNodes: data.customers,
    unvisitedCustomerIds: data.customers.map(c => c.id),
    vehicles: [],
    currentVehicleId: 0,
    vehicleColors: vehicleColors,
    
    algorithmState: 'idle', 
    algorithmType: ALGORITHM_TYPES.GREEDY_HYBRID,
    animationState: 'paused',
    animationSpeed: 500, // Re-add animationSpeed
    logMessages: [`Selected dataset: ${datasetName}. Select an algorithm and run.`],
    totalDistance: 0,
    
    comparisonResults: [],
  };
};

export const useCvrpAlgorithm = (initialDatasetName) => {
  const [selectedDataset, setSelectedDataset] = useState(initialDatasetName);
  const [state, setState] = useState(() => getInitialState(initialDatasetName));

  const addLog = (message) => {
    setState(prevState => ({
      ...prevState,
      logMessages: [...prevState.logMessages, message],
    }));
  };

  const runStep = useCallback(() => {
    if (state.algorithmState === 'done') return;
    
    const currentStateForAlgorithm = {
        ...state,
        vehicles: state.vehicles.map(v => ({
            ...v, 
            route: v.route.map(n => state.allNodesMap[n.id]), 
        })),
    };

    const result = runAlgorithmStep(state.algorithmType, currentStateForAlgorithm);
    
    if (result.message) {
      addLog(result.message);
    }
    
    if (result.newState) {
      setState(s => ({ ...s, ...result.newState }));
    } else if (result.nextState) {
      setState(s => ({ ...s, algorithmState: result.nextState }));
    }
  }, [state]);


  const runMetaheuristicFull = useCallback(() => {
    addLog(`Running ${state.algorithmType} in full optimization mode...`);
    setState(s => ({ ...s, comparisonResults: [], animationState: 'running', algorithmState: 'running' }));
    
    const currentStateForAlgorithm = {
        ...state,
        vehicles: state.vehicles.map(v => ({
            ...v, 
            route: v.route.map(n => state.allNodesMap[n.id]),
        })),
    };

    const result = runMetaheuristic(state.algorithmType, currentStateForAlgorithm);
    
    if (result.message) {
        addLog(result.message);
    }

    if (result.newState) {
        setState(s => ({ ...s, ...result.newState, animationState: 'paused', algorithmState: 'done' }));
    } else {
        setState(s => ({ ...s, animationState: 'paused', algorithmState: 'done' }));
    }
  }, [state]);

  // Use state.animationSpeed instead of a fixed value
  useEffect(() => {
    const isHybridGreedy = state.algorithmType === ALGORITHM_TYPES.GREEDY_HYBRID;
    
    if (state.animationState === 'playing' && state.algorithmState !== 'done' && isHybridGreedy) {
      const timer = setTimeout(() => {
        runStep();
      }, state.animationSpeed); // Use dynamic speed
      
      return () => clearTimeout(timer);
    }
  }, [state.animationState, state.algorithmState, state.algorithmType, state.animationSpeed, runStep]); // Add animationSpeed to dependencies


  const handleRunComparison = () => {
    addLog("--- STARTING COMPARISON RUN ---");
    setState(s => ({ ...s, comparisonResults: [], algorithmState: 'running' })); 
    
    const algorithmsToTest = Object.keys(ALGORITHM_TYPES).map(key => ALGORITHM_TYPES[key]);
    const results = [];
    
    algorithmsToTest.forEach(algoName => {
        let currentState = getInitialState(selectedDataset);
        currentState.algorithmType = algoName;
        let result = { distance: Infinity, vehicles: 0 };
        
        if (algoName === ALGORITHM_TYPES.GREEDY_HYBRID) {
            let safetyCounter = 0;
            
            while (currentState.unvisitedCustomerIds.length > 0) {
                safetyCounter++;
                if (safetyCounter > 10000) { 
                    currentState.algorithmState = 'done';
                    break;
                }
                
                if (currentState.algorithmState === 'idle') {
                    const stepResult = hybridGreedyStep(currentState);
                    if (stepResult.newState) currentState = { ...currentState, ...stepResult.newState };
                    else if (stepResult.nextState) currentState.algorithmState = stepResult.nextState;

                } 
                
                if (currentState.algorithmState === 'clustering') {
                    let clusteringDone = false;
                    while (!clusteringDone) {
                        const stepResult = hybridGreedyStep(currentState);
                        if (stepResult.nextState === 'solving_tsp') {
                            currentState.algorithmState = 'solving_tsp';
                            clusteringDone = true;
                        } else if (stepResult.newState) {
                            currentState = { ...currentState, ...stepResult.newState };
                        } else {
                            currentState.algorithmState = 'solving_tsp'; 
                            clusteringDone = true;
                        }
                        if (safetyCounter++ > 10000) break;
                    }
                }
                
                if (currentState.algorithmState === 'solving_tsp') {
                    const stepResult = hybridGreedyStep(currentState);
                    if (stepResult.newState) {
                        currentState = { ...currentState, ...stepResult.newState };
                        currentState.algorithmState = 'idle'; 
                    }
                }
            }
            
            result = {
                distance: currentState.totalDistance,
                vehicles: currentState.vehicles.length,
            };

        } else {
            const metaResult = runMetaheuristic(algoName, currentState);
            if (metaResult.newState) {
                result = {
                    distance: metaResult.newState.totalDistance,
                    vehicles: metaResult.newState.vehicles.length,
                };
            }
        }
        
        if (result && result.distance !== Infinity) {
            addLog(`[COMPARE] ${algoName}: Dist=${result.distance.toFixed(2)}, Vehicles=${result.vehicles}`);
            results.push({ 
                name: algoName, 
                distance: result.distance, 
                vehicles: result.vehicles, 
                color: COMPARISON_COLORS[algoName] 
            });
        }
    });

    const bestResult = results.length > 0 ? results.reduce((best, current) => current.distance < best.distance ? current : best, results[0]) : null;
    if (bestResult) {
        addLog(`--- COMPARISON COMPLETE --- Best Result: ${bestResult.name} (${bestResult.distance.toFixed(2)})`);
    } else {
        addLog("--- COMPARISON COMPLETE --- No valid results found.");
    }
    
    setState(s => ({ 
        ...getInitialState(selectedDataset),
        algorithmType: s.algorithmType,
        comparisonResults: results, 
        logMessages: [...s.logMessages, `Comparison finished. Results in Summary tab.`],
        algorithmState: 'done'
    }));
  };

  const handleAlgorithmChange = (type) => {
    const resetState = getInitialState(selectedDataset);
    setState({ ...resetState, comparisonResults: [], algorithmType: type, logMessages: [`Algorithm changed to ${type}.`] });
  };
  
  const handlePlayPause = () => {
    if (state.algorithmState === 'done') return;
    
    const isHybridGreedy = state.algorithmType === ALGORITHM_TYPES.GREEDY_HYBRID;
    
    if (isHybridGreedy) {
        setState(s => ({
          ...s,
          animationState: s.animationState === 'playing' ? 'paused' : 'playing',
        }));
    } else {
        runMetaheuristicFull();
    }
  };
  
  const handleNextStep = () => {
    if (state.animationState === 'playing' || state.algorithmState === 'done') return;
    if (state.algorithmType !== ALGORITHM_TYPES.GREEDY_HYBRID) {
        addLog(`'Next Step' is only available for the Hybrid Greedy algorithm.`);
        return;
    }
    
    runStep();
  };
  
  const handleReset = () => {
    setState(getInitialState(selectedDataset));
  };
  
  const handleDatasetChange = (datasetName) => {
    setSelectedDataset(datasetName);
    setState(getInitialState(datasetName));
  };
  
  // Re-add the speed change handler
  const handleSpeedChange = (speed) => {
    setState(s => ({ ...s, animationSpeed: speed }));
  };

  return {
    state,
    selectedDataset,
    handlePlayPause,
    handleNextStep,
    handleReset,
    handleDatasetChange,
    handleAlgorithmChange,
    handleRunComparison,
    handleSpeedChange // Expose the handler
  };
};

