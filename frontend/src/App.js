import { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import VideoPreview from "./components/Editor/VideoPreview";
import Timeline from "./components/Timeline/Timeline";
import ControlPanel from "./components/Controls/ControlPanel";
import MediaLibrary from "./components/MediaLibrary/MediaLibrary";
import EffectsPanel from "./components/Effects/EffectsPanel";
import ExportPanel from "./components/Export/ExportPanel";
import "./App.css";

// Initial project state
const initialProject = {
  name: "Untitled Project",
  currentTime: 0,
  duration: 0,
  tracks: [
    { id: "video-track-1", type: "video", clips: [] },
    { id: "audio-track-1", type: "audio", clips: [] },
    { id: "text-track-1", type: "text", clips: [] }
  ],
  selectedClipId: null,
  zoom: 1,
};

// Sample media clips for the library
const sampleMedia = [
  { 
    id: "sample-1", 
    type: "video", 
    name: "Beach Sunset", 
    duration: 15,
    // Using direct links to videos that don't have CORS restrictions
    src: "https://cdn.coverr.co/videos/coverr-clear-water-rushing-down-steam-2816/1080p.mp4",
    thumbnail: "https://cdn.coverr.co/videos/coverr-clear-water-rushing-down-steam-2816/1080p.mp4"
  },
  { 
    id: "sample-2", 
    type: "video", 
    name: "City Traffic", 
    duration: 12,
    src: "https://cdn.coverr.co/videos/coverr-sunset-over-mountains-9857/1080p.mp4",
    thumbnail: "https://cdn.coverr.co/videos/coverr-sunset-over-mountains-9857/1080p.mp4"
  },
  { 
    id: "sample-3", 
    type: "video", 
    name: "Nature Walk", 
    duration: 18,
    src: "https://cdn.coverr.co/videos/coverr-driving-in-new-zealand-mountains-5884/1080p.mp4",
    thumbnail: "https://cdn.coverr.co/videos/coverr-driving-in-new-zealand-mountains-5884/1080p.mp4"
  },
  { 
    id: "sample-4", 
    type: "audio", 
    name: "Upbeat Music", 
    duration: 30,
    // Using a direct MP3 link that allows cross-origin usage
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  { 
    id: "sample-5", 
    type: "audio", 
    name: "Ambient Sounds", 
    duration: 25,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  }
];

const VideoEditor = () => {
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState("media"); // media, effects, export
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // State for media library - initialize from localStorage if available
  const [mediaLibrary, setMediaLibrary] = useState(() => {
    try {
      const savedMedia = localStorage.getItem('videoEditor_mediaLibrary');
      if (savedMedia) {
        const parsedMedia = JSON.parse(savedMedia);
        console.log('Loaded media library from localStorage:', parsedMedia.length, 'items');
        return parsedMedia;
      }
      return sampleMedia;
    } catch (error) {
      console.error('Error loading media library from localStorage:', error);
      return sampleMedia;
    }
  });
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Save media library to localStorage whenever it changes
  useEffect(() => {
    try {
      // For localStorage, we need to save serializable data
      // Save the entire media library including base64 data
      localStorage.setItem('videoEditor_mediaLibrary', JSON.stringify(mediaLibrary));
      console.log('Media library saved to localStorage:', mediaLibrary.length, 'items');
    } catch (error) {
      console.error('Error saving media library to localStorage:', error);
    }
  }, [mediaLibrary]);

  // Add clip to timeline
  const addClipToTimeline = (mediaItem) => {
    console.log("Adding to timeline:", mediaItem.name);
    setProject(prev => {
      // Find the appropriate track for this media type
      const trackIndex = prev.tracks.findIndex(track => track.type === mediaItem.type);
      if (trackIndex === -1) return prev;
      
      // Get the last clip in the track to position the new clip
      const trackClips = prev.tracks[trackIndex].clips;
      const lastClipEnd = trackClips.length > 0 
        ? Math.max(...trackClips.map(clip => clip.start + clip.duration))
        : 0;
      
      // Create a new clip
      const newClip = {
        id: `clip-${Date.now()}`,
        mediaId: mediaItem.id,
        type: mediaItem.type,
        name: mediaItem.name,
        start: lastClipEnd,
        duration: mediaItem.duration,
        // Use fileData (base64) if available, otherwise use src (for sample media)
        fileData: mediaItem.fileData,
        src: mediaItem.src
      };
      
      // Update the tracks with the new clip
      const updatedTracks = [...prev.tracks];
      updatedTracks[trackIndex] = {
        ...updatedTracks[trackIndex],
        clips: [...updatedTracks[trackIndex].clips, newClip]
      };
      
      // Calculate the new project duration
      const newDuration = Math.max(
        ...updatedTracks.flatMap(track => 
          track.clips.map(clip => clip.start + clip.duration)
        )
      );
      
      return {
        ...prev,
        tracks: updatedTracks,
        duration: Math.max(prev.duration, newDuration),
        selectedClipId: newClip.id
      };
    });
  };

  // Handle clip selection
  const selectClip = (clipId) => {
    setProject(prev => ({
      ...prev,
      selectedClipId: clipId
    }));
  };

  // Update clip position
  const updateClipPosition = (clipId, newStart) => {
    setProject(prev => {
      const updatedTracks = prev.tracks.map(track => {
        const clipIndex = track.clips.findIndex(clip => clip.id === clipId);
        if (clipIndex === -1) return track;
        
        const updatedClips = [...track.clips];
        updatedClips[clipIndex] = {
          ...updatedClips[clipIndex],
          start: Math.max(0, newStart)
        };
        
        return { ...track, clips: updatedClips };
      });
      
      // Recalculate project duration
      const newDuration = Math.max(
        ...updatedTracks.flatMap(track => 
          track.clips.map(clip => clip.start + clip.duration)
        ),
        0
      );
      
      return {
        ...prev,
        tracks: updatedTracks,
        duration: newDuration
      };
    });
  };

  // Split clip at the current time
  const splitClip = () => {
    const { currentTime, selectedClipId } = project;
    if (!selectedClipId) return;

    setProject(prev => {
      let clipFound = false;
      const updatedTracks = prev.tracks.map(track => {
        const clipIndex = track.clips.findIndex(clip => clip.id === selectedClipId);
        if (clipIndex === -1) return track;
        
        const clip = track.clips[clipIndex];
        const clipStart = clip.start;
        const clipEnd = clipStart + clip.duration;
        
        // Only split if current time is within the clip
        if (currentTime <= clipStart || currentTime >= clipEnd) return track;
        
        clipFound = true;
        
        // Create two clips from the original
        const clipFirstHalf = {
          ...clip,
          duration: currentTime - clipStart
        };
        
        const clipSecondHalf = {
          ...clip,
          id: `clip-${Date.now()}`,
          start: currentTime,
          duration: clipEnd - currentTime
        };
        
        const updatedClips = [...track.clips];
        updatedClips[clipIndex] = clipFirstHalf;
        updatedClips.push(clipSecondHalf);
        
        return { ...track, clips: updatedClips };
      });
      
      if (!clipFound) return prev;
      
      return {
        ...prev,
        tracks: updatedTracks
      };
    });
  };

  // Delete selected clip
  const deleteSelectedClip = () => {
    const { selectedClipId } = project;
    if (!selectedClipId) return;

    setProject(prev => {
      const updatedTracks = prev.tracks.map(track => {
        const filteredClips = track.clips.filter(clip => clip.id !== selectedClipId);
        return { ...track, clips: filteredClips };
      });
      
      // Recalculate project duration
      const newDuration = Math.max(
        ...updatedTracks.flatMap(track => 
          track.clips.map(clip => clip.start + clip.duration)
        ),
        0
      );
      
      return {
        ...prev,
        tracks: updatedTracks,
        selectedClipId: null,
        duration: newDuration
      };
    });
  };

  // Handle time update
  const handleTimeUpdate = (time) => {
    // Ensure time is a valid number
    if (isNaN(time)) {
      console.warn('Invalid time value:', time);
      return;
    }
    
    // Log less frequently to avoid console spam
    const shouldLog = Math.round(time * 10) % 50 === 0; // Log roughly every 5 seconds
    if (shouldLog) {
      console.log(`Time updated: ${time.toFixed(2)}`);
    }
    
    setProject(prev => ({
      ...prev,
      currentTime: time
    }));
  };

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Export video
  const exportVideo = async (format, quality) => {
    if (!isLoaded) return;
    
    try {
      setIsExporting(true);
      
      // In a real implementation, this would process the timeline
      // and generate the final video file using FFmpeg
      // For this demo, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Sample download code (not actually functional in this demo)
      const url = URL.createObjectURL(new Blob(["video data"], { type: "video/mp4" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      setIsExporting(false);
    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    console.log("Handling file upload:", files.length, "files");
    if (!files || files.length === 0) return;
    
    try {
      // Create a copy of the current media library to add new items
      const newMediaLibrary = [...mediaLibrary];
      
      // Process each file
      await Promise.all(
        Array.from(files).map(async (file, index) => {
          console.log("Processing file:", file.name, file.type);
          
          // Validate file type
          if (!file.type.startsWith('video/') && !file.type.startsWith('audio/') && !file.type.startsWith('image/')) {
            console.warn(`Skipping file ${file.name}: unsupported type ${file.type}`);
            return;
          }
          
          const id = `upload-${Date.now()}-${index}`;
          const type = file.type.startsWith('video') ? 'video' : 
                     file.type.startsWith('audio') ? 'audio' : 'image';
          
          try {
            // Convert file to base64 for storage
            const fileData = await fileToBase64(file);
            
            // Get file metadata
            let duration = 30; // Default duration
            if (type === 'video' || type === 'audio') {
              try {
                console.log(`Getting duration for ${file.name}...`);
                duration = await getMediaDuration(file, type);
                console.log(`Duration for ${file.name}: ${duration} seconds`);
              } catch (err) {
                console.error(`Error getting duration for ${file.name}:`, err);
              }
            }
            
            // Create the media item - store with base64 data
            const mediaItem = {
              id,
              type,
              name: file.name,
              duration,
              fileData: fileData, // Store as base64
              fileType: file.type,
              fileSize: file.size,
              lastModified: file.lastModified
            };
            
            // Add to media library
            newMediaLibrary.push(mediaItem);
            console.log(`Added ${file.name} to media library`);
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
        })
      );
      
      // Update the media library state
      setMediaLibrary(newMediaLibrary);
      
      // Save to localStorage
      saveMediaLibraryToStorage(newMediaLibrary);
      
      console.log("Media library updated with new items");
    } catch (error) {
      console.error("Error processing uploaded files:", error);
    }
  };
  
  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Save media library to localStorage
  const saveMediaLibraryToStorage = (library) => {
    try {
      localStorage.setItem('videoEditor_mediaLibrary', JSON.stringify(library));
      console.log('Saved media library to localStorage:', library.length, 'items');
    } catch (error) {
      console.error('Error saving media library to localStorage:', error);
    }
  };
  
  // Helper function to get media duration
  const getMediaDuration = (file, type) => {
    return new Promise((resolve, reject) => {
      // Create the appropriate element based on media type
      const element = type === 'video' ? document.createElement('video') : document.createElement('audio');
      
      // Configure element
      element.preload = 'metadata';
      element.muted = true; // Important for video autoplay in some browsers
      element.playsInline = true;
      
      // Set up event handlers
      element.onloadedmetadata = () => {
        // Make sure we have valid duration
        if (isNaN(element.duration) || element.duration === Infinity) {
          element.currentTime = 1e101; // Force duration calculation
          return;
        }
        
        const duration = element.duration;
        resolve(duration);
        // Don't revoke the URL here - we need it for playback
      };
      
      element.ondurationchange = () => {
        // Sometimes duration is available in this event instead
        if (isNaN(element.duration) || element.duration === Infinity) {
          return;
        }
        
        const duration = element.duration;
        resolve(duration);
        // Don't revoke the URL here - we need it for playback
      };
      
      element.onerror = () => {
        reject(new Error(`Error loading media metadata: ${element.error?.message || 'Unknown error'}`));
      };
      
      // Create a new URL for this operation only
      const objectUrl = URL.createObjectURL(file);
      element.src = objectUrl;
      
      // Some browsers need to actually start playing to get duration
      const playPromise = element.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started - now we can pause
            element.pause();
          })
          .catch(error => {
            // Auto-play was prevented
            console.warn("Autoplay prevented, trying to get duration without playing", error);
          });
      }
      
      // Set a timeout in case metadata loading takes too long
      setTimeout(() => {
        if (!element.duration || element.duration === Infinity) {
          URL.revokeObjectURL(objectUrl);
          resolve(30); // Default duration if we can't get it
        }
      }, 5000);
    });
  };

  return (
    <div className="editor-container h-screen flex flex-col bg-editor-bg text-editor-text">
      <Header projectName={project.name} />
      
      <div className="editor-main flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Editor Area */}
        <div className="editor-workspace flex-1 flex flex-col overflow-hidden">
          {/* Video Preview */}
          <div className="video-preview-container">
            <VideoPreview 
              videoRef={videoRef}
              isPlaying={isPlaying}
              currentTime={project.currentTime}
              duration={project.duration}
              tracks={project.tracks}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        </div>
        
        {/* Right Panel - Media Library / Effects / Export based on activeTab */}
        <div className="editor-panel">
          <AnimatePresence mode="wait">
            {activeTab === "media" && (
              <motion.div
                key="media"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <MediaLibrary 
                  media={mediaLibrary} 
                  onAddToTimeline={addClipToTimeline}
                  onFileUpload={handleFileUpload}
                />
              </motion.div>
            )}
            
            {activeTab === "effects" && (
              <motion.div
                key="effects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <EffectsPanel 
                  selectedClipId={project.selectedClipId}
                  tracks={project.tracks}
                />
              </motion.div>
            )}
            
            {activeTab === "export" && (
              <motion.div
                key="export"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ExportPanel 
                  projectName={project.name}
                  isExporting={isExporting}
                  onExport={exportVideo}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Timeline at the bottom - spans the full width */}
      <div className="timeline-container">
        <ControlPanel 
          isPlaying={isPlaying} 
          togglePlay={togglePlay}
          currentTime={project.currentTime}
          duration={project.duration}
          onSplit={splitClip}
          onDelete={deleteSelectedClip}
        />
        <Timeline 
          ref={timelineRef}
          tracks={project.tracks}
          currentTime={project.currentTime}
          duration={project.duration}
          zoom={project.zoom}
          selectedClipId={project.selectedClipId}
          onSelectClip={selectClip}
          onUpdateClip={updateClipPosition}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;