import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';

const EffectsPanel = ({ selectedClipId, tracks }) => {
  const [selectedClip, setSelectedClip] = useState(null);
  const [activeTab, setActiveTab] = useState('filters');
  const [textColor, setTextColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Find selected clip
  useEffect(() => {
    if (!selectedClipId) {
      setSelectedClip(null);
      return;
    }
    
    // Find clip in tracks
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === selectedClipId);
      if (clip) {
        setSelectedClip(clip);
        return;
      }
    }
    
    setSelectedClip(null);
  }, [selectedClipId, tracks]);
  
  // If no clip is selected, show empty state
  if (!selectedClip) {
    return (
      <div className="effects-panel text-center flex flex-col items-center justify-center h-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-editor-text-muted opacity-20 mb-3">
          <path d="M9.597 1.076c.56-.922 1.878-.922 2.438 0L13.653 4h2.622c1.074 0 1.786 1.142 1.293 2.09L16.175 9h2.919c1.027 0 1.735 1.054 1.348 2.005l-5.334 13.106c-.386.95-1.705.95-2.091 0L7.682 11.005C7.296 10.054 8.003 9 9.03 9h2.919L10.557 6.09C10.063 5.142 10.776 4 11.85 4h2.622L13.035 1.076a1.458 1.458 0 0 0-3.438 0Z" />
        </svg>
        <h3 className="text-lg font-medium mb-1">No Clip Selected</h3>
        <p className="text-sm text-editor-text-muted">Select a clip on the timeline to apply effects</p>
      </div>
    );
  }
  
  // Tabs based on clip type
  const getTabs = () => {
    const tabs = [
      { id: 'filters', label: 'Filters' },
      { id: 'transitions', label: 'Transitions' }
    ];
    
    if (selectedClip.type === 'video') {
      tabs.push({ id: 'adjustments', label: 'Adjustments' });
    } else if (selectedClip.type === 'audio') {
      tabs.push({ id: 'audio', label: 'Audio' });
    } else if (selectedClip.type === 'text') {
      tabs.push({ id: 'text', label: 'Text' });
    }
    
    return tabs;
  };
  
  // Render effect content based on active tab
  const renderEffectContent = () => {
    switch (activeTab) {
      case 'filters':
        return renderFilters();
      case 'transitions':
        return renderTransitions();
      case 'adjustments':
        return renderAdjustments();
      case 'audio':
        return renderAudioEffects();
      case 'text':
        return renderTextOptions();
      default:
        return null;
    }
  };
  
  // Render filters
  const renderFilters = () => {
    const filters = [
      { id: 'none', name: 'None' },
      { id: 'grayscale', name: 'Grayscale' },
      { id: 'sepia', name: 'Sepia' },
      { id: 'vintage', name: 'Vintage' },
      { id: 'cool', name: 'Cool' },
      { id: 'warm', name: 'Warm' },
      { id: 'dramatic', name: 'Dramatic' }
    ];
    
    return (
      <div className="filters-container">
        <div className="grid grid-cols-2 gap-2 mt-2">
          {filters.map(filter => (
            <motion.div
              key={filter.id}
              className="effect-item text-center p-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-full h-14 mb-1 rounded bg-editor-surface-light flex items-center justify-center">
                {filter.id === 'none' ? (
                  <span className="text-xs text-editor-text-muted">No Filter</span>
                ) : (
                  <span className="text-xs">{filter.name}</span>
                )}
              </div>
              <span className="text-xs">{filter.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render transitions
  const renderTransitions = () => {
    const transitions = [
      { id: 'none', name: 'None' },
      { id: 'fade', name: 'Fade' },
      { id: 'wipe', name: 'Wipe' },
      { id: 'slide', name: 'Slide' },
      { id: 'zoom', name: 'Zoom' },
      { id: 'dissolve', name: 'Dissolve' }
    ];
    
    return (
      <div className="transitions-container">
        {transitions.map(transition => (
          <motion.div
            key={transition.id}
            className="effect-item flex items-center"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 mr-3 rounded bg-editor-surface-light flex items-center justify-center text-editor-text-muted">
              {transition.id === 'fade' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-3.105a3.501 3.501 0 0 0 1.1 1.677A.75.75 0 0 1 13.26 18H6.74a.75.75 0 0 1-.484-1.323A3.501 3.501 0 0 0 7.355 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Zm1.5 0a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H4.25a.75.75 0 0 1-.75-.75v-7.5Z" clipRule="evenodd" />
                </svg>
              )}
              {transition.id === 'none' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              )}
              {!['fade', 'none'].includes(transition.id) && <span>T</span>}
            </div>
            <span>{transition.name}</span>
          </motion.div>
        ))}
      </div>
    );
  };
  
  // Render adjustments (for video)
  const renderAdjustments = () => {
    const adjustments = [
      { id: 'brightness', name: 'Brightness', value: 0 },
      { id: 'contrast', name: 'Contrast', value: 0 },
      { id: 'saturation', name: 'Saturation', value: 0 },
      { id: 'hue', name: 'Hue', value: 0 }
    ];
    
    return (
      <div className="adjustments-container">
        {adjustments.map(adjustment => (
          <div key={adjustment.id} className="adjustment-item mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-sm">{adjustment.name}</label>
              <span className="text-xs text-editor-text-muted">{adjustment.value}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustment.value}
              onChange={() => {}}
              className="w-full"
            />
          </div>
        ))}
      </div>
    );
  };
  
  // Render audio effects
  const renderAudioEffects = () => {
    const audioEffects = [
      { id: 'volume', name: 'Volume', value: 100 },
      { id: 'fadeIn', name: 'Fade In', value: 0 },
      { id: 'fadeOut', name: 'Fade Out', value: 0 }
    ];
    
    return (
      <div className="audio-effects-container">
        {audioEffects.map(effect => (
          <div key={effect.id} className="audio-effect-item mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-sm">{effect.name}</label>
              <span className="text-xs text-editor-text-muted">{effect.value}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={effect.value}
              onChange={() => {}}
              className="w-full"
            />
          </div>
        ))}
      </div>
    );
  };
  
  // Render text options
  const renderTextOptions = () => {
    const fonts = [
      'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New'
    ];
    
    return (
      <div className="text-options-container">
        <div className="mb-4">
          <label className="text-sm block mb-1">Text Content</label>
          <textarea
            className="w-full h-20 bg-editor-surface-light rounded border border-editor-border p-2 text-sm"
            placeholder="Enter text..."
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="text-sm block mb-1">Font</label>
          <select className="w-full bg-editor-surface-light rounded border border-editor-border p-2 text-sm">
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="text-sm block mb-1">Text Color</label>
          <div
            className="w-full h-8 rounded border border-editor-border cursor-pointer"
            style={{ backgroundColor: textColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          ></div>
          
          {showColorPicker && (
            <div className="mt-2">
              <HexColorPicker color={textColor} onChange={setTextColor} />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <button className="btn btn-secondary text-sm flex-1">B</button>
            <button className="btn btn-secondary text-sm flex-1">I</button>
            <button className="btn btn-secondary text-sm flex-1">U</button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="effects-panel">
      <h2 className="text-lg font-semibold mb-2">Effects</h2>
      <p className="text-sm text-editor-text-muted mb-4 truncate">
        Editing: {selectedClip.name}
      </p>
      
      {/* Tabs */}
      <div className="flex border-b border-editor-border mb-4">
        {getTabs().map(tab => (
          <button 
            key={tab.id}
            className={`px-3 py-2 text-sm transition-colors ${
              activeTab === tab.id 
                ? 'text-editor-primary border-b-2 border-editor-primary' 
                : 'text-editor-text-muted hover:text-editor-text'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Effect content based on active tab */}
      <div className="effect-content">
        {renderEffectContent()}
      </div>
    </div>
  );
};

export default EffectsPanel;