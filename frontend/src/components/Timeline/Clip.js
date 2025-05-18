import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const Clip = ({ 
  clip, 
  pixelsPerSecond, 
  isSelected,
  onSelect,
  onUpdate,
  isDraggingRef
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  const clipStartRef = useRef(0);
  
  // Calculate clip position and width
  const clipStyle = {
    left: `${clip.start * pixelsPerSecond}px`,
    width: `${clip.duration * pixelsPerSecond}px`
  };
  
  // Handle drag start
  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(clip.id);
    
    setIsDragging(true);
    isDraggingRef.current = true;
    startPosRef.current = e.clientX;
    clipStartRef.current = clip.start;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle drag
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const delta = (e.clientX - startPosRef.current) / pixelsPerSecond;
    const newStart = clipStartRef.current + delta;
    
    onUpdate(clip.id, newStart);
  };
  
  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Get clip background color based on type
  const getClipClass = () => {
    const baseClass = 'timeline-clip';
    
    switch (clip.type) {
      case 'audio':
        return `${baseClass} timeline-clip-audio`;
      case 'text':
        return `${baseClass} timeline-clip-text`;
      default:
        return baseClass;
    }
  };
  
  return (
    <motion.div
      className={`${getClipClass()} ${isSelected ? 'ring-2 ring-white' : ''}`}
      style={clipStyle}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(clip.id);
      }}
      whileHover={{ y: -1 }}
      animate={{ 
        boxShadow: isSelected 
          ? '0 0 0 2px rgba(255, 255, 255, 0.8)' 
          : 'none' 
      }}
    >
      <span className="text-xs truncate">{clip.name}</span>
      
      {/* Resize handles would be added here in a full implementation */}
    </motion.div>
  );
};

export default Clip;