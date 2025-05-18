import React from 'react';

const TimeScale = ({ duration, pixelsPerSecond, containerWidth }) => {
  // Generate time markers based on zoom level
  const getTimeMarkers = () => {
    const markers = [];
    
    // Determine marker interval based on zoom level
    let interval = 1; // default: 1 second
    
    if (pixelsPerSecond < 50) interval = 10;
    else if (pixelsPerSecond < 100) interval = 5;
    else if (pixelsPerSecond < 200) interval = 2;
    
    // Generate markers at regular intervals
    for (let i = 0; i <= Math.ceil(duration); i += interval) {
      const position = i * pixelsPerSecond;
      
      // Format time as MM:SS
      const minutes = Math.floor(i / 60);
      const seconds = Math.floor(i % 60);
      const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      markers.push(
        <div 
          key={i} 
          className="time-marker" 
          style={{ left: `${position}px` }}
        >
          <div className="h-3 w-px bg-editor-border"></div>
          <div className="text-xs text-editor-text-muted mt-1">{formattedTime}</div>
        </div>
      );
    }
    
    return markers;
  };
  
  return (
    <div className="time-scale">
      {getTimeMarkers()}
    </div>
  );
};

export default TimeScale;