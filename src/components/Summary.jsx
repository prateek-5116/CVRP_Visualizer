import React from 'react';
import { BarChart2 } from 'lucide-react';
import { calculateRouteDistance } from '../algorithms/geometry';
import { COMPARISON_COLORS } from '../constants/algorithms';

const Summary = ({ vehicles, totalDistance, comparisonResults }) => {
  const hasComparison = comparisonResults && comparisonResults.length > 0;
  
  const validResults = comparisonResults.filter(r => r.distance !== Infinity);
  const minDistance = validResults.length > 0 
    ? validResults.reduce((min, res) => Math.min(min, res.distance), Infinity) 
    : 0;
  const maxDistance = validResults.length > 0 
    ? validResults.reduce((max, res) => Math.max(max, res.distance), 0) 
    : 1;
  const range = maxDistance - minDistance;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <h3 className="text-lg font-semibold text-white">Optimization Results</h3>
      </div>
      
      {/* Renders current status if NOT in comparison mode */}
      {!hasComparison && (
        <>
          <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-gray-300">Total Distance:</span>
            <span className="text-lg font-bold text-blue-400">
              {totalDistance.toFixed(2)}
            </span>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-gray-300">Vehicles Used:</span>
            <span className="text-lg font-bold text-blue-400">
              {vehicles.length}
            </span>
          </div>

          <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
            <h4 className='text-sm font-medium text-gray-400 mt-4'>Current Route Details:</h4>
            {vehicles.map(v => (
              <div key={v.id} className="bg-gray-700 p-3 rounded-lg border-l-4" style={{ borderColor: v.color }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">
                    Vehicle {v.id}
                  </span>
                  <span className="text-xs text-gray-400">
                    Dist: {calculateRouteDistance(v.route).toFixed(1)} | 
                    Load: {v.route.reduce((acc, n) => acc + n.demand, 0)} / {v.initialCapacity}
                  </span>
                </div>
                <p className="text-xs text-gray-300 break-words">
                  {v.route.map(n => n.id === v.route[0].id ? 'D' : `C${n.id}`).join(' → ')}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Renders comparison chart if IN comparison mode */}
      {hasComparison && (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <BarChart2 className="w-4 h-4" />
                <span>Algorithm Comparison (Total Distance)</span>
            </div>
            
            {comparisonResults.map((res) => {
                if (res.distance === Infinity) {
                    return (
                        <div key={res.name} className="p-2 bg-gray-700 rounded-lg text-xs text-red-400">
                            {res.name.replace(' (Simplified)', '').replace(' (Clustering + NN TSP)', '')}: FAILED
                        </div>
                    );
                }

                const normalizedDistance = range === 0 
                  ? 100 
                  : ((res.distance - minDistance) / range) * 80 + 20; 
                  
                const isBest = res.distance === minDistance;

                return (
                    <div key={res.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-white" style={{ color: res.color }}>
                                {res.name.replace(' (Simplified)', '').replace(' (Clustering + NN TSP)', '')}
                            </span>
                            <span className={`font-bold ${isBest ? 'text-green-300' : 'text-gray-300'}`}>
                                {res.distance.toFixed(2)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                                className="h-2 rounded-full transition-all duration-500" 
                                style={{ 
                                    width: `${normalizedDistance}%`, 
                                    backgroundColor: res.color,
                                    boxShadow: isBest ? `0 0 8px ${res.color}` : 'none'
                                }}
                            ></div>
                        </div>
                        <p className='text-xs text-gray-500'>
                            Vehicles: {res.vehicles}
                        </p>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default Summary;