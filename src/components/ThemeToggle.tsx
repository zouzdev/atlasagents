import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 left-6 z-50 p-1 rounded-full transition-all duration-300 hover:scale-110 ${
        isDark 
          ? 'bg-cream/20 hover:bg-cream/30' 
          : 'bg-dark/20 hover:bg-dark/30'
      }`}
      aria-label="Toggle theme"
    >
      <div className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
        isDark ? 'bg-purple' : 'bg-gray-300'
      }`}>
        {/* Icons positioned on the track */}
        <Sun className={`absolute left-1 top-1 w-6 h-6 transition-opacity duration-300 ${
          isDark ? 'text-white/50' : 'text-yellow-500'
        }`} />
        <Moon className={`absolute right-1 top-1 w-6 h-6 transition-opacity duration-300 ${
          isDark ? 'text-white' : 'text-gray-400'
        }`} />
        
        {/* Sliding thumb */}
        <motion.div
          className="absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-md"
          animate={{
            x: isDark ? 32 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </div>
    </button>
  );
};