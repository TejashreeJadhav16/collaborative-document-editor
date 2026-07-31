import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-slate-950 text-center select-none">
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-5 text-amber-400">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-200 mt-2">Page Not Found</h2>
      <p className="text-slate-400 text-sm mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 mt-6 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/10 hover:shadow-brand-600/20 transition-all"
      >
        <Home className="w-4 h-4" />
        Return Home
      </button>
    </div>
  );
};

export default NotFound;
