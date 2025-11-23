import React, { useEffect } from 'react';

// Accept animationState and algorithmState as props
const Log = ({ messages, animationState, algorithmState }) => {
  const logContainerRef = React.useRef(null);
  const logEndRef = React.useRef(null);
  
  useEffect(() => {
    // Check if the visualizer is actively playing
    const isRunning = animationState === 'playing';

    if (isRunning && logEndRef.current) {
      // Only auto-scroll if the visualizer is running
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, animationState]); // Add animationState to the dependency array

  return (
    // Set container to h-full and add ref
    <div 
      ref={logContainerRef} 
      className="h-full bg-gray-900 rounded-lg p-3 overflow-y-auto font-mono text-xs text-gray-300 space-y-2"
    >
      {messages.map((msg, index) => (
        <p key={index} className="animate-fadeIn">
          <span className="text-gray-500 mr-2">{index + 1}:</span>
          {msg}
        </p>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default Log;

