import React, { useEffect } from 'react';

const Log = ({ messages }) => {
  // 1. Reference to the scrollable container element
  const logContainerRef = React.useRef(null);
  // 2. Reference to the dummy element at the end of the log
  const logEndRef = React.useRef(null);
  
  useEffect(() => {
    const container = logContainerRef.current;
    
    if (logEndRef.current && container) {
      // Check if the user is already near the bottom (within 5 pixels tolerance)
      const isNearBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 5;
      
      // Only scroll if the user hasn't scrolled up, or if it's the initial load (messages.length === 1)
      if (isNearBottom || messages.length === 1) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Step-by-Step Log</h3>
      <div 
        ref={logContainerRef} 
        className="h-60 bg-gray-900 rounded-lg p-3 overflow-y-auto font-mono text-xs text-gray-300 space-y-2"
      >
        {messages.map((msg, index) => (
          <p key={index} className="animate-fadeIn">
            <span className="text-gray-500 mr-2">{index + 1}:</span>
            {msg}
          </p>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default Log;