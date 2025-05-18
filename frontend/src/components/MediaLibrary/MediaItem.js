import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

const MediaItem = ({ item, onAddToTimeline }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const videoRef = useRef(null);
  
  // Create a fresh blob URL for the video if we have the original file
  // This ensures we don't run into issues with expired blob URLs
  const videoSrc = useMemo(() => {
    if (item.file && item.type === 'video') {
      return URL.createObjectURL(item.file);
    }
    return item.src;
  }, [item.file, item.src, item.type]);
  
  // Clean up the blob URL when component unmounts
  useEffect(() => {
    return () => {
      // Only revoke URLs we created in this component
      if (item.file && videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [item.file, videoSrc]);
  
  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Generate a video thumbnail on hover for video items
  useEffect(() => {
    if (item.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      const handleMouseEnter = () => {
        if (!video.paused) return;
        video.currentTime = 0;
        video.play().catch(err => console.error("Error playing video thumbnail:", err));
      };
      
      const handleMouseLeave = () => {
        if (video.paused) return;
        video.pause();
        video.currentTime = 0;
      };
      
      video.addEventListener('mouseenter', handleMouseEnter);
      video.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        video.removeEventListener('mouseenter', handleMouseEnter);
        video.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [item.type, thumbnailLoaded]);
  
  // Render appropriate thumbnail based on media type
  const renderThumbnail = () => {
    if (item.type === 'video' && videoSrc && !thumbnailError) {
      return (
        <div className="relative">
          <div className="media-thumbnail object-cover w-full h-16 flex items-center justify-center bg-gray-900">
            {!thumbnailLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              </div>
            )}
            
            <video 
              ref={videoRef}
              src={videoSrc} 
              className="max-h-full max-w-full object-contain"
              muted
              playsInline
              loop
              preload="metadata"
              onError={() => setThumbnailError(true)}
              onLoadedData={() => setThumbnailLoaded(true)}
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
            {formatDuration(item.duration)}
          </div>
        </div>
      );
    } else if (item.type === 'audio') {
      return (
        <div className="bg-editor-clip-audio h-16 flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white opacity-70">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
          </svg>
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
            {formatDuration(item.duration)}
          </div>
        </div>
      );
    } else if (thumbnailError || (item.type === 'video' && !videoSrc)) {
      // Fallback for video with errors
      return (
        <div className="bg-editor-clip-video h-16 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white opacity-70">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="bg-editor-clip-text h-16 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white opacity-70">
            <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
          </svg>
        </div>
      );
    }
  };
  
  // Handle adding to timeline
  const handleAddToTimeline = async () => {
    setIsAdding(true);
    console.log("Adding item to timeline:", item);
    
    try {
      // Add a slight delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      onAddToTimeline(item);
    } catch (error) {
      console.error("Error adding to timeline:", error);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <motion.div 
      className="media-item overflow-hidden"
      whileHover={{ y: -2 }}
    >
      {/* Thumbnail */}
      <div className="relative">
        {renderThumbnail()}
        
        {/* Play overlay for video preview */}
        {item.type === 'video' && !thumbnailError && videoRef.current && (
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            whileHover={{ opacity: 1 }}
          >
            <motion.button
              className="p-2 bg-editor-primary rounded-full text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                // Preview video
                if (videoRef.current) {
                  if (videoRef.current.paused) {
                    videoRef.current.play().catch(err => console.error("Error playing video:", err));
                  } else {
                    videoRef.current.pause();
                  }
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </div>
      
      {/* Media info */}
      <div className="p-2">
        <div className="flex justify-between items-start">
          <div className="overflow-hidden">
            <h4 className="text-sm font-medium truncate max-w-[140px]">{item.name}</h4>
            <p className="text-xs text-editor-text-muted mt-0.5 capitalize">
              {item.type} {item.fileSize ? `(${(item.fileSize / (1024 * 1024)).toFixed(1)} MB)` : ''}
            </p>
          </div>
          
          <motion.button
            className={`ml-2 mt-0.5 ${isAdding ? 'text-editor-accent' : 'text-editor-primary'}`}
            onClick={handleAddToTimeline}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Add to Timeline"
            disabled={isAdding}
          >
            {isAdding ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 animate-pulse">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaItem;