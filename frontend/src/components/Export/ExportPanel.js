import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ExportPanel = ({ projectName, isExporting, onExport }) => {
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [fileName, setFileName] = useState(projectName);
  
  // Format options
  const formatOptions = [
    { value: 'mp4', label: 'MP4', icon: 'M' },
    { value: 'webm', label: 'WebM', icon: 'W' },
    { value: 'gif', label: 'GIF', icon: 'G' }
  ];
  
  // Quality presets
  const qualityPresets = [
    { value: 'low', label: 'Low', resolution: '480p', bitrate: '1 Mbps' },
    { value: 'medium', label: 'Medium', resolution: '720p', bitrate: '2 Mbps' },
    { value: 'high', label: 'High', resolution: '1080p', bitrate: '5 Mbps' },
    { value: 'ultra', label: 'Ultra', resolution: '4K', bitrate: '20 Mbps' }
  ];
  
  // Handle export button click
  const handleExport = () => {
    onExport(format, quality);
  };
  
  return (
    <div className="export-panel">
      <h2 className="text-lg font-semibold mb-4">Export Project</h2>
      
      {/* File name */}
      <div className="export-option">
        <label className="block text-sm font-medium mb-1">File Name</label>
        <input
          type="text"
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          className="w-full bg-editor-surface-light border border-editor-border rounded px-3 py-2 text-sm"
        />
      </div>
      
      {/* Format selection */}
      <div className="export-option">
        <label className="block text-sm font-medium mb-2">Format</label>
        <div className="grid grid-cols-3 gap-2">
          {formatOptions.map(option => (
            <button
              key={option.value}
              className={`p-3 rounded border text-center transition-colors ${
                format === option.value
                  ? 'bg-editor-primary bg-opacity-20 border-editor-primary'
                  : 'bg-editor-surface-light border-editor-border hover:border-editor-primary'
              }`}
              onClick={() => setFormat(option.value)}
            >
              <div className="text-lg font-mono mb-1">{option.icon}</div>
              <div className="text-xs">{option.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Quality selection */}
      <div className="export-option">
        <label className="block text-sm font-medium mb-2">Quality</label>
        <div className="space-y-2">
          {qualityPresets.map(preset => (
            <button
              key={preset.value}
              className={`w-full p-2 rounded border text-left transition-colors ${
                quality === preset.value
                  ? 'bg-editor-primary bg-opacity-20 border-editor-primary'
                  : 'bg-editor-surface-light border-editor-border hover:border-editor-primary'
              }`}
              onClick={() => setQuality(preset.value)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{preset.label}</span>
                <span className="text-xs text-editor-text-muted">{preset.resolution}</span>
              </div>
              <div className="text-xs text-editor-text-muted mt-1">
                Bitrate: {preset.bitrate}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Export button */}
      <div className="mt-6">
        <motion.button
          className="btn btn-primary w-full py-3 flex items-center justify-center"
          onClick={handleExport}
          disabled={isExporting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isExporting ? (
            <>
              <div className="loading-spinner w-5 h-5 mr-2"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              <span>Export Video</span>
            </>
          )}
        </motion.button>
      </div>
      
      {/* Format tips */}
      <div className="mt-4 text-xs text-editor-text-muted">
        <p className="mb-1">
          <strong>MP4</strong> - Best for sharing on most platforms and social media
        </p>
        <p className="mb-1">
          <strong>WebM</strong> - Optimized for web playback, smaller file size
        </p>
        <p>
          <strong>GIF</strong> - For short, looping animations (no audio)
        </p>
      </div>
    </div>
  );
};

export default ExportPanel;