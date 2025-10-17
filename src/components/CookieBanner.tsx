import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function CookieBanner() {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 pb-5 px-4 sm:px-6 lg:px-8 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div
        className={`max-w-4xl mx-auto ${
          isDark
            ? 'bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 border-gray-700/50'
            : 'bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 border-gray-200/50'
        } backdrop-blur-xl border rounded-2xl shadow-2xl`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div
                className={`p-3 rounded-xl ${
                  isDark
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'bg-blue-500/10 text-blue-600'
                } transition-all duration-300 hover:scale-110`}
              >
                <Cookie className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <h3
                  className={`text-lg font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Cookie-instellingen
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  We gebruiken cookies om jouw ervaring te verbeteren en om
                  inzicht te krijgen in hoe onze website gebruikt wordt. Door op
                  "Accepteren" te klikken, ga je akkoord met het gebruik van alle
                  cookies.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={handleReject}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                } transform hover:scale-105 active:scale-95`}
              >
                Alleen essentiële cookies
              </button>

              <button
                onClick={handleAccept}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Alles accepteren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
