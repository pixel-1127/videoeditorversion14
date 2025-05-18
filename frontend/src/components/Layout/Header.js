import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Header = ({ projectName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // In a real app, would save project name to backend
  };

  return (
    <header className="bg-editor-surface h-14 border-b border-editor-border flex items-center justify-between px-4 text-editor-text z-10">
      <div className="flex items-center">
        <motion.div 
          className="mr-4 text-editor-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
          </svg>
        </motion.div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              autoFocus
              className="bg-editor-surface-light border border-editor-primary rounded px-2 py-1 text-sm focus:outline-none"
              onBlur={() => setIsEditing(false)}
            />
          </form>
        ) : (
          <motion.h1 
            className="text-lg font-semibold cursor-pointer"
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.02 }}
          >
            {name}
          </motion.h1>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="btn btn-secondary text-sm">
          <span className="hidden md:inline">New Project</span>
          <span className="md:hidden">New</span>
        </button>
        
        <button className="btn btn-secondary text-sm">
          <span className="hidden md:inline">Open Project</span>
          <span className="md:hidden">Open</span>
        </button>
        
        <button className="btn btn-primary text-sm">
          <span className="hidden md:inline">Save Project</span>
          <span className="md:hidden">Save</span>
        </button>
      </div>
    </header>
  );
};

export default Header;