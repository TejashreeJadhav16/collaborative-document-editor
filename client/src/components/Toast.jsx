import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
        };
      case 'error':
        return {
          bg: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
          icon: <AlertCircle className="w-5 h-5 text-rose-400" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-950/90 border-sky-500/50 text-sky-200',
          icon: <Info className="w-5 h-5 text-sky-400" />
        };
    }
  };

  const config = getStyle();

  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-in max-w-sm z-50 ${config.bg}`}>
      <div className="flex-shrink-0 mr-3">
        {config.icon}
      </div>
      <div className="flex-grow text-sm font-medium mr-4">
        {message}
      </div>
      <button 
        onClick={onClose} 
        className="flex-shrink-0 text-slate-400 hover:text-white rounded-lg p-0.5 hover:bg-slate-800/40 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
