import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPreview = ({ videoRef, isPlaying, currentTime, duration, tracks, onTimeUpdate }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [playbackError, setPlaybackError] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  
  // Local refs for videojs
  const videoNode = useRef(null);
  const player = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const lastEventUpdateTimeRef = useRef(0);

  // Find the video clip at the current time position
  useEffect(() => {
    const videoTrack = tracks.find(track => track.type === 'video');
    if (!videoTrack || !videoTrack.clips.length) {
      setActiveVideo(null);
      return;
    }

    // Find clips that overlap with the current time
    const activeClips = videoTrack.clips.filter(clip => {
      const start = clip.start;
      const end = clip.start + clip.duration;
      return currentTime >= start && currentTime < end;
    });

    // Use the first found clip
    setActiveVideo(activeClips[0] || null);
  }, [currentTime, tracks]);

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Initialize Video.js when component mounts or activeVideo changes
  useEffect(() => {
    // If there's no video clip or no DOM node, don't do anything
    if (!activeVideo || !videoNode.current) {
      if (player.current) {
        player.current.dispose();
        player.current = null;
      }
      return;
    }

    // Reset states
    setIsReady(false);
    setLoadingProgress(0);
    setPlaybackError(false);
    
    // Clean up previous player instance if it exists
    if (player.current) {
      player.current.dispose();
      player.current = null;
    }

    try {
      // Create a new Video.js player
      const vjsPlayer = videojs(videoNode.current, {
        autoplay: false,
        controls: true,  // Enable controls for easier debugging
        preload: 'auto',
        fluid: true,
        playsinline: true,
        muted: false,  // Allow audio playback
        responsive: true,
        aspectRatio: '16:9', // Add aspect ratio
        controlBar: {
          pictureInPictureToggle: false, // Hide PiP button to avoid issues
        },
        liveui: false,
        sources: []  // Start with empty sources, we'll add them after
      });
      
      player.current = vjsPlayer;

      // Prepare the video source
      let sourceUrl;
      
      // Revoke any existing blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      
      // Handle different source types
      if (activeVideo.file) {
        // For uploaded videos (File objects)
        const newBlobUrl = URL.createObjectURL(activeVideo.file);
        setBlobUrl(newBlobUrl);
        sourceUrl = newBlobUrl;
        console.log('Created blob URL for uploaded file:', newBlobUrl);
      } else {
        // For sample videos (URLs)
        sourceUrl = activeVideo.src;
        console.log('Using direct source URL:', sourceUrl);
      }
      
      // Set up player event handlers
      vjsPlayer.on('ready', () => {
        console.log('Video.js player is ready');
        
        // Set the video source after player is ready
        vjsPlayer.src({
          src: sourceUrl,
          type: activeVideo.file ? activeVideo.file.type || 'video/mp4' : 'video/mp4'
        });
        
        // Set up the videoRef for parent component
        if (videoRef) {
          videoRef.current = {
            getCurrentTime: () => vjsPlayer.currentTime(),
            seekTo: (seconds) => vjsPlayer.currentTime(seconds)
          };
        }
      });
      
      vjsPlayer.on('loadeddata', () => {
        console.log('Video data loaded');
        setLoadingProgress(1);
        setIsReady(true);
        
        // Set initial time if needed
        if (currentTime > 0) {
          vjsPlayer.currentTime(currentTime);
        }
      });
      
      vjsPlayer.on('error', (e) => {
        console.error('Video.js error:', vjsPlayer.error(), e);
        setPlaybackError(true);
        setLoadingProgress(0);
      });
      
      // Implement more responsive time updates for playhead movement (30 times per second)
      vjsPlayer.on('timeupdate', () => {
        const now = Date.now();
        // Update more frequently (33ms = ~30fps) for smoother playhead
        if (now - lastUpdateTimeRef.current >= 33) {
          const newTime = vjsPlayer.currentTime();
          onTimeUpdate(newTime);
          lastUpdateTimeRef.current = now;
        }
      });
      
      // Additional event handlers to ensure accurate time tracking
      vjsPlayer.on('play', () => {
        // Setup a more frequent time update with requestAnimationFrame
        const updateTime = () => {
          if (player.current && isPlaying) {
            const newTime = player.current.currentTime();
            
            // Only update if time has changed significantly (avoid unnecessary renders)
            if (Math.abs(newTime - currentTime) > 0.01) {
              onTimeUpdate(newTime);
            }
            
            // Continue the animation loop while playing
            requestAnimationFrame(updateTime);
          }
        };
        
        requestAnimationFrame(updateTime);
      });
      
      // Additional event to update time precisely when video is paused
      vjsPlayer.on('pause', () => {
        const newTime = vjsPlayer.currentTime();
        onTimeUpdate(newTime);
      });
      
      // Update time even on seeking
      vjsPlayer.on('seeking', () => {
        const now = Date.now();
        // Throttle events but ensure they're captured
        if (now - lastEventUpdateTimeRef.current >= 16) {
          const newTime = vjsPlayer.currentTime();
          onTimeUpdate(newTime);
          lastEventUpdateTimeRef.current = now;
        }
      });
      
      vjsPlayer.on('seeked', () => {
        const newTime = vjsPlayer.currentTime();
        onTimeUpdate(newTime);
      });
      
      // Cleanup function
      return () => {
        if (player.current) {
          player.current.dispose();
          player.current = null;
        }
      };
      
    } catch (error) {
      console.error('Error initializing Video.js:', error);
      setPlaybackError(true);
    }
  }, [activeVideo]);

  // Handle play/pause state
  useEffect(() => {
    if (!player.current || !isReady) return;
    
    if (isPlaying) {
      player.current.play().catch(error => {
        console.error('Play error:', error);
        // Try with muted to overcome autoplay restrictions
        player.current.muted(true);
        player.current.play().catch(e => {
          console.error('Play error even with mute:', e);
          setPlaybackError(true);
        });
      });
    } else {
      player.current.pause();
    }
  }, [isPlaying, isReady]);

  // Handle seeking to specific time
  useEffect(() => {
    if (player.current && isReady && Math.abs(player.current.currentTime() - currentTime) > 0.5) {
      player.current.currentTime(currentTime);
    }
  }, [currentTime, isReady]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      {/* Video player container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Loading indicator */}
        {loadingProgress < 1 && activeVideo && !playbackError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {/* Error indicator */}
        {playbackError && activeVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 text-white">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-2 text-red-500">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <p>Error playing video</p>
              <button 
                className="mt-2 text-sm bg-editor-primary px-3 py-1 rounded"
                onClick={() => {
                  setPlaybackError(false);
                  if (player.current) {
                    player.current.currentTime(currentTime);
                    player.current.play().catch(e => console.error("Retry error:", e));
                  }
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Video player */}
        <div className="w-full h-full">
          {/* Always keep the video element in the DOM */}
          <div data-vjs-player className="w-full h-full">
            <video
              ref={videoNode}
              className="video-js vjs-big-play-centered vjs-fluid"
              playsInline
              crossOrigin="anonymous"
            ></video>
          </div>
        </div>
        
        {/* Empty state when no video is active - render on top of player */}
        {!activeVideo && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-editor-text-muted bg-black bg-opacity-75">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-20">
                <path fillRule="evenodd" d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-medium mb-2">No Video Selected</h3>
              <p className="text-sm opacity-70">Add media from the library panel to get started</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;