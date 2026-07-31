import React from 'react';
import { Menu, FileCode } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex md:hidden items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800/80 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-855 rounded-lg transition-colors focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-brand-400" />
          <span className="font-bold text-white text-base leading-none">CollabDoc</span>
        </div>
      </div>

      {user && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
          {getInitials(user.name)}
        </div>
      )}
    </header>
  );
};

export default Navbar;
