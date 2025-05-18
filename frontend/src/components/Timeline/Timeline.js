import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TimeScale from './TimeScale';
import Track from './Track';

const Timeline = forwardRef(({
  tracks,
  currentTime,
  duration,
  zoom,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
  onTimeUpdate
}, ref) => {
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const playheadRef = useRef(null); // Add a reference for the playhead
  const [containerWidth, setContainerWidth] = useState(0);
  const [timelineWidth, setTimelineWidth] = useState(0);
  
  // Calculate pixel per second based on zoom factor
  const pixelsPerSecond = 100 * zoom;
  
  // Calculate timeline content width
  useEffect(() => {
    const width = Math.max(duration * pixelsPerSecond, 1000);
    setTimelineWidth(width);
  }, [duration, pixelsPerSecond]);
  
  // Measure container width for time scale
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);
  
  // Handle timeline click to update current time
  const handleTimelineClick = (e) => {
    if (isDraggingRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const scrollLeft = containerRef.current.scrollLeft;
    const newTime = (offsetX + scrollLeft) / pixelsPerSecond;
    
    onTimeUpdate(Math.max(0, Math.min(newTime, duration)));
  };
  
  // Use requestAnimationFrame for smoother playhead updates
  useEffect(() => {
    if (!playheadRef.current) return;
    
    // Update playhead position immediately without animation frame
    // This makes the playhead move more responsively
    const updatePlayhead = () => {
      if (playheadRef.current) {
        const playheadPosition = currentTime * pixelsPerSecond;
        playheadRef.current.style.left = `${playheadPosition}px`;
      }
    };
    
    updatePlayhead();
    
    // We still use requestAnimationFrame for continuous updates if needed
    const animationFrameId = requestAnimationFrame(() => {
      updatePlayhead();
    });
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [currentTime, pixelsPerSecond]);
  
  // Auto-scroll to keep the playhead visible during playback with improved performance
  useEffect(() => {
    if (!containerRef.current) return;
    
    const playheadPosition = currentTime * pixelsPerSecond;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Use a more generous threshold for auto-scrolling
    const threshold = containerRect.width * 0.3;
    
    // Only auto-scroll if we're significantly outside the visible area
    // Use smooth scrolling for better user experience
    if (playheadPosition < container.scrollLeft + (threshold / 2)) {
      // Smooth scrolling with requestAnimationFrame for performance
      const targetScrollLeft = Math.max(0, playheadPosition - threshold);
      
      // Only scroll if the difference is significant
      if (Math.abs(container.scrollLeft - targetScrollLeft) > 50) {
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    } else if (playheadPosition > container.scrollLeft + containerRect.width - (threshold / 2)) {
      const targetScrollLeft = Math.min(
        container.scrollWidth - containerRect.width,
        playheadPosition - containerRect.width + threshold
      );
      
      // Only scroll if the difference is significant
      if (Math.abs(container.scrollLeft - targetScrollLeft) > 50) {
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, pixelsPerSecond]);
  
  // Render playhead at current time position
  const renderPlayhead = () => {
    // Initial position only - actual updates happen in the effect above
    const playheadPosition = currentTime * pixelsPerSecond;
    
    return (
      <div 
        ref={playheadRef}
        className="current-time-indicator absolute top-0 bottom-0 w-0.5 bg-editor-scrubber z-10 pointer-events-none"
        style={{ 
          left: `${playheadPosition}px`,
          transform: 'translateX(-50%)', // Center the playhead on the exact time position
          boxShadow: '0 0 5px 0 rgba(236, 72, 153, 0.7)' // Add glow effect
        }}
      />
    );
  };
  
  return (
    <div className="timeline-component flex flex-col h-full bg-editor-timeline">
      <TimeScale 
        duration={duration} 
        pixelsPerSecond={pixelsPerSecond}
        containerWidth={containerWidth}
      />
      
      <div 
        ref={containerRef}
        className="timeline-scroll editor-scrollbar"
      >
        <div 
          ref={timelineRef}
          className="timeline-content"
          style={{ width: `${timelineWidth}px` }}
          onClick={handleTimelineClick}
        >
          {tracks.map((track) => (
            <Track
              key={track.id}
              track={track}
              pixelsPerSecond={pixelsPerSecond}
              selectedClipId={selectedClipId}
              onSelectClip={onSelectClip}
              onUpdateClip={onUpdateClip}
              isDraggingRef={isDraggingRef}
            />
          ))}
          
          {renderPlayhead()}
        </div>
      </div>
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;