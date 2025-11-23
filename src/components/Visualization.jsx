import React, { useState } from 'react';

const Visualization = ({ nodes, depot, vehicles, currentVehicleId }) => {
  const [hoveredNode, setHoveredNode] = useState(null); // Track hovered node
  
  const viewBoxSize = 100;
  const padding = 5; // Padding around the edges
  const plotSize = viewBoxSize - padding * 2; // Usable plot area
  const nodeRadius = 1.0;
  const depotSize = 4;

  // Function to transform X coordinate
  // X (0 to 100) -> X (padding to padding + plotSize)
  const tx = (x) => padding + (x / 100) * plotSize;

  // Function to transform Y coordinate
  // Y (0 to 100) -> Y (padding + plotSize down to padding)
  // This inverts the Y-axis so 0 is at the bottom
  const ty = (y) => padding + plotSize - (y / 100) * plotSize;

  const intervals = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className="w-full h-full bg-gray-50 rounded-lg shadow-inner border border-gray-200"
    >
      {/* Group for coordinate system + nodes, to sit behind routes */}
      <g>
        {/* Y-Axis Line (at X=0) */}
        <line
          x1={tx(0)}
          y1={ty(0)}
          x2={tx(0)}
          y2={ty(100)}
          stroke="#cccccc"
          strokeWidth={0.5}
        />
        {/* X-Axis Line (at Y=0) */}
        <line
          x1={tx(0)}
          y1={ty(0)}
          x2={tx(100)}
          y2={ty(0)}
          stroke="#cccccc"
          strokeWidth={0.5}
        />

        {/* --- Axis Intervals --- */}
        {/* X-Axis Intervals */}
        {intervals.map((val) => (
          <g key={`x-tick-${val}`}>
            <line
              x1={tx(val)}
              y1={ty(0)}
              x2={tx(val)}
              y2={ty(0) + 1} // Small tick mark
              stroke="#374151"
              strokeWidth={0.3}
            />
            <text
              x={tx(val)}
              y={ty(0) + 2.5} // Below the tick mark
              textAnchor="middle"
              fontSize="1.5"
              fill="#374151"
            >
              {val}
            </text>
          </g>
        ))}

        {/* Y-Axis Intervals */}
        {intervals.map((val) => (
          <g key={`y-tick-${val}`}>
            <line
              x1={tx(0)}
              y1={ty(val)}
              x2={tx(0) - 1} // Small tick mark
              y2={ty(val)}
              stroke="#374151"
              strokeWidth={0.3}
            />
            <text
              x={tx(0) - 1.5} // Left of the tick mark
              y={ty(val) + 0.5} // Centered
              textAnchor="end"
              fontSize="1.5"
              fill="#374151"
            >
              {val}
            </text>
          </g>
        ))}
        {/* --- End Axis Intervals --- */}
        

        {/* All Customer Nodes + Labels */}
        {nodes.map(node => {
          // Don't render the depot as a circle here, it has a special rect
          if (node.id === depot.id) return null;
          
          const isServed = vehicles.some(v => v.route.some(n => n.id === node.id));
          
          return (
            <g 
              key={node.id}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={tx(node.x)}
                cy={ty(node.y)}
                r={nodeRadius}
                fill={isServed ? '#9ca3af' : '#cbd5e1'}
                className="transition-all duration-300"
              />
              {/* Customer ID Label */}
              <text
                x={tx(node.x) + nodeRadius + 0.5} // Position text to the right of the circle
                y={ty(node.y) + 0.5} // Slightly offset for centering
                fontSize="1.5"
                fill="#374151"
                className="transition-all duration-300"
                style={{ pointerEvents: 'none' }} // Make text un-hoverable
              >
                {node.id}
              </text>
            </g>
          );
        })}
        
        {/* Depot Node (Square) + Label */}
        <g
          onMouseEnter={() => setHoveredNode(depot)}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={tx(depot.x) - depotSize / 2}
            y={ty(depot.y) - depotSize / 2}
            width={depotSize}
            height={depotSize}
            fill="#1f2937"
            stroke="#fff"
            strokeWidth={0.5}
            rx={1}
          />
          <text
            x={tx(depot.x)}
            y={ty(depot.y) - depotSize / 2 - 1.5}
            textAnchor="middle"
            fontSize="2.5"
            fill="#1f2937"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }} // Make text un-hoverable
          >
            Depot
          </text>
        </g>
      </g>
      
      {/* Group for Routes + Highlights, to sit on top */}
      <g>
        {/* Vehicle Routes (Paths) */}
        {vehicles.map((vehicle) => {
          if (vehicle.route.length < 2) return null;
          
          // Transform all node coordinates for the path
          const pathData = "M " + vehicle.route.map(node => `${tx(node.x)},${ty(node.y)}`).join(" L ");

          return (
            <path
              key={vehicle.id}
              d={pathData}
              fill="none"
              stroke={vehicle.color}
              strokeWidth={vehicle.id === currentVehicleId ? 0.8 : 0.5}
              strokeOpacity={vehicle.id === currentVehicleId ? 1 : 0.7}
              className="transition-all duration-300"
              style={{ pointerEvents: 'none' }}
            />
          );
        })}
        
        {/* Highlighted Nodes for Current Vehicle */}
        {vehicles.find(v => v.id === currentVehicleId)?.route.map((node, index) => (
           <circle
            key={`highlight-${node.id}-${index}`}
            cx={tx(node.x)}
            cy={ty(node.y)}
            r={nodeRadius + 0.5} 
            fill={vehicles.find(v => v.id === currentVehicleId)?.color || 'transparent'}
            stroke="#fff"
            strokeWidth={0.3}
            className="transition-all duration-300"
            style={{ pointerEvents: 'none' }}
          />
        ))}
      </g>

      {/* --- ADDED: Custom Tooltip --- */}
      {hoveredNode && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Tooltip background */}
          <rect
            x={tx(hoveredNode.x) + 3}
            y={ty(hoveredNode.y) - 6}
            width={22} // Adjusted width
            height={4.5}
            fill="rgba(0, 0, 0, 0.75)"
            rx={1}
          />
          {/* Tooltip text */}
          <text
            x={tx(hoveredNode.x) + 4} // Padding inside the rect
            y={ty(hoveredNode.y) - 3} // Centered vertically
            fontSize="2"
            fill="#ffffff"
            textAnchor="start"
          >
            {hoveredNode.id === depot.id 
              ? `Depot (Node ${depot.id})` 
              : `Demand: ${hoveredNode.demand}`}
          </text>
        </g>
      )}
    </svg>
  );
};

export default Visualization;

