import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const ContactButton: React.FC = () => {
  const { isDark } = useTheme();

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.button
      onClick={scrollToContact}
      className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
        isDark 
          ? 'bg-dark hover:bg-purple/90 text-white animate-glow' 
          : 'bg-dark hover:bg-purple/90 text-cream'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Scroll to contact form"
    >
      Boek een Demo
    </motion.button>
  );
};