import React from 'react';

const Visualization = ({ nodes, depot, vehicles, currentVehicleId }) => {
  const viewBoxSize = 100;
  const nodeRadius = 1.0; 
  const depotSize = 4;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className="w-full h-full bg-gray-50 rounded-lg shadow-inner border border-gray-200"
    >
      {/* Watermark feature removed */}
      
      {nodes.map(node => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill={vehicles.some(v => v.route.some(n => n.id === node.id)) ? '#9ca3af' : '#cbd5e1'}
          className="transition-all duration-300"
        />
      ))}
      
      <rect
        x={depot.x - depotSize / 2}
        y={depot.y - depotSize / 2}
        width={depotSize}
        height={depotSize}
        fill="#1f2937"
        stroke="#fff"
        strokeWidth={0.5}
        rx={1}
      />
      <text
        x={depot.x}
        y={depot.y - depotSize / 2 - 1.5}
        textAnchor="middle"
        fontSize="3"
        fill="#1f2937"
        fontWeight="bold"
      >
        Depot
      </text>

      {vehicles.map((vehicle) => {
        if (vehicle.route.length < 2) return null;
        const pathData = "M " + vehicle.route.map(node => `${node.x},${node.y}`).join(" L ");

        return (
          <path
            key={vehicle.id}
            d={pathData}
            fill="none"
            stroke={vehicle.color}
            strokeWidth={vehicle.id === currentVehicleId ? 0.8 : 0.5}
            strokeOpacity={vehicle.id === currentVehicleId ? 1 : 0.7}
            className="transition-all duration-300"
          />
        );
      })}
      
      {vehicles.find(v => v.id === currentVehicleId)?.route.map((node, index) => (
         <circle
          key={`highlight-${node.id}-${index}`}
          cx={node.x}
          cy={node.y}
          r={nodeRadius + 0.5} 
          fill={vehicles.find(v => v.id === currentVehicleId)?.color || 'transparent'}
          stroke="#fff"
          strokeWidth={0.3}
          className="transition-all duration-300"
        />
      ))}
    </svg>
  );
};

export default Visualization;

